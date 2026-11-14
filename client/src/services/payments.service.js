import { http } from './http';

export const getPaymentConfig = async () => (await http.get('/payments/config')).data.data;
/** Returns { url }: Stripe's hosted payment page. Card details are typed there, never on our site. */
export const createCheckoutSession = async (orderId) =>
  (await http.post(`/payments/orders/${orderId}/session`)).data.data;
