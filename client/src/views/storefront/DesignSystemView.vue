<script setup>
import { ref, onMounted } from 'vue';
import { PackageOpen } from 'lucide-vue-next';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseBadge from '@/components/common/BaseBadge.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ProductImage from '@/components/common/ProductImage.vue';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import { getHealth } from '@/services/health.service';

const toast = useToast();
const { confirm } = useConfirm();
const email = ref('');
const loading = ref(false);
const health = ref(null);
const healthError = ref('');

// Proves the full chain works: Vue → Axios → Vite proxy → Express → (Mongo status).
onMounted(async () => {
  try {
    health.value = await getHealth();
  } catch (e) {
    healthError.value = e.message;
  }
});

function fakeSave() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    toast.success('Changes saved');
  }, 1200);
}
async function askDelete() {
  const ok = await confirm({
    title: 'Delete this product?',
    message: 'This moves it to the trash. You can restore it later.',
    confirmText: 'Delete',
    tone: 'danger',
  });
  ok ? toast.info('Confirmed') : toast.info('Cancelled');
}
</script>

<template>
  <div class="container-page space-y-14 py-14">
    <header>
      <p class="eyebrow">PHASE 1</p>
      <h1 class="mt-3 text-5xl">Design system</h1>
      <p class="mt-3 text-stone-deep">
        Every shared component, live. Later phases compose pages from these.
      </p>
    </header>

    <section aria-labelledby="ds-api">
      <h2 id="ds-api" class="mb-4 text-3xl">API connection</h2>
      <Skeleton v-if="!health && !healthError" class="h-8 w-64" />
      <div v-else-if="health" class="flex flex-wrap gap-3">
        <BaseBadge tone="success">API: {{ health.status }}</BaseBadge>
        <BaseBadge :tone="health.database === 'connected' ? 'success' : 'warning'"
          >Database: {{ health.database }}</BaseBadge
        >
      </div>
      <BaseBadge v-else tone="danger">{{ healthError }} — is the server running?</BaseBadge>
    </section>

    <section aria-labelledby="ds-btn">
      <h2 id="ds-btn" class="mb-4 text-3xl">Buttons</h2>
      <div class="flex flex-wrap items-center gap-3">
        <BaseButton>Primary</BaseButton>
        <BaseButton variant="secondary">Secondary</BaseButton>
        <BaseButton variant="gold">Gold</BaseButton>
        <BaseButton variant="ghost">Ghost</BaseButton>
        <BaseButton size="sm">Small</BaseButton>
        <BaseButton :loading="loading" @click="fakeSave">Save changes</BaseButton>
        <BaseButton disabled>Disabled</BaseButton>
      </div>
    </section>

    <section aria-labelledby="ds-in" class="max-w-md">
      <h2 id="ds-in" class="mb-4 text-3xl">Inputs</h2>
      <div class="space-y-5">
        <BaseInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          hint="We never share your email."
        />
        <BaseInput
          label="Password"
          type="password"
          error="Password must be at least 8 characters"
        />
      </div>
    </section>

    <section aria-labelledby="ds-badge">
      <h2 id="ds-badge" class="mb-4 text-3xl">Badges</h2>
      <div class="flex flex-wrap gap-2">
        <BaseBadge>Neutral</BaseBadge><BaseBadge tone="gold">New</BaseBadge
        ><BaseBadge tone="dark">Bestseller</BaseBadge>
        <BaseBadge tone="success">Delivered</BaseBadge
        ><BaseBadge tone="warning">Low stock</BaseBadge
        ><BaseBadge tone="danger">Cancelled</BaseBadge>
      </div>
    </section>

    <section aria-labelledby="ds-fb">
      <h2 id="ds-fb" class="mb-4 text-3xl">Feedback</h2>
      <div class="flex flex-wrap gap-3">
        <BaseButton variant="secondary" @click="toast.success('Added to wishlist')"
          >Success toast</BaseButton
        >
        <BaseButton variant="secondary" @click="toast.error('Payment could not be processed')"
          >Error toast</BaseButton
        >
        <BaseButton variant="secondary" @click="askDelete">Confirm dialog</BaseButton>
      </div>
    </section>

    <section aria-labelledby="ds-state" class="grid gap-10 md:grid-cols-2">
      <div>
        <h2 id="ds-state" class="mb-4 text-3xl">Loading &amp; image fallback</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-3">
            <Skeleton class="aspect-[4/5] w-full" /><Skeleton class="h-4 w-2/3" /><Skeleton
              class="h-4 w-1/3"
            />
          </div>
          <ProductImage alt="Fallback preview" />
        </div>
      </div>
      <div class="border border-stone/20">
        <EmptyState title="Your cart is empty" description="Frames you add will appear here.">
          <template #icon><PackageOpen class="h-7 w-7" /></template>
          <template #action
            ><BaseButton variant="secondary">Explore collection</BaseButton></template
          >
        </EmptyState>
      </div>
    </section>
  </div>
</template>
