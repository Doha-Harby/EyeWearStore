<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { watchDebounced } from '@vueuse/core';
import { Search, SearchX, LayoutGrid, List, SlidersHorizontal } from 'lucide-vue-next';
import ProductCard from '@/components/products/ProductCard.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { getProducts, getCategories, getBrands } from '@/services/catalog.service';

const FACETS = [
  {
    key: 'shape',
    label: 'Frame shape',
    options: ['round', 'square', 'rectangle', 'aviator', 'cat-eye', 'wayfarer', 'oval'],
  },
  {
    key: 'material',
    label: 'Material',
    options: ['Acetate', 'Metal', 'Titanium', 'Leather', 'Textile'],
  },
  { key: 'gender', label: 'Gender', options: ['men', 'women', 'unisex'] },
  {
    key: 'color',
    label: 'Colour',
    options: ['Black', 'Tortoise', 'Gold', 'Silver', 'Navy', 'Clear'],
  },
];
const route = useRoute(); // lets the homepage link to /shop?category=sunglasses
const blank = () => ({
  q: '',
  category: route.query.category || '',
  sort: route.query.sort || 'newest',
  page: 1,
  brand: [],
  shape: [],
  material: [],
  gender: [],
  color: [],
  minPrice: '',
  maxPrice: '',
});
const filters = reactive(blank());
const categories = ref([]);
const brands = ref([]);
const products = ref([]);
const meta = ref({ pages: 1, total: 0 });
const loading = ref(true);
const error = ref('');
const view = ref('grid');
const showFilters = ref(false);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    // Arrays become comma-separated lists, which is what the API expects.
    const params = {
      ...filters,
      limit: 12,
      brand: filters.brand.join(','),
      shape: filters.shape.join(','),
      material: filters.material.join(','),
      gender: filters.gender.join(','),
      color: filters.color.join(','),
    };
    ({ items: products.value, meta: meta.value } = await getProducts(params));
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(() => {
  getCategories()
    .then((c) => (categories.value = c))
    .catch(() => {});
  getBrands()
    .then((b) => (brands.value = b))
    .catch(() => {});
  load();
});
// Any filter change (except typing in the search box) jumps back to page 1 and reloads.
const facetKey = computed(() =>
  JSON.stringify([
    filters.category,
    filters.sort,
    filters.brand,
    filters.shape,
    filters.material,
    filters.gender,
    filters.color,
    filters.minPrice,
    filters.maxPrice,
  ]),
);
watch([facetKey, () => filters.page], ([k], [oldK]) => {
  if (k !== oldK) filters.page = 1;
  load();
});
watchDebounced(
  () => [filters.q, filters.minPrice, filters.maxPrice],
  () => {
    filters.page = 1;
    load();
  },
  { debounce: 400 },
);
const reset = () => Object.assign(filters, blank(), { category: '', sort: 'newest' });
const activeCount = computed(
  () =>
    ['brand', 'shape', 'material', 'gender', 'color'].reduce((n, k) => n + filters[k].length, 0) +
    (filters.minPrice !== '' || filters.maxPrice !== '' ? 1 : 0),
);
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
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 md:w-56">
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
        <div class="flex" role="group" aria-label="View">
          <button
            v-for="[v, icon, l] in [
              ['grid', LayoutGrid, 'Grid view'],
              ['list', List, 'List view'],
            ]"
            :key="v"
            :aria-label="l"
            :aria-pressed="view === v"
            :class="[
              'flex h-10 w-10 items-center justify-center',
              view === v ? 'bg-charcoal text-ivory' : 'bg-ivory',
            ]"
            @click="view = v"
          >
            <component :is="icon" class="h-4 w-4" />
          </button>
        </div>
        <BaseButton
          variant="secondary"
          size="sm"
          class="h-10 lg:hidden"
          :aria-expanded="showFilters"
          @click="showFilters = !showFilters"
          ><SlidersHorizontal class="h-4 w-4" aria-hidden="true" />Filters<template
            v-if="activeCount"
          >
            ({{ activeCount }})</template
          ></BaseButton
        >
      </div>
    </div>

    <div class="mt-8 grid gap-10 lg:grid-cols-[14rem_1fr]">
      <aside
        :class="[showFilters ? 'block' : 'hidden', 'space-y-7 text-sm lg:block']"
        aria-label="Filters"
      >
        <fieldset>
          <legend class="mb-3 font-medium">Brand</legend>
          <label v-for="b in brands" :key="b._id" class="flex items-center gap-2 py-1"
            ><input v-model="filters.brand" type="checkbox" :value="b.slug" /> {{ b.name }}</label
          >
        </fieldset>
        <fieldset v-for="f in FACETS" :key="f.key">
          <legend class="mb-3 font-medium">{{ f.label }}</legend>
          <label v-for="o in f.options" :key="o" class="flex items-center gap-2 py-1 capitalize"
            ><input v-model="filters[f.key]" type="checkbox" :value="o" /> {{ o }}</label
          >
        </fieldset>
        <fieldset>
          <legend class="mb-3 font-medium">Price (USD)</legend>
          <div class="flex items-center gap-2">
            <input
              v-model="filters.minPrice"
              type="number"
              min="0"
              aria-label="Minimum price"
              placeholder="Min"
              class="field h-10"
            /><span>–</span
            ><input
              v-model="filters.maxPrice"
              type="number"
              min="0"
              aria-label="Maximum price"
              placeholder="Max"
              class="field h-10"
            />
          </div>
        </fieldset>
        <BaseButton v-if="activeCount" variant="ghost" size="sm" @click="reset"
          >Clear filters</BaseButton
        >
      </aside>

      <div>
        <div v-if="loading" class="grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-3">
          <div v-for="n in 6" :key="n" class="space-y-3">
            <Skeleton class="aspect-[4/5] w-full" /><Skeleton class="h-3 w-1/3" /><Skeleton
              class="h-5 w-2/3"
            />
          </div>
        </div>
        <EmptyState v-else-if="error" title="We couldn't load the collection" :description="error"
          ><template #icon><SearchX class="h-7 w-7" /></template
          ><template #action
            ><BaseButton variant="secondary" @click="load">Try again</BaseButton></template
          ></EmptyState
        >
        <EmptyState
          v-else-if="!products.length"
          title="No frames match your search"
          description="Try a different search or clear the filters."
          ><template #icon><SearchX class="h-7 w-7" /></template
          ><template #action
            ><BaseButton variant="secondary" @click="reset">Clear filters</BaseButton></template
          ></EmptyState
        >
        <template v-else>
          <p class="mb-6 text-sm text-stone-deep">
            {{ meta.total }} {{ meta.total === 1 ? 'product' : 'products' }}
          </p>
          <div
            :class="
              view === 'grid' ? 'grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-3' : 'space-y-8'
            "
          >
            <ProductCard v-for="p in products" :key="p._id" :product="p" :list="view === 'list'" />
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
    </div>
  </div>
</template>
