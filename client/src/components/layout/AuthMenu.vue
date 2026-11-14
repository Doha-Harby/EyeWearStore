<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/composables/useToast';

const auth = useAuthStore();
const cart = useCartStore();
const router = useRouter();
const toast = useToast();
const link = 'underline-offset-4 hover:underline';

async function signOut() {
  await auth.logout();
  toast.info('You have been signed out');
  router.push('/');
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-5 text-sm">
    <RouterLink to="/cart" :class="link">Cart ({{ cart.count }})</RouterLink>
    <template v-if="auth.isAuthenticated">
      <RouterLink to="/wishlist" :class="link">Wishlist</RouterLink>
      <RouterLink to="/account" :class="link">{{ auth.user.name.split(' ')[0] }}</RouterLink>
      <RouterLink v-if="auth.isAdmin" to="/admin" :class="link">Admin</RouterLink>
      <button :class="link" @click="signOut">Sign out</button>
    </template>
    <RouterLink v-else-if="auth.ready" to="/login" :class="link">Sign in</RouterLink>
  </div>
</template>
