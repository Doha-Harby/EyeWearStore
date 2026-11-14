import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';

/**
 * The cart lives in the browser (localStorage via VueUse, so it survives refreshes). Prices stored
 * here are for DISPLAY only: the server recalculates everything from the database at checkout.
 */
export const useCartStore = defineStore('cart', () => {
  const items = useStorage('lumiere-cart', []);
  const key = (i) =>
    `${i.productId}:${i.color || ''}:${i.prescription ? JSON.stringify(i.prescription) : ''}`;
  const count = computed(() => items.value.reduce((n, i) => n + i.qty, 0));
  const subtotal = computed(() => items.value.reduce((n, i) => n + i.price * i.qty, 0));

  function add(item) {
    const existing = items.value.find((i) => key(i) === key(item));
    if (existing) existing.qty = Math.min(existing.qty + item.qty, item.stock, 10);
    else items.value.push({ ...item, qty: Math.min(item.qty, item.stock, 10) });
  }
  const setQty = (item, qty) => (item.qty = Math.max(1, Math.min(qty, item.stock, 10)));
  const remove = (item) => (items.value = items.value.filter((i) => key(i) !== key(item)));
  const clear = () => (items.value = []);
  return { items, count, subtotal, add, setQty, remove, clear };
});
