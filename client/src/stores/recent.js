import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

/** Remembers the last 8 products you looked at (in this browser only). */
export const useRecentStore = defineStore('recent', () => {
  const items = useStorage('lumiere-recent', []);
  function track(p) {
    const summary = {
      _id: p._id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
      images: p.images?.slice(0, 1) ?? [],
      brand: { name: p.brand?.name },
    };
    items.value = [summary, ...items.value.filter((x) => x._id !== p._id)].slice(0, 8);
  }
  return { items, track };
});
