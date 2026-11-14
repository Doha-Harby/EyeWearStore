import { http } from './http';

export const getDashboard = async () => (await http.get('/admin/dashboard')).data.data;
export async function getAdminOrders(params) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const { data } = await http.get('/admin/orders', { params: clean });
  return { items: data.data, meta: data.meta };
}
export const setOrderStatus = async (id, status) =>
  (await http.patch(`/admin/orders/${id}/status`, { status })).data.data;
