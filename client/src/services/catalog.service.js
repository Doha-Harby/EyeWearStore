import { http } from './http';

/** Returns { items, meta } for the product list; empty params are dropped from the URL. */
export async function getProducts(params) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const { data } = await http.get('/products', { params: clean });
  return { items: data.data, meta: data.meta };
}
export const getCategories = async () => (await http.get('/categories')).data.data;
export const getProduct = async (slug) => (await http.get(`/products/${slug}`)).data.data;
