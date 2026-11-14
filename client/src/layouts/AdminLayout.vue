<script setup>
import {
  LayoutDashboard,
  Glasses,
  ReceiptText,
  Users,
  TicketPercent,
  Boxes,
  MessageSquare,
  Store,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Glasses },
  { to: '/admin/orders', label: 'Orders', icon: ReceiptText },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
];
</script>

<template>
  <!-- Deliberately different from the storefront: dark sidebar on desktop, scrollable top bar on mobile. -->
  <div class="min-h-screen bg-ivory md:flex">
    <aside
      class="bg-charcoal text-ivory md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:overflow-y-auto"
    >
      <div class="flex items-center justify-between px-5 py-4 md:block md:py-8">
        <p class="font-display text-2xl tracking-brand">LUMIÈRE</p>
        <p class="text-xs text-stone md:mt-1">Admin · {{ auth.user?.name }}</p>
      </div>
      <nav class="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-6" aria-label="Admin">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          :exact-active-class="l.exact ? 'bg-white/10' : ''"
          :active-class="l.exact ? '' : 'bg-white/10'"
          class="flex items-center gap-3 whitespace-nowrap rounded-sm px-3 py-2.5 text-sm hover:bg-white/10"
          ><component :is="l.icon" class="h-4 w-4" aria-hidden="true" />{{ l.label }}</RouterLink
        >
        <RouterLink
          to="/"
          class="flex items-center gap-3 whitespace-nowrap rounded-sm px-3 py-2.5 text-sm text-stone hover:bg-white/10 md:mt-6"
          ><Store class="h-4 w-4" aria-hidden="true" />View storefront</RouterLink
        >
      </nav>
    </aside>
    <main class="min-w-0 flex-1 p-5 sm:p-8">
      <RouterView v-slot="{ Component, route }"
        ><Transition name="page" mode="out-in"
          ><component :is="Component" :key="route.path" /></Transition
      ></RouterView>
    </main>
  </div>
</template>
