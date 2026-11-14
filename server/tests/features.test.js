import { describe, it, expect } from 'vitest';
import { PassThrough } from 'node:stream';
import request from 'supertest';
import app from '../src/app.js';
import { streamInvoice } from '../src/services/invoice.service.js';
import { orderSchema } from '../src/validators/order.validator.js';

const addr = {
  fullName: 'Amelia Hart',
  phone: '+201000000',
  line1: '1 Corniche',
  city: 'Cairo',
  postalCode: '11511',
  country: 'Egypt',
};
const order = (item = {}, extra = {}) => ({
  items: [{ productId: 'a'.repeat(24), qty: 1, ...item }],
  shippingAddress: addr,
  shippingMethod: 'standard',
  paymentMethod: 'cod',
  ...extra,
});

describe('invoices', () => {
  it('renders a real PDF', async () => {
    const out = new PassThrough();
    const chunks = [];
    out.on('data', (c) => chunks.push(c));
    const done = new Promise((r) => out.on('end', r));
    streamInvoice(
      {
        orderNumber: 'LUM-1',
        createdAt: new Date(),
        items: [{ name: 'Aurelia Sunglass', qty: 2, price: 100, color: 'Black' }],
        subtotal: 200,
        discount: 20,
        shippingCost: 0,
        total: 180,
        paymentMethod: 'cod',
        paymentStatus: 'unpaid',
        shippingAddress: addr,
      },
      { name: 'Amelia', email: 'a@b.com' },
      out,
    );
    await done;
    const pdf = Buffer.concat(chunks);
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdf.length).toBeGreaterThan(1000);
  });
  it('requires sign-in', async () =>
    expect((await request(app).get('/api/orders/' + 'a'.repeat(24) + '/invoice')).status).toBe(
      401,
    ));
});

describe('prescriptions and payment methods', () => {
  it('accepts a valid prescription', () => {
    const rx = {
      type: 'single-vision',
      coating: 'blue-light',
      od: { sph: -1.25, cyl: -0.5, axis: 90 },
      os: { sph: '-1.5' },
      pd: 63,
    };
    const r = orderSchema.safeParse(order({ prescription: rx }));
    expect(r.success).toBe(true);
    expect(r.data.items[0].prescription.os).toMatchObject({ sph: -1.5, cyl: 0 });
  });
  it('rejects impossible prescriptions', () => {
    expect(
      orderSchema.safeParse(
        order({ prescription: { type: 'single-vision', od: { sph: -50 }, os: { sph: 0 } } }),
      ).success,
    ).toBe(false);
    expect(
      orderSchema.safeParse(
        order({ prescription: { type: 'magic', od: { sph: 0 }, os: { sph: 0 } } }),
      ).success,
    ).toBe(false);
  });
  it('allows card payment as a method but nothing else', () => {
    expect(orderSchema.safeParse(order({}, { paymentMethod: 'stripe' })).success).toBe(true);
    expect(orderSchema.safeParse(order({}, { paymentMethod: 'bitcoin' })).success).toBe(false);
  });
});

describe('Stripe wiring (not configured in tests)', () => {
  it('reports card payments as disabled', async () => {
    const res = await request(app).get('/api/payments/config');
    expect(res.body.data.stripe).toBe(false);
  });
  it('refuses webhooks when not configured, using the raw-body route', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('content-type', 'application/json')
      .send('{}');
    expect(res.status).toBe(503);
  });
  it('requires sign-in to start a payment', async () =>
    expect(
      (await request(app).post('/api/payments/orders/' + 'a'.repeat(24) + '/session')).status,
    ).toBe(401));
});

describe('route guards', () => {
  it('does not put a blanket sign-in requirement on unknown or public paths', async () => {
    // Regression: router-wide requireAuth used to turn every later route (even 404s and public pages) into a 401.
    expect((await request(app).get('/api/this-does-not-exist')).status).toBe(404);
  });
  it('still protects review writes and account data', async () => {
    const id = 'a'.repeat(24);
    expect(
      (await request(app).post(`/api/products/${id}/reviews`).send({ rating: 5 })).status,
    ).toBe(401);
    expect((await request(app).put(`/api/reviews/${id}`).send({ rating: 5 })).status).toBe(401);
    expect((await request(app).delete(`/api/reviews/${id}`)).status).toBe(401);
    expect((await request(app).get('/api/wishlist')).status).toBe(401);
  });
});
