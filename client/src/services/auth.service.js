import { http } from './http';

const data = (p) => p.then((r) => r.data);
export const login = (body) => data(http.post('/auth/login', body)).then((d) => d.data.user);
export const register = (body) => data(http.post('/auth/register', body)).then((d) => d.data.user);
export const logout = () => http.post('/auth/logout');
export const getMe = () => data(http.get('/auth/me')).then((d) => d.data.user);
export const verifyEmail = (token) => http.post('/auth/verify-email', { token });
export const forgotPassword = (email) => http.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) =>
  http.post('/auth/reset-password', { token, password });
