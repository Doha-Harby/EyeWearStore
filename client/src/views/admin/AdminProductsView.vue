<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { Plus, PackageOpen } from 'lucide-vue-next';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseBadge from '@/components/common/BaseBadge.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import ProductFormModal from '@/components/dashboard/ProductFormModal.vue';
import {
  getAdminProducts,
  deleteProduct,
  restoreProduct,
  adjustStock,
} from '@/services/admin.service';
import { getBrands, getCategories } from '@/services/catalog.service';
import { useConfirm } from '@/composables/useConfirm';
import { useToast } from '@/composables/useToast';
import { money } from '@/utils/format';

const filters = reactive({ q: '', deleted: 'false', page: 1 });
const products = ref([]);
const meta = ref({ pages: 1 });
const brands = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref('');
const formOpen = ref(false);
const editing = ref(null);
const stockFor = ref(null);
const stock = reactive({ delta: '', note: '', error: '', busy: false });
const { confirm } = useConfirm();
const toast = useToast();

async function load() {
  loading.value = true;
  error.value = '';
  try {
    ({ items: products.value, meta: meta.value } = await getAdminProducts({ ...filters }));
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(async () => {
  [brands.value, categories.value] = await Promise.all([getBrands(), getCategories()]).catch(() => [
    [],
    [],
  ]);
  load();
});
watch(() => [filters.deleted, filters.page], load);
watch(
  () => filters.deleted,
  () => (filters.page = 1),
);
watchDebounced(
  () => filters.q,
  () => {
    filters.page = 1;
    load();
  },
  { debounce: 350 },
);

const openForm = (p = null) => {
  editing.value = p;
  formOpen.value = true;
};
const saved = () => {
  formOpen.value = false;
  load();
};

async function trash(p) {
  if (
    !(await confirm({
      title: `Move "${p.name}" to trash?`,
      message: 'It disappears from the shop. You can restore it any time.',
      confirmText: 'Move to trash',
      tone: 'danger',
    }))
  )
    return;
  try {
    await deleteProduct(p._id);
    toast.success('Moved to trash');
  } catch (e) {
    toast.error(e.message);
  }
  load();
}
async function restore(p) {
  try {
    await restoreProduct(p._id);
    toast.success(`${p.name} restored`);
  } catch (e) {
    toast.error(e.message);
  }
  load();
}
function openStock(p) {
  stockFor.value = p;
  Object.assign(stock, { delta: '', note: '', error: '' });
}
async function submitStock() {
  stock.busy = true;
  stock.error = '';
  try {
    await adjustStock(stockFor.value._id, { delta: stock.delta, note: stock.note || undefined });
    toast.success('Stock updated');
    stockFor.value = null;
    load();
  } catch (e) {
    stock.error = e.errors?.delta || e.message;
  } finally {
    stock.busy = false;
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-4xl">Products</h1>
    <BaseButton @click="openForm()"
      ><Plus class="h-4 w-4" aria-hidden="true" />New product</BaseButton
    >
  </div>
  <div class="mt-6 flex flex-col gap-3 sm:flex-row">
    <input
      v-model="filters.q"
      type="search"
      aria-label="Search products"
      placeholder="Search name or SKU"
      class="field h-10 sm:w-64"
    />
    <div class="flex gap-2" role="group" aria-label="Show">
      <button
        v-for="[v, l] in [
          ['false', 'Active'],
          ['true', 'Trash'],
        ]"
        :key="v"
        :aria-pressed="filters.deleted === v"
        :class="[
          'h-10 px-5 text-sm',
          filters.deleted === v ? 'bg-charcoal text-ivory' : 'bg-white hover:bg-gold/20',
        ]"
        @click="filters.deleted = v"
      >
        {{ l }}
      </button>
    </div>
  </div>

  <div v-if="loading" class="mt-6 space-y-3">
    <Skeleton v-for="n in 6" :key="n" class="h-14 w-full" />
  </div>
  <p v-else-if="error" class="mt-6 text-red-700" role="alert">{{ error }}</p>
  <EmptyState
    v-else-if="!products.length"
    :title="filters.deleted === 'true' ? 'Trash is empty' : 'No products found'"
    description="Try a different search, or add a product."
  >
    <template #icon><PackageOpen class="h-7 w-7" /></template>
  </EmptyState>
  <template v-else>
    <div class="mt-6 overflow-x-auto bg-white">
      <table class="w-full min-w-[44rem] text-left text-sm">
        <thead class="border-b border-stone/20 text-stone-deep">
          <tr>
            <th class="p-4 font-medium">Product</th>
            <th class="p-4 font-medium">Price</th>
            <th class="p-4 font-medium">Stock</th>
            <th class="p-4 font-medium">Status</th>
            <th class="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone/20">
          <tr v-for="p in products" :key="p._id">
            <td class="p-4">
              <p class="font-medium">{{ p.name }}</p>
              <p class="text-stone-deep">
                {{ p.sku }} · {{ p.brand?.name }} · {{ p.category?.name }}
              </p>
            </td>
            <td class="p-4">
              {{ money(p.discountPrice ?? p.price) }}
              <p v-if="p.discountPrice" class="text-stone-deep line-through">
                {{ money(p.price) }}
              </p>
            </td>
            <td class="p-4">
              <BaseBadge :tone="p.stock === 0 ? 'danger' : p.stock < 5 ? 'warning' : 'success'">{{
                p.stock
              }}</BaseBadge>
            </td>
            <td class="p-4">
              <BaseBadge :tone="p.isActive ? 'neutral' : 'dark'">{{
                p.isActive ? 'Visible' : 'Hidden'
              }}</BaseBadge><BaseBadge v-if="p.featured" tone="gold" class="ml-1"
                >Featured</BaseBadge
              >
            </td>
            <td class="p-4">
              <div class="flex flex-wrap gap-2">
                <template v-if="filters.deleted === 'false'">
                  <BaseButton size="sm" variant="secondary" @click="openForm(p)">Edit</BaseButton
                  ><BaseButton size="sm" variant="secondary" @click="openStock(p)">Stock</BaseButton
                  ><BaseButton size="sm" variant="ghost" @click="trash(p)">Trash</BaseButton>
                </template>
                <BaseButton v-else size="sm" variant="secondary" @click="restore(p)"
                  >Restore</BaseButton
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <nav
      v-if="meta.pages > 1"
      class="mt-6 flex items-center justify-center gap-4"
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

  <ProductFormModal
    :open="formOpen"
    :product="editing"
    :brands="brands"
    :categories="categories"
    @close="formOpen = false"
    @saved="saved"
  />

  <BaseModal
    :open="!!stockFor"
    :title="`Adjust stock: ${stockFor?.name ?? ''}`"
    @close="stockFor = null"
  >
    <form class="space-y-4" novalidate @submit.prevent="submitStock">
      <p class="text-sm text-stone-deep">
        Current stock: {{ stockFor?.stock }}. Use a negative number to remove units.
      </p>
      <BaseInput
        v-model="stock.delta"
        label="Change (e.g. 10 or -2)"
        type="number"
        step="1"
        :error="stock.error"
      />
      <BaseInput
        v-model="stock.note"
        label="Note (optional)"
        placeholder="Delivery from supplier, damaged, recount…"
      />
      <div class="flex justify-end gap-3">
        <BaseButton variant="ghost" @click="stockFor = null">Cancel</BaseButton
        ><BaseButton type="submit" :loading="stock.busy">Update stock</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
