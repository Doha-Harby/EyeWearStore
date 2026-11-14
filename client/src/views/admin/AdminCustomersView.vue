<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { watchDebounced } from '@vueuse/core';
import BaseBadge from '@/components/common/BaseBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import { getCustomers, updateCustomer } from '@/services/admin.service';
import { useAuthStore } from '@/stores/auth';
import { useConfirm } from '@/composables/useConfirm';
import { useToast } from '@/composables/useToast';
import { shortDate } from '@/utils/format';

const auth = useAuthStore();
const { confirm } = useConfirm();
const toast = useToast();
const filters = reactive({ q: '', page: 1 });
const users = ref([]);
const meta = ref({ pages: 1 });
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    ({ items: users.value, meta: meta.value } = await getCustomers({ ...filters }));
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(load);
watch(() => filters.page, load);
watchDebounced(
  () => filters.q,
  () => {
    filters.page = 1;
    load();
  },
  { debounce: 350 },
);

async function patch(u, body, verb) {
  if (
    body.isActive === false &&
    !(await confirm({
      title: `Deactivate ${u.name}?`,
      message: 'They will be signed out and unable to log in.',
      confirmText: 'Deactivate',
      tone: 'danger',
    }))
  )
    return;
  try {
    await updateCustomer(u._id, body);
    toast.success(`${u.name} ${verb}`);
  } catch (e) {
    toast.error(e.message);
  }
  load();
}
</script>

<template>
  <h1 class="text-4xl">Customers</h1>
  <input
    v-model="filters.q"
    type="search"
    aria-label="Search customers"
    placeholder="Search name or email"
    class="field mt-6 h-10 sm:w-72"
  />
  <div v-if="loading" class="mt-6 space-y-3">
    <Skeleton v-for="n in 6" :key="n" class="h-14 w-full" />
  </div>
  <p v-else-if="error" class="mt-6 text-red-700" role="alert">{{ error }}</p>
  <p v-else-if="!users.length" class="mt-6 text-sm text-stone-deep">No accounts found.</p>
  <div v-else class="mt-6 overflow-x-auto bg-white">
    <table class="w-full min-w-[40rem] text-left text-sm">
      <thead class="border-b border-stone/20 text-stone-deep">
        <tr>
          <th class="p-4 font-medium">Name</th>
          <th class="p-4 font-medium">Role</th>
          <th class="p-4 font-medium">Status</th>
          <th class="p-4 font-medium">Joined</th>
          <th class="p-4 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-stone/20">
        <tr v-for="u in users" :key="u._id">
          <td class="p-4">
            <p class="font-medium">{{ u.name }}</p>
            <p class="text-stone-deep">{{ u.email }}</p>
          </td>
          <td class="p-4">
            <select
              v-if="auth.user.role === 'superadmin' && u._id !== auth.user._id"
              :value="u.role"
              :aria-label="`Role for ${u.name}`"
              class="field h-9 w-36"
              @change="patch(u, { role: $event.target.value }, 'role updated')"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super admin</option></select
            ><BaseBadge v-else tone="gold" class="capitalize">{{ u.role }}</BaseBadge>
          </td>
          <td class="p-4">
            <BaseBadge :tone="u.isActive ? 'success' : 'danger'">{{
              u.isActive ? 'Active' : 'Deactivated'
            }}</BaseBadge>
          </td>
          <td class="p-4">{{ shortDate(u.createdAt) }}</td>
          <td class="p-4">
            <span v-if="u._id === auth.user._id" class="text-stone-deep">You</span
            ><BaseButton
              v-else
              size="sm"
              variant="secondary"
              @click="patch(u, { isActive: !u.isActive }, u.isActive ? 'deactivated' : 'activated')"
              >{{ u.isActive ? 'Deactivate' : 'Activate' }}</BaseButton
            >
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
    <BaseButton variant="secondary" size="sm" :disabled="filters.page <= 1" @click="filters.page--"
      >Previous</BaseButton
    ><span class="text-sm text-stone-deep">Page {{ filters.page }} of {{ meta.pages }}</span
    ><BaseButton
      variant="secondary"
      size="sm"
      :disabled="filters.page >= meta.pages"
      @click="filters.page++"
      >Next</BaseButton
    >
  </nav>
</template>
