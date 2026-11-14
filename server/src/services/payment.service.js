import Stripe from 'stripe';
import { env } from '../config/env.js';
import { Order } from '../models/Order.js';
import { cancelOrder } from './order.service.js';
import { ApiError } from '../utils/ApiError.js';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;
export const paymentsEnabled = () => !!stripe;
const needStripe = () => {
  if (!stripe) throw new ApiError(503, 'Card payments are not configured');
};

/**
 * The charge amount always comes from OUR database total, never from the browser. Card details are
 * typed on Stripe's own page, so they never touch our servers or database.
 */
export async function createCheckoutSession(user, orderId) {
  needStripe();
  const order = await Order.findOne({ _id: orderId, user: user._id });
  if (!order) throw ApiError.notFound('Order not found');
  if (
    order.paymentMethod !== 'stripe' ||
    order.paymentStatus === 'paid' ||
    order.status !== 'pending'
  )
    throw ApiError.conflict('This order cannot be paid');
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    client_reference_id: String(order._id),
    metadata: { orderId: String(order._id) },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(order.total * 100),
          product_data: { name: `LUMIÈRE order ${order.orderNumber}` },
        },
      },
    ],
    success_url: `${env.CLIENT_URL}/account/orders?paid=1`,
    cancel_url: `${env.CLIENT_URL}/account/orders`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // unpaid orders release their stock after 30 minutes
  });
  return { url: session.url };
}

/** Stripe tells us what happened. The signature proves the call really came from Stripe. */
export async function handleWebhook(rawBody, signature) {
  needStripe();
  if (!env.STRIPE_WEBHOOK_SECRET) throw new ApiError(503, 'Webhook secret is not configured');
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw ApiError.badRequest('Invalid signature');
  }
  const obj = event.data.object;
  const orderId = obj.metadata?.orderId;
  if (event.type === 'checkout.session.completed' && obj.payment_status === 'paid') {
    // The `paymentStatus: 'unpaid'` condition makes this safe if Stripe retries the same event.
    await Order.updateOne(
      { _id: orderId, paymentStatus: 'unpaid' },
      { paymentStatus: 'paid', status: 'confirmed', paymentRef: obj.payment_intent },
    );
  }
  if (event.type === 'checkout.session.expired') {
    const order = await Order.findOne({ _id: orderId, paymentStatus: 'unpaid', status: 'pending' });
    if (order) await cancelOrder({ role: 'admin', _id: order.user }, orderId); // releases the reserved stock
  }
}

export async function refundOrder(order) {
  needStripe();
  if (!order.paymentRef) throw ApiError.conflict('No card payment found to refund');
  await stripe.refunds.create({ payment_intent: order.paymentRef });
}
