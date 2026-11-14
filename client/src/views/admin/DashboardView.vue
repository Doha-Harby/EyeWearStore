<script setup>
import { ref, computed, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from 'chart.js';
import Skeleton from '@/components/common/Skeleton.vue';
import BaseBadge from '@/components/common/BaseBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { getDashboard } from '@/services/admin.service';
import { money, shortDate } from '@/utils/format';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler); // register only what we use: smaller bundle

const data = ref(null);
const error = ref('');
const load = async () => {
  error.value = '';
  try {
    data.value = await getDashboard();
  } catch (e) {
    error.value = e.message;
  }
};
onMounted(load);

const cards = computed(() => {
  const s = data.value?.stats ?? {};
  return [
    ['Revenue', money(s.revenue)],
    ['Orders', s.orders],
    ['Customers', s.customers],
    ['Products', s.products],
    ['Pending orders', s.pending],
    ['Low stock (under 5)', s.lowStock],
  ];
});
const chart = computed(() => ({
  labels: data.value.revenueByDay.map((d) => d.date.slice(5)),
  datasets: [
    {
      label: 'Revenue',
      data: data.value.revenueByDay.map((d) => d.revenue),
      borderColor: '#C6A76B',
      backgroundColor: 'rgba(198,167,107,.15)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
    },
  ],
}));
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { callback: (v) => `$${v}` } } },
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
</script>

<template>
  <h1 class="text-4xl">Dashboard</h1>
  <div v-if="error" class="mt-8 bg-white p-6" role="alert">
    <p class="text-red-700">{{ error }}</p>
    <BaseButton class="mt-4" variant="secondary" size="sm" @click="load">Try again</BaseButton>
  </div>
  <div v-else-if="!data" class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <Skeleton v-for="n in 6" :key="n" class="h-24" />
  </div>
  <template v-else>
    <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="[label, value] in cards" :key="label" class="bg-white p-5">
        <p class="text-sm text-stone-deep">{{ label }}</p>
        <p class="mt-2 font-display text-4xl">{{ value }}</p>
      </div>
    </div>
    <section class="mt-6 bg-white p-5" aria-labelledby="rev">
      <h2 id="rev" class="text-2xl">Revenue, last 14 days</h2>
      <div class="mt-4 h-64"><Line :data="chart" :options="options" /></div>
    </section>
    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <section class="bg-white p-5" aria-labelledby="recent">
        <h2 id="recent" class="text-2xl">Recent orders</h2>
        <p v-if="!data.recentOrders.length" class="mt-4 text-sm text-stone-deep">No orders yet.</p>
        <ul class="mt-4 divide-y divide-stone/20 text-sm">
          <li
            v-for="o in data.recentOrders"
            :key="o._id"
            class="flex items-center justify-between gap-3 py-3"
          >
            <div>
              <p class="font-medium">{{ o.orderNumber }}</p>
              <p class="text-stone-deep">{{ o.user?.name }} · {{ shortDate(o.createdAt) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <BaseBadge :tone="TONES[o.status]" class="capitalize">{{ o.status }}</BaseBadge>{{
                money(o.total)
              }}
            </div>
          </li>
        </ul>
      </section>
      <section class="bg-white p-5" aria-labelledby="best">
        <h2 id="best" class="text-2xl">Best sellers</h2>
        <ol class="mt-4 divide-y divide-stone/20 text-sm">
          <li v-for="p in data.bestSellers" :key="p._id" class="flex justify-between py-3">
            <span>{{ p.name }}</span><span class="text-stone-deep">{{ p.sold }} sold</span>
          </li>
        </ol>
      </section>
    </div>
  </template>
</template>
