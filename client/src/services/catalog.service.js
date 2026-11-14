import { http } from './http';

/** Returns { items, meta } for the product list; empty params are dropped from the URL. */
export async function getProducts(params) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const { data } = await http.get('/products', { params: clean });
  return { items: data.data, meta: data.meta };
}
export const getCategories = async () => (await http.get('/categories')).data.data;
export const getProduct = async (slug) => (await http.get(`/products/${slug}`)).data.data;
export const getBrands = async () => (await http.get('/brands')).data.data;
export const subscribe = (email) => http.post('/newsletter', { email });
export const getRelated = async (slug) => (await http.get(`/products/${slug}/related`)).data.data;
