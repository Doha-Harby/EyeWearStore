import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { buildSeedData, CATALOG } from '../src/seedData.js';
import { renderProductSvg } from '../src/utils/productImages.js';
import { ORDER_STATUSES } from '../src/models/Order.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';
import { Review } from '../src/models/Misc.js';

const NOW = Date.UTC(2026, 10, 15);
const d = buildSeedData(NOW);
const round = (n) => Math.round(n * 100) / 100;

describe('demo data: volume and variety', () => {
  it('has a realistic amount of everything', () => {
    expect(d.products).toHaveLength(24);
    expect(d.users.filter((u) => u.role === 'customer').length).toBeGreaterThanOrEqual(8);
    expect(d.orders.length).toBeGreaterThanOrEqual(25);
    expect(d.reviews.length).toBeGreaterThanOrEqual(20);
    expect(d.coupons.length).toBe(5);
  });
  it('covers every order status so every admin screen has something to show', () => {
    const seen = new Set(d.orders.map((o) => o.status));
    for (const s of ORDER_STATUSES) expect(seen.has(s), `missing status ${s}`).toBe(true);
  });
  it('has recent orders so the 14-day revenue chart is not empty', () => {
    expect(
      d.orders.filter((o) => o.createdAt.getTime() > NOW - 14 * 864e5).length,
    ).toBeGreaterThanOrEqual(8);
  });
  it('includes the edge cases: low stock, sold out, deactivated user, hidden review, unverified email', () => {
    expect(d.products.some((p) => p.stock > 0 && p.stock < 5)).toBe(true);
    expect(d.products.some((p) => p.stock === 0)).toBe(true);
    expect(d.users.some((u) => u.isActive === false)).toBe(true);
    expect(d.users.some((u) => u.emailVerified === false)).toBe(true);
    expect(d.reviews.some((r) => r.isHidden)).toBe(true);
    expect(d.orders.some((o) => o.items.some((i) => i.prescription))).toBe(true);
  });
});

describe('demo data: everything adds up', () => {
  it('inventory history always equals current stock, and stock is never negative', () => {
    for (const p of d.products) {
      const sum = d.inventory.filter((t) => t.product === p._id).reduce((n, t) => n + t.delta, 0);
      expect(sum, p.name).toBe(p.stock);
      expect(p.stock).toBeGreaterThanOrEqual(0);
    }
  });
  it('order totals are calculated correctly', () => {
    for (const o of d.orders) {
      const subtotal = round(o.items.reduce((t, i) => t + i.price * i.qty, 0));
      expect(o.subtotal).toBe(subtotal);
      expect(o.total).toBe(round(subtotal - o.discount + o.shippingCost));
      expect(o.shippingCost).toBe(subtotal >= 150 ? 0 : o.shippingMethod === 'express' ? 20 : 8);
    }
  });
  it('payment states match order states', () => {
    for (const o of d.orders) {
      if (o.paymentMethod === 'cod')
        expect(o.paymentStatus).toBe(o.status === 'delivered' ? 'paid' : 'unpaid');
      if (o.status === 'refunded') expect(o.paymentMethod).toBe('stripe');
      if (o.paymentMethod === 'stripe' && o.paymentStatus !== 'unpaid')
        expect(o.paymentRef).toBeTruthy();
      if (o.paymentMethod === 'stripe' && o.status === 'pending')
        expect(o.paymentStatus).toBe('unpaid');
    }
  });
  it('coupon usage counts match the orders that used them', () => {
    for (const c of d.coupons)
      expect(c.usedCount).toBe(d.orders.filter((o) => o.couponCode === c.code).length);
    for (const o of d.orders.filter((x) => x.couponCode))
      expect(d.coupons.find((c) => c.code === o.couponCode).minOrder).toBeLessThanOrEqual(
        o.subtotal,
      );
  });
  it('identifiers are unique', () => {
    for (const list of [
      d.orders.map((o) => o.orderNumber),
      d.products.map((p) => p.slug),
      d.products.map((p) => p.sku),
      d.users.map((u) => u.email),
    ])
      expect(new Set(list).size).toBe(list.length);
  });
  it('reviews: one per user per product, verified ones match a delivered order', () => {
    const pairs = d.reviews.map((r) => `${r.user}:${r.product}`);
    expect(new Set(pairs).size).toBe(pairs.length);
    const delivered = new Set(
      d.orders
        .filter((o) => o.status === 'delivered')
        .flatMap((o) => o.items.map((i) => `${o.user}:${i.product}`)),
    );
    for (const r of d.reviews)
      expect(r.verifiedPurchase).toBe(delivered.has(`${r.user}:${r.product}`));
    for (const r of d.reviews) expect(r.createdAt.getTime()).toBeLessThanOrEqual(NOW);
  });
  it('product ratings match the visible reviews', () => {
    for (const p of d.products) {
      const mine = d.reviews.filter((r) => r.product === p._id && !r.isHidden);
      expect(p.ratingCount).toBe(mine.length);
    }
  });
  it('seeded documents satisfy the real Mongoose schemas', () => {
    expect(d.products.map((p) => new Product(p).validateSync()).filter(Boolean)).toEqual([]);
    expect(d.orders.map((o) => new Order(o).validateSync()).filter(Boolean)).toEqual([]);
    expect(d.reviews.map((r) => new Review(r).validateSync()).filter(Boolean)).toEqual([]);
  });
});

describe('product images', () => {
  it('renders well-formed SVGs for every product and variant', () => {
    for (const c of CATALOG)
      for (const variant of [1, 2]) {
        const svg = renderProductSvg({ ...c, variant });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
        expect((svg.match(/<g[ >]/g) || []).length).toBe((svg.match(/<\/g>/g) || []).length);
      }
  });
  it('are served by the API', async () => {
    const res = await request(app).get(`/api/static/products/${CATALOG[0].slug}-1.svg`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/svg/);
  });
});
