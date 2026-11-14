import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '../src/stores/cart';

const item = (o = {}) => ({
  productId: 'p1',
  slug: 'a',
  name: 'Aurelia',
  price: 100,
  stock: 3,
  qty: 1,
  color: 'Black',
  ...o,
});
let cart;
beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  cart = useCartStore();
});

describe('cart store', () => {
  it('merges the same product and colour into one line', () => {
    cart.add(item());
    cart.add(item());
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(2);
  });
  it('keeps different colours as separate lines', () => {
    cart.add(item());
    cart.add(item({ color: 'Gold' }));
    expect(cart.items).toHaveLength(2);
  });
  it('never lets quantity exceed stock', () => {
    cart.add(item({ qty: 2 }));
    cart.add(item({ qty: 5 }));
    expect(cart.items[0].qty).toBe(3);
    cart.setQty(cart.items[0], 99);
    expect(cart.items[0].qty).toBe(3);
  });
  it('totals count and subtotal', () => {
    cart.add(item({ qty: 2 }));
    cart.add(item({ productId: 'p2', price: 50 }));
    expect(cart.count).toBe(3);
    expect(cart.subtotal).toBe(250);
  });
  it('removes items and clears', () => {
    cart.add(item());
    cart.remove(cart.items[0]);
    expect(cart.items).toHaveLength(0);
    cart.add(item());
    cart.clear();
    expect(cart.count).toBe(0);
  });
});
