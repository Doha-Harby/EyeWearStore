import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as api from '@/services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const ready = ref(false);
  let initPromise = null;

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => ['admin', 'superadmin'].includes(user.value?.role));

  /** Runs once on app start: asks the server who we are (cookies identify the session). */
  function init() {
    initPromise ??= api
      .getMe()
      .then((u) => (user.value = u))
      .catch(() => (user.value = null))
      .finally(() => (ready.value = true));
    return initPromise;
  }
  const login = async (body) => (user.value = await api.login(body));
  const register = async (body) => (user.value = await api.register(body));
  async function logout() {
    await api.logout().catch(() => {});
    user.value = null;
  }
  return { user, ready, isAuthenticated, isAdmin, init, login, register, logout };
});
