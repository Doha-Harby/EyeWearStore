<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { ReceiptText } from 'lucide-vue-next';
import BaseBadge from '@/components/common/BaseBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import { getAdminOrders, setOrderStatus } from '@/services/admin.service';
import { useConfirm } from '@/composables/useConfirm';
import { useToast } from '@/composables/useToast';
import { money, shortDate } from '@/utils/format';

const STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];
// Mirrors the server's rules, so the dropdown only offers legal moves. The server still enforces them.
const NEXT = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};
const TONES = {
  pending: 'warning',
  confirmed: 'gold',
  processing: 'gold',
  shipped: 'dark',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'neutral',
};

const filters = reactive({ status: '', q: '', page: 1 });
const orders = ref([]);
const meta = ref({ pages: 1, total: 0 });
const loading = ref(true);
const error = ref('');
const { confirm } = useConfirm();
const toast = useToast();

async function load() {
  loading.value = true;
  error.value = '';
  try {
    ({ items: orders.value, meta: meta.value } = await getAdminOrders({ ...filters }));
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(load);
watch(() => [filters.status, filters.page], load);
watch(
  () => filters.status,
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

async function change(order, status) {
  if (!status) return;
  const cancel = status === 'cancelled';
  if (
    cancel &&
    !(await confirm({
      title: `Cancel ${order.orderNumber}?`,
      message: 'Items return to stock. This cannot be undone.',
      confirmText: 'Cancel order',
      cancelText: 'Keep order',
      tone: 'danger',
    }))
  )
    return;
  try {
    await setOrderStatus(order._id, status);
    toast.success(`${order.orderNumber} is now ${status}`);
  } catch (e) {
    toast.error(e.message);
  }
  load();
}
</script>

<template>
  <h1 class="text-4xl">Orders</h1>
  <div class="mt-6 flex flex-col gap-3 sm:flex-row">
    <input
      v-model="filters.q"
      type="search"
      aria-label="Search by order number"
      placeholder="Search order number"
      class="field h-10 sm:w-64"
    />
    <select v-model="filters.status" aria-label="Filter by status" class="field h-10 sm:w-48">
      <option value="">All statuses</option>
      <option v-for="s in STATUSES" :key="s" :value="s" class="capitalize">{{ s }}</option>
    </select>
  </div>

  <div v-if="loading" class="mt-6 space-y-3">
    <Skeleton v-for="n in 6" :key="n" class="h-14 w-full" />
  </div>
  <p v-else-if="error" class="mt-6 text-red-700" role="alert">{{ error }}</p>
  <EmptyState
    v-else-if="!orders.length"
    title="No orders found"
    description="Try another status or search term."
  >
    <template #icon><ReceiptText class="h-7 w-7" /></template>
  </EmptyState>
  <template v-else>
    <div class="mt-6 overflow-x-auto bg-white">
      <table class="w-full min-w-[40rem] text-left text-sm">
        <thead class="border-b border-stone/20 text-stone-deep">
          <tr>
            <th class="p-4 font-medium">Order</th>
            <th class="p-4 font-medium">Customer</th>
            <th class="p-4 font-medium">Total</th>
            <th class="p-4 font-medium">Status</th>
            <th class="p-4 font-medium">Update</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone/20">
          <tr v-for="o in orders" :key="o._id">
            <td class="p-4">
              <p class="font-medium">{{ o.orderNumber }}</p>
              <a
                :href="`/api/orders/${o._id}/invoice`"
                target="_blank"
                rel="noopener"
                class="text-xs underline underline-offset-4"
                >Invoice (PDF)</a
              >
              <p class="text-stone-deep">{{ shortDate(o.createdAt) }}</p>
            </td>
            <td class="p-4">
              {{ o.user?.name }}
              <p class="text-stone-deep">{{ o.user?.email }}</p>
            </td>
            <td class="p-4">
              {{ money(o.total) }}
              <p class="text-xs uppercase text-stone-deep">
                {{ o.paymentMethod }} · {{ o.paymentStatus }}
              </p>
            </td>
            <td class="p-4">
              <BaseBadge :tone="TONES[o.status]" class="capitalize">{{ o.status }}</BaseBadge>
            </td>
            <td class="p-4">
              <select
                v-if="NEXT[o.status].length"
                :aria-label="`Update ${o.orderNumber}`"
                class="field h-9 w-36 capitalize"
                @change="
                  change(o, $event.target.value);
                  $event.target.value = '';
                "
              >
                <option value="">Change to…</option>
                <option v-for="s in NEXT[o.status]" :key="s" :value="s">{{ s }}</option>
              </select>
              <span v-else class="text-stone-deep">Final</span>
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
</template>
