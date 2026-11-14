import { http } from './http';

export const createOrder = async (body) => (await http.post('/orders', body)).data.data;
export const getMyOrders = async () => (await http.get('/orders/my-orders')).data.data;
export const cancelOrder = async (id) => (await http.post(`/orders/${id}/cancel`)).data.data;
export const validateCoupon = async (code, subtotal) =>
  (await http.post('/coupons/validate', { code, subtotal })).data.data;
