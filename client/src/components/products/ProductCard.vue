<script setup>
import ProductImage from '@/components/common/ProductImage.vue';
import BaseBadge from '@/components/common/BaseBadge.vue';

defineProps({ product: { type: Object, required: true } });
const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
</script>

<template>
  <RouterLink :to="`/product/${product.slug}`" class="group block">
    <div class="relative">
      <div class="overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
        <ProductImage :src="product.images?.[0]" :alt="product.name" />
      </div>
      <BaseBadge v-if="product.stock === 0" class="absolute left-3 top-3" tone="dark"
        >Sold out</BaseBadge
      >
      <BaseBadge v-else-if="product.discountPrice" class="absolute left-3 top-3" tone="gold"
        >Sale</BaseBadge
      >
    </div>
    <p class="mt-4 text-xs text-stone-deep">{{ product.brand?.name }}</p>
    <h3 class="mt-1 text-xl">{{ product.name }}</h3>
    <p class="mt-1 text-sm">
      <template v-if="product.discountPrice">
        <span class="mr-2">{{ money(product.discountPrice) }}</span><span
          class="text-stone-deep line-through"
          >{{ money(product.price) }}</span
        >
      </template>
      <template v-else>{{ money(product.price) }}</template>
    </p>
  </RouterLink>
</template>
