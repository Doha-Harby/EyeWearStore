import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from './auth';
import * as api from '@/services/account.service';

export const useWishlistStore = defineStore('wishlist', () => {
  const auth = useAuthStore();
  const items = ref([]);
  const ids = computed(() => new Set(items.value.map((p) => p._id)));

  async function load() {
    items.value = auth.isAuthenticated ? await api.getWishlist().catch(() => []) : [];
  }
  // Reload whenever someone signs in or out.
  watch(() => auth.user?._id, load, { immediate: true });

  const has = (id) => ids.value.has(id);
  async function toggle(product) {
    if (has(product._id)) {
      items.value = items.value.filter((p) => p._id !== product._id); // optimistic: update the UI first
      await api.removeFromWishlist(product._id).catch(load);
    } else {
      items.value = [...items.value, product];
      await api.addToWishlist(product._id).catch(load);
    }
  }
  return { items, has, toggle, load };
});
