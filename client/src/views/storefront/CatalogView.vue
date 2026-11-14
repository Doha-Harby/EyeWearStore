<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { Search, SearchX } from 'lucide-vue-next';
import ProductCard from '@/components/products/ProductCard.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { getProducts, getCategories } from '@/services/catalog.service';

const filters = reactive({ q: '', category: '', sort: 'newest', page: 1 });
const categories = ref([]);
const products = ref([]);
const meta = ref({ pages: 1, total: 0 });
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    ({ items: products.value, meta: meta.value } = await getProducts({ ...filters, limit: 12 }));
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(async () => {
  getCategories()
    .then((c) => (categories.value = c))
    .catch(() => {});
  load();
});
// Category/sort/page reload immediately; typing in search waits 350ms (debounce) to avoid a request per keystroke.
watch(() => [filters.category, filters.sort, filters.page], load);
watchDebounced(
  () => filters.q,
  () => {
    filters.page = 1;
    load();
  },
  { debounce: 350 },
);
watch(
  () => [filters.category, filters.sort],
  () => (filters.page = 1),
);
const reset = () => Object.assign(filters, { q: '', category: '', sort: 'newest', page: 1 });
</script>

<template>
  <div class="container-page py-12">
    <h1 class="text-5xl">The Collection</h1>
    <div
      class="mt-8 flex flex-col gap-4 border-y border-stone/20 py-4 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-wrap gap-2" role="group" aria-label="Category">
        <button
          v-for="c in [{ slug: '', name: 'All' }, ...categories]"
          :key="c.slug"
          :aria-pressed="filters.category === c.slug"
          :class="[
            'h-9 rounded-sm px-4 text-sm transition-colors',
            filters.category === c.slug ? 'bg-charcoal text-ivory' : 'bg-ivory hover:bg-gold/20',
          ]"
          @click="filters.category = c.slug"
        >
          {{ c.name }}
        </button>
      </div>
      <div class="flex gap-3">
        <div class="relative flex-1 md:w-60">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-deep"
            aria-hidden="true"
          />
          <input
            v-model="filters.q"
            type="search"
            aria-label="Search products"
            placeholder="Search frames"
            class="field h-10 pl-9"
          />
        </div>
        <select v-model="filters.sort" aria-label="Sort by" class="field h-10 w-auto">
          <option value="newest">Newest</option>
          <option value="popular">Most popular</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
      <div v-for="n in 8" :key="n" class="space-y-3">
        <Skeleton class="aspect-[4/5] w-full" /><Skeleton class="h-3 w-1/3" /><Skeleton
          class="h-5 w-2/3"
        />
      </div>
    </div>
    <EmptyState v-else-if="error" title="We couldn't load the collection" :description="error">
      <template #icon><SearchX class="h-7 w-7" /></template>
      <template #action
        ><BaseButton variant="secondary" @click="load">Try again</BaseButton></template
      >
    </EmptyState>
    <EmptyState
      v-else-if="!products.length"
      title="No frames match your search"
      description="Try a different search or clear the filters."
    >
      <template #icon><SearchX class="h-7 w-7" /></template>
      <template #action
        ><BaseButton variant="secondary" @click="reset">Clear filters</BaseButton></template
      >
    </EmptyState>
    <template v-else>
      <p class="mt-6 text-sm text-stone-deep">
        {{ meta.total }} {{ meta.total === 1 ? 'product' : 'products' }}
      </p>
      <div class="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        <ProductCard v-for="p in products" :key="p._id" :product="p" />
      </div>
      <nav
        v-if="meta.pages > 1"
        class="mt-14 flex items-center justify-center gap-4"
        aria-label="Pagination"
      >
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="filters.page <= 1"
          @click="filters.page--"
          >Previous</BaseButton
        >
        <span class="text-sm text-stone-deep">Page {{ filters.page }} of {{ meta.pages }}</span>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="filters.page >= meta.pages"
          @click="filters.page++"
          >Next</BaseButton
        >
      </nav>
    </template>
  </div>
</template>
