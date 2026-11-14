<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Menu, X } from 'lucide-vue-next';
import AuthMenu from '@/components/layout/AuthMenu.vue';
import BrandLogo from '@/components/layout/BrandLogo.vue';

const route = useRoute();
const open = ref(false);
// Nav grows as pages are built. Only real, working routes are listed.
const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
];
watch(
  () => route.fullPath,
  () => (open.value = false),
); // close mobile menu after navigating
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <div class="bg-charcoal px-4 py-2 text-center text-xs tracking-wider text-ivory">
      Complimentary shipping on orders over $150
    </div>

    <header class="sticky top-0 z-40 border-b border-stone/20 bg-white/95 backdrop-blur">
      <div class="container-page flex h-20 items-center justify-between">
        <BrandLogo />
        <nav class="hidden items-center gap-10 md:flex" aria-label="Primary">
          <RouterLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            class="text-sm text-stone-deep transition-colors hover:text-charcoal"
            active-class="!text-charcoal"
            exact-active-class="!text-charcoal"
          >
            {{ l.label }}
          </RouterLink>
        </nav>
        <AuthMenu class="hidden md:flex" />
        <button
          class="md:hidden"
          :aria-expanded="open"
          aria-controls="mobile-nav"
          :aria-label="open ? 'Close menu' : 'Open menu'"
          @click="open = !open"
        >
          <component :is="open ? X : Menu" class="h-6 w-6" />
        </button>
      </div>
      <nav
        v-if="open"
        id="mobile-nav"
        class="border-t border-stone/20 bg-white md:hidden"
        aria-label="Mobile"
      >
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="container-page block py-4 text-sm"
          >{{ l.label }}</RouterLink
        >
        <AuthMenu class="container-page py-4" />
      </nav>
    </header>

    <main class="flex-1">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="r.path" />
        </Transition>
      </RouterView>
    </main>

    <footer class="bg-charcoal text-ivory">
      <div
        class="container-page flex flex-col gap-4 py-14 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p class="font-display text-3xl tracking-brand">LUMIÈRE</p>
          <p class="mt-3 max-w-xs text-sm text-stone">
            Considered eyewear, made to be worn for a lifetime.
          </p>
        </div>
        <p class="text-xs text-stone">
          © {{ new Date().getFullYear() }} LUMIÈRE. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
