import { http } from './http';

export const getDashboard = async () => (await http.get('/admin/dashboard')).data.data;
export async function getAdminOrders(params) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const { data } = await http.get('/admin/orders', { params: clean });
  return { items: data.data, meta: data.meta };
}
export const setOrderStatus = async (id, status) =>
  (await http.patch(`/admin/orders/${id}/status`, { status })).data.data;

export async function getAdminProducts(params) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const { data } = await http.get('/admin/products', { params: clean });
  return { items: data.data, meta: data.meta };
}
export const createProduct = async (body) => (await http.post('/admin/products', body)).data.data;
export const updateProduct = async (id, body) =>
  (await http.put(`/admin/products/${id}`, body)).data.data;
export const deleteProduct = (id) => http.delete(`/admin/products/${id}`);
export const restoreProduct = (id) => http.post(`/admin/products/${id}/restore`);
export const adjustStock = async (id, body) =>
  (await http.post(`/admin/products/${id}/stock`, body)).data.data;

const list = async (url, params) => {
  const { data } = await http.get(url, {
    params: Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== '' && v != null),
    ),
  });
  return { items: data.data, meta: data.meta };
};
export const getCustomers = (p) => list('/admin/customers', p);
export const updateCustomer = async (id, body) =>
  (await http.patch(`/admin/customers/${id}`, body)).data.data;
export const getCoupons = async () => (await http.get('/admin/coupons')).data.data;
export const createCoupon = (body) => http.post('/admin/coupons', body);
export const updateCoupon = (id, body) => http.patch(`/admin/coupons/${id}`, body);
export const deleteCoupon = (id) => http.delete(`/admin/coupons/${id}`);
export const getInventory = async () => (await http.get('/admin/inventory')).data.data;
export const getAdminReviews = (p) => list('/admin/reviews', p);
export const hideReview = (id, isHidden) => http.patch(`/admin/reviews/${id}`, { isHidden });
