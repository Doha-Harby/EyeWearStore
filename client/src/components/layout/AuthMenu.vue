<script setup>
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';

const auth = useAuthStore();
const cart = useCartStore();
const router = useRouter();
const toast = useToast();

async function signOut() {
  await auth.logout();
  toast.info('You have been signed out');
  router.push('/');
}
</script>

<template>
  <div class="flex items-center gap-5 text-sm">
    <RouterLink to="/cart" class="underline-offset-4 hover:underline"
      >Cart ({{ cart.count }})</RouterLink
    >
    <RouterLink
      v-if="auth.isAuthenticated"
      to="/account/orders"
      class="underline-offset-4 hover:underline"
      >Orders</RouterLink
    >
    <template v-if="auth.isAuthenticated">
      <span class="text-stone-deep">{{ auth.user.name.split(' ')[0] }}</span>
      <button class="underline-offset-4 hover:underline" @click="signOut">Sign out</button>
    </template>
    <template v-else-if="auth.ready">
      <RouterLink to="/login" class="underline-offset-4 hover:underline">Sign in</RouterLink>
    </template>
  </div>
</template>
