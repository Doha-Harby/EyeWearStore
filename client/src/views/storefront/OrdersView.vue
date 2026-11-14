<script setup>
import { ref, onMounted } from 'vue';
import { ReceiptText } from 'lucide-vue-next';
import BaseBadge from '@/components/common/BaseBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import { getMyOrders, cancelOrder } from '@/services/orders.service';
import { useConfirm } from '@/composables/useConfirm';
import { useToast } from '@/composables/useToast';
import { money, shortDate } from '@/utils/format';

const orders = ref([]);
const loading = ref(true);
const error = ref('');
const { confirm } = useConfirm();
const toast = useToast();
const TONES = {
  pending: 'warning',
  confirmed: 'gold',
  processing: 'gold',
  shipped: 'dark',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'neutral',
};

const load = async () => {
  try {
    orders.value = await getMyOrders();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
onMounted(load);

async function cancel(o) {
  if (
    !(await confirm({
      title: `Cancel order ${o.orderNumber}?`,
      message: 'The items go back into stock. This cannot be undone.',
      confirmText: 'Cancel order',
      cancelText: 'Keep order',
      tone: 'danger',
    }))
  )
    return;
  try {
    await cancelOrder(o._id);
    toast.success('Order cancelled');
    load();
  } catch (e) {
    toast.error(e.message);
  }
}
</script>

<template>
  <div class="container-page py-12">
    <h1 class="text-5xl">Your orders</h1>
    <div v-if="loading" class="mt-10 space-y-4">
      <Skeleton v-for="n in 3" :key="n" class="h-24 w-full" />
    </div>
    <p v-else-if="error" class="mt-10 text-red-700" role="alert">{{ error }}</p>
    <EmptyState
      v-else-if="!orders.length"
      title="No orders yet"
      description="Once you place an order it will show up here."
    >
      <template #icon><ReceiptText class="h-7 w-7" /></template>
      <template #action><BaseButton to="/shop">Explore the collection</BaseButton></template>
    </EmptyState>
    <ul v-else class="mt-10 space-y-4">
      <li v-for="o in orders" :key="o._id" class="border border-stone/30 p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-medium">{{ o.orderNumber }}</p>
            <p class="text-sm text-stone-deep">
              {{ shortDate(o.createdAt) }} · {{ o.items.length }}
              {{ o.items.length === 1 ? 'item' : 'items' }}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <BaseBadge :tone="TONES[o.status]" class="capitalize">{{ o.status }}</BaseBadge><span>{{
              money(o.total)
            }}</span>
            <BaseButton
              v-if="['pending', 'confirmed'].includes(o.status)"
              variant="secondary"
              size="sm"
              @click="cancel(o)"
              >Cancel</BaseButton
            >
          </div>
        </div>
        <p class="mt-3 text-sm text-stone-deep">
          {{ o.items.map((i) => `${i.qty} × ${i.name}`).join(', ') }}
        </p>
      </li>
    </ul>
  </div>
</template>
