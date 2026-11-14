<script setup>
import { computed } from 'vue';
import ProductCard from './ProductCard.vue';
import { useRecentStore } from '@/stores/recent';

const props = defineProps({ exclude: { type: String, default: '' } });
const recent = useRecentStore();
const items = computed(() => recent.items.filter((p) => p._id !== props.exclude).slice(0, 4));
</script>

<template>
  <section v-if="items.length" aria-labelledby="rv-h">
    <h2 id="rv-h" class="text-4xl">Recently viewed</h2>
    <div class="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
      <ProductCard v-for="p in items" :key="p._id" :product="p" />
    </div>
  </section>
</template>
