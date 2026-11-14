<script setup>
import { ref, watch } from 'vue';
import ProductCard from './ProductCard.vue';
import { getRelated } from '@/services/catalog.service';

const props = defineProps({ slug: { type: String, required: true } });
const items = ref([]);
watch(
  () => props.slug,
  async (s) => {
    items.value = await getRelated(s).catch(() => []);
  },
  { immediate: true },
);
</script>

<template>
  <section v-if="items.length" aria-labelledby="rel-h">
    <h2 id="rel-h" class="text-4xl">You may also like</h2>
    <div class="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
      <ProductCard v-for="p in items" :key="p._id" :product="p" />
    </div>
  </section>
</template>
