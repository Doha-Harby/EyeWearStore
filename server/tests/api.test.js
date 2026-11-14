import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

// These run without a database: they prove the security layer rejects requests BEFORE any data is touched.
describe('API security', () => {
  it('health check works', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });
  it.each([
    ['get', '/api/auth/me'],
    ['get', '/api/orders/my-orders'],
    ['post', '/api/orders'],
    ['get', '/api/wishlist'],
    ['get', '/api/account/addresses'],
    ['post', '/api/products/' + 'a'.repeat(24) + '/reviews'],
    ['get', '/api/admin/dashboard'],
    ['get', '/api/admin/products'],
    ['post', '/api/admin/coupons'],
    ['get', '/api/admin/customers'],
  ])('%s %s requires sign-in', async (method, url) => {
    expect((await request(app)[method](url)).status).toBe(401);
  });
  it('rejects a forged access cookie', async () => {
    expect(
      (
        await request(app)
          .get('/api/admin/dashboard')
          .set('Cookie', 'accessToken=forged.token.here')
      ).status,
    ).toBe(401);
  });
  it('returns field errors for invalid registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'x', password: '1', role: 'admin' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors)).toEqual(
      expect.arrayContaining(['name', 'email', 'password']),
    );
  });
  it('returns JSON 404s and rejects malformed JSON', async () => {
    expect((await request(app).get('/api/nope')).body.success).toBe(false);
    expect(
      (
        await request(app)
          .post('/api/auth/login')
          .set('content-type', 'application/json')
          .send('{bad')
      ).status,
    ).toBe(400);
  });
  it('validates catalog query limits', async () => {
    expect((await request(app).get('/api/products?limit=999')).status).toBe(400);
  });
});
