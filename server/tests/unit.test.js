import { describe, it, expect } from 'vitest';
import { computeDiscount } from '../src/services/order.service.js';
import { canTransition, fillDays } from '../src/services/admin.service.js';
import { productInput, stockSchema, couponInput } from '../src/validators/admin.validator.js';
import { registerSchema } from '../src/validators/auth.validator.js';
import { orderSchema } from '../src/validators/order.validator.js';
import { reviewSchema } from '../src/validators/account.validator.js';
import { slugify } from '../src/utils/slug.js';

const id = 'a'.repeat(24);
const coupon = { isActive: true, type: 'percent', value: 10, minOrder: 50, usedCount: 0 };

describe('coupons', () => {
  it('calculates percent and fixed discounts', () => {
    expect(computeDiscount(coupon, 200)).toBe(20);
    expect(computeDiscount({ ...coupon, type: 'fixed', value: 30 }, 100)).toBe(30);
    expect(computeDiscount({ ...coupon, type: 'fixed', value: 30 }, 20 + 30)).toBe(30);
  });
  it('never discounts more than the subtotal', () =>
    expect(computeDiscount({ ...coupon, type: 'fixed', value: 500, minOrder: 0 }, 80)).toBe(80));
  it.each([
    ['inactive', { isActive: false }],
    ['expired', { expiresAt: new Date(0) }],
    ['used up', { usageLimit: 1, usedCount: 1 }],
  ])('rejects %s coupons', (_n, patch) => {
    expect(() => computeDiscount({ ...coupon, ...patch }, 100)).toThrow();
  });
  it('enforces the minimum order', () =>
    expect(() => computeDiscount(coupon, 20)).toThrow(/at least/));
});

describe('order workflow', () => {
  it('allows only legal transitions', () => {
    expect(canTransition('pending', 'confirmed')).toBe(true);
    expect(canTransition('shipped', 'delivered')).toBe(true);
    expect(canTransition('delivered', 'pending')).toBe(false);
    expect(canTransition('shipped', 'cancelled')).toBe(false);
    expect(canTransition('cancelled', 'confirmed')).toBe(false);
  });
  it('fills empty chart days with zeros', () => {
    const days = fillDays(
      [{ _id: '2026-11-13', revenue: 250, orders: 2 }],
      14,
      new Date('2026-11-13T10:00:00Z'),
    );
    expect(days).toHaveLength(14);
    expect(days[13]).toMatchObject({ date: '2026-11-13', revenue: 250 });
    expect(days[0].revenue).toBe(0);
  });
});

describe('validation', () => {
  it('registration ignores a sneaky role field', () => {
    const r = registerSchema.parse({
      name: 'Amelia',
      email: 'A@B.com',
      password: 'longenough',
      role: 'superadmin',
    });
    expect(r.role).toBeUndefined();
    expect(r.email).toBe('a@b.com');
  });
  it('rejects short passwords', () =>
    expect(
      registerSchema.safeParse({ name: 'Amelia', email: 'a@b.com', password: '123' }).success,
    ).toBe(false));
  it('treats empty form fields as missing', () => {
    const p = productInput.parse({
      name: 'Frame',
      sku: 'x-1',
      brand: id,
      category: id,
      price: '120',
      discountPrice: '',
      frameShape: '',
    });
    expect(p.discountPrice).toBeUndefined();
    expect(p.frameShape).toBeUndefined();
  });
  it('rejects bad images, zero stock changes and oversized quantities', () => {
    expect(
      productInput.safeParse({
        name: 'F',
        sku: 'x',
        brand: id,
        category: id,
        price: 1,
        images: ['nope'],
      }).success,
    ).toBe(false);
    expect(stockSchema.safeParse({ delta: 0 }).success).toBe(false);
    const addr = {
      fullName: 'Amelia Hart',
      phone: '+201000000',
      line1: '1 Corniche',
      city: 'Cairo',
      postalCode: '11511',
      country: 'Egypt',
    };
    const order = {
      items: [{ productId: id, qty: 2 }],
      shippingAddress: addr,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    };
    expect(orderSchema.safeParse(order).success).toBe(true);
    expect(orderSchema.safeParse({ ...order, items: [{ productId: id, qty: 99 }] }).success).toBe(
      false,
    );
    expect(orderSchema.safeParse({ ...order, paymentMethod: 'card' }).success).toBe(false);
  });
  it('coupons are uppercased and percent is capped', () => {
    expect(couponInput.parse({ code: 'save10', type: 'percent', value: 10 }).code).toBe('SAVE10');
    expect(couponInput.safeParse({ code: 'BIG', type: 'percent', value: 150 }).success).toBe(false);
  });
  it('reviews need a 1-5 rating', () => {
    expect(reviewSchema.safeParse({ rating: 5 }).success).toBe(true);
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });
  it('slugifies accents', () =>
    expect(slugify('Parisienne Eyeglass — Café')).toBe('parisienne-eyeglass-cafe'));
});
