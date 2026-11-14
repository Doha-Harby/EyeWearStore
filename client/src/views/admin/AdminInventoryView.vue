<script setup>
import { ref, onMounted } from 'vue';
import BaseBadge from '@/components/common/BaseBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import { getInventory } from '@/services/admin.service';
import { shortDate } from '@/utils/format';

const data = ref(null);
const error = ref('');
const load = async () => {
  error.value = '';
  try {
    data.value = await getInventory();
  } catch (e) {
    error.value = e.message;
  }
};
onMounted(load);
</script>

<template>
  <h1 class="text-4xl">Inventory</h1>
  <div v-if="error" class="mt-6" role="alert">
    <p class="text-red-700">{{ error }}</p>
    <BaseButton class="mt-3" variant="secondary" size="sm" @click="load">Try again</BaseButton>
  </div>
  <div v-else-if="!data" class="mt-6 space-y-3">
    <Skeleton v-for="n in 5" :key="n" class="h-12 w-full" />
  </div>
  <template v-else>
    <section class="mt-6 bg-white p-5" aria-labelledby="low">
      <h2 id="low" class="text-2xl">Low and out of stock</h2>
      <p v-if="!data.lowStock.length" class="mt-4 text-sm text-stone-deep">
        Everything is well stocked.
      </p>
      <ul class="mt-4 divide-y divide-stone/20 text-sm">
        <li v-for="p in data.lowStock" :key="p._id" class="flex items-center justify-between py-3">
          <span
            >{{ p.name }} <span class="text-stone-deep">{{ p.sku }}</span></span
          ><BaseBadge :tone="p.stock === 0 ? 'danger' : 'warning'">{{
            p.stock === 0 ? 'Out of stock' : `${p.stock} left`
          }}</BaseBadge>
        </li>
      </ul>
      <p class="mt-4 text-xs text-stone-deep">Restock from Products → Stock.</p>
    </section>
    <section class="mt-6 bg-white p-5" aria-labelledby="hist">
      <h2 id="hist" class="text-2xl">Recent movements</h2>
      <div class="mt-4 overflow-x-auto">
        <table class="w-full min-w-[36rem] text-left text-sm">
          <thead class="text-stone-deep">
            <tr>
              <th class="py-2 font-medium">When</th>
              <th class="py-2 font-medium">Product</th>
              <th class="py-2 font-medium">Change</th>
              <th class="py-2 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone/20">
            <tr v-for="t in data.history" :key="t._id">
              <td class="py-3">{{ shortDate(t.createdAt) }}</td>
              <td class="py-3">{{ t.product?.name }}</td>
              <td :class="['py-3 font-medium', t.delta < 0 ? 'text-red-700' : 'text-emerald-700']">
                {{ t.delta > 0 ? '+' : '' }}{{ t.delta }}
              </td>
              <td class="py-3 capitalize text-stone-deep">
                {{ t.reason }}<template v-if="t.admin"> · {{ t.admin.name }}</template
                ><template v-if="t.note"> · {{ t.note }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </template>
</template>
