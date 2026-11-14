<script setup>
import { ref, reactive, onMounted } from 'vue';
import BaseBadge from '@/components/common/BaseBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/services/admin.service';
import { useConfirm } from '@/composables/useConfirm';
import { useToast } from '@/composables/useToast';
import { money, shortDate } from '@/utils/format';

const { confirm } = useConfirm();
const toast = useToast();
const coupons = ref([]);
const loading = ref(true);
const open = ref(false);
const errors = ref({});
const blank = () => ({
  code: '',
  type: 'percent',
  value: '',
  minOrder: 0,
  expiresAt: '',
  usageLimit: '',
  isActive: true,
});
const form = reactive(blank());

const load = async () => {
  try {
    coupons.value = await getCoupons();
  } catch (e) {
    toast.error(e.message);
  } finally {
    loading.value = false;
  }
};
onMounted(load);
const openNew = () => {
  Object.assign(form, blank());
  errors.value = {};
  open.value = true;
};
async function save() {
  errors.value = {};
  try {
    await createCoupon({ ...form });
    open.value = false;
    toast.success('Coupon created');
    load();
  } catch (e) {
    errors.value = e.errors;
    toast.error(e.message);
  }
}
async function toggle(c) {
  await updateCoupon(c._id, { isActive: !c.isActive }).catch((e) => toast.error(e.message));
  load();
}
async function remove(c) {
  if (
    !(await confirm({
      title: `Delete ${c.code}?`,
      message: 'Past orders that used it are not affected.',
      confirmText: 'Delete',
      tone: 'danger',
    }))
  )
    return;
  await deleteCoupon(c._id).catch((e) => toast.error(e.message));
  load();
}
const label = (c) => (c.type === 'percent' ? `${c.value}% off` : `${money(c.value)} off`);
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-4xl">Coupons</h1>
    <BaseButton @click="openNew">New coupon</BaseButton>
  </div>
  <div v-if="loading" class="mt-6 space-y-3">
    <Skeleton v-for="n in 3" :key="n" class="h-14 w-full" />
  </div>
  <p v-else-if="!coupons.length" class="mt-6 text-sm text-stone-deep">No coupons yet.</p>
  <div v-else class="mt-6 overflow-x-auto bg-white">
    <table class="w-full min-w-[40rem] text-left text-sm">
      <thead class="border-b border-stone/20 text-stone-deep">
        <tr>
          <th class="p-4 font-medium">Code</th>
          <th class="p-4 font-medium">Discount</th>
          <th class="p-4 font-medium">Rules</th>
          <th class="p-4 font-medium">Used</th>
          <th class="p-4 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-stone/20">
        <tr v-for="c in coupons" :key="c._id">
          <td class="p-4 font-medium">
            {{ c.code }}
            <BaseBadge :tone="c.isActive ? 'success' : 'neutral'" class="ml-1">{{
              c.isActive ? 'Active' : 'Off'
            }}</BaseBadge>
          </td>
          <td class="p-4">{{ label(c) }}</td>
          <td class="p-4 text-stone-deep">
            Min {{ money(c.minOrder)
            }}<template v-if="c.expiresAt"> · expires {{ shortDate(c.expiresAt) }}</template>
          </td>
          <td class="p-4">
            {{ c.usedCount }}<template v-if="c.usageLimit"> / {{ c.usageLimit }}</template>
          </td>
          <td class="p-4">
            <div class="flex gap-2">
              <BaseButton size="sm" variant="secondary" @click="toggle(c)">{{
                c.isActive ? 'Turn off' : 'Turn on'
              }}</BaseButton><BaseButton size="sm" variant="ghost" @click="remove(c)"
                >Delete</BaseButton
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <BaseModal :open="open" title="New coupon" @close="open = false">
    <form class="space-y-4" novalidate @submit.prevent="save">
      <BaseInput v-model="form.code" label="Code" placeholder="SUMMER15" :error="errors.code" />
      <div class="flex gap-3">
        <div class="flex-1">
          <label for="cp-t" class="mb-2 block text-sm">Type</label
          ><select id="cp-t" v-model="form.type" class="field">
            <option value="percent">Percent</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <BaseInput
          v-model="form.value"
          label="Value"
          type="number"
          min="0"
          step="0.01"
          class="flex-1"
          :error="errors.value"
        />
      </div>
      <BaseInput v-model="form.minOrder" label="Minimum order (USD)" type="number" min="0" />
      <div class="flex gap-3">
        <BaseInput
          v-model="form.expiresAt"
          label="Expires (optional)"
          type="date"
          class="flex-1"
        /><BaseInput
          v-model="form.usageLimit"
          label="Usage limit"
          type="number"
          min="1"
          class="flex-1"
        />
      </div>
      <div class="flex justify-end gap-3">
        <BaseButton variant="ghost" @click="open = false">Cancel</BaseButton
        ><BaseButton type="submit">Create coupon</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
