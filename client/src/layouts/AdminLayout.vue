<script setup>
import { LayoutDashboard, ReceiptText, Store } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/orders', label: 'Orders', icon: ReceiptText },
];
</script>

<template>
  <!-- Deliberately different from the storefront: dark sidebar on desktop, compact top bar on mobile. -->
  <div class="min-h-screen bg-ivory md:flex">
    <aside class="bg-charcoal text-ivory md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
      <div class="flex items-center justify-between px-5 py-4 md:block md:py-8">
        <p class="font-display text-2xl tracking-brand">LUMIÈRE</p>
        <p class="text-xs text-stone md:mt-1">Admin · {{ auth.user?.name }}</p>
      </div>
      <nav class="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0" aria-label="Admin">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          :exact-active-class="l.exact ? 'bg-white/10' : ''"
          :active-class="l.exact ? '' : 'bg-white/10'"
          class="flex items-center gap-3 whitespace-nowrap rounded-sm px-3 py-2.5 text-sm hover:bg-white/10"
        >
          <component :is="l.icon" class="h-4 w-4" aria-hidden="true" />{{ l.label }}
        </RouterLink>
        <RouterLink
          to="/"
          class="flex items-center gap-3 whitespace-nowrap rounded-sm px-3 py-2.5 text-sm text-stone hover:bg-white/10 md:mt-8"
          ><Store class="h-4 w-4" aria-hidden="true" />View storefront</RouterLink
        >
      </nav>
    </aside>
    <main class="min-w-0 flex-1 p-5 sm:p-8">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in"
          ><component :is="Component" :key="route.path"
        /></Transition>
      </RouterView>
    </main>
  </div>
</template>
