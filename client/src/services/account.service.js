import { http } from './http';

const d = (p) => p.then((r) => r.data.data);
export const getWishlist = () => d(http.get('/wishlist'));
export const addToWishlist = (id) => http.post(`/wishlist/${id}`);
export const removeFromWishlist = (id) => http.delete(`/wishlist/${id}`);
export const updateProfile = (body) => d(http.patch('/account/profile', body)).then((x) => x.user);
export const changePassword = (body) => http.post('/account/password', body);
export const getAddresses = () => d(http.get('/account/addresses'));
export const saveAddress = (id, body) =>
  d(id ? http.put(`/account/addresses/${id}`, body) : http.post('/account/addresses', body));
export const deleteAddress = (id) => http.delete(`/account/addresses/${id}`);
export const getReviews = (productId) => d(http.get(`/products/${productId}/reviews`));
export const createReview = (productId, body) =>
  d(http.post(`/products/${productId}/reviews`, body));
export const updateReview = (id, body) => d(http.put(`/reviews/${id}`, body));
export const deleteReview = (id) => http.delete(`/reviews/${id}`);
