<script setup>
import { ref, reactive, onMounted } from 'vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import {
  updateProfile,
  changePassword,
  getAddresses,
  saveAddress,
  deleteAddress,
} from '@/services/account.service';

const auth = useAuthStore();
const toast = useToast();
const { confirm } = useConfirm();

const profile = reactive({
  name: auth.user.name,
  phone: auth.user.phone || '',
  errors: {},
  busy: false,
});
async function saveProfile() {
  profile.busy = true;
  profile.errors = {};
  try {
    auth.user = await updateProfile({ name: profile.name, phone: profile.phone || undefined });
    toast.success('Profile updated');
  } catch (e) {
    profile.errors = e.errors;
    toast.error(e.message);
  } finally {
    profile.busy = false;
  }
}

const pw = reactive({ currentPassword: '', newPassword: '', errors: {}, busy: false });
async function savePassword() {
  pw.busy = true;
  pw.errors = {};
  try {
    await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
    Object.assign(pw, { currentPassword: '', newPassword: '' });
    toast.success('Password changed');
  } catch (e) {
    pw.errors = e.errors;
    toast.error(e.message);
  } finally {
    pw.busy = false;
  }
}

const FIELDS = [
  ['label', 'Label (Home, Work…)'],
  ['fullName', 'Full name'],
  ['phone', 'Phone'],
  ['line1', 'Address'],
  ['line2', 'Apartment, suite'],
  ['city', 'City'],
  ['state', 'State / governorate'],
  ['postalCode', 'Postal code'],
  ['country', 'Country'],
];
const addresses = ref([]);
const modal = ref(false);
const editingId = ref(null);
const form = reactive({});
const formErrors = ref({});
const load = async () => (addresses.value = await getAddresses().catch(() => []));
onMounted(load);
function openAddress(a = null) {
  editingId.value = a?._id ?? null;
  Object.assign(form, Object.fromEntries(FIELDS.map(([k]) => [k, a?.[k] ?? ''])), {
    isDefault: a?.isDefault ?? false,
  });
  formErrors.value = {};
  modal.value = true;
}
async function submitAddress() {
  formErrors.value = {};
  const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
  try {
    await saveAddress(editingId.value, body);
    modal.value = false;
    toast.success('Address saved');
    load();
  } catch (e) {
    formErrors.value = e.errors;
    toast.error(e.message);
  }
}
async function removeAddress(a) {
  if (!(await confirm({ title: 'Delete this address?', confirmText: 'Delete', tone: 'danger' })))
    return;
  await deleteAddress(a._id).catch((e) => toast.error(e.message));
  load();
}
</script>

<template>
  <div class="container-page max-w-4xl py-12">
    <h1 class="text-5xl">My account</h1>
    <p class="mt-2 text-sm text-stone-deep">
      {{ auth.user.email }} ·
      <RouterLink to="/account/orders" class="underline underline-offset-4"
        >Order history</RouterLink
      >
    </p>

    <div class="mt-10 grid gap-8 md:grid-cols-2">
      <form class="space-y-4 bg-ivory p-6" novalidate @submit.prevent="saveProfile">
        <h2 class="text-2xl">Personal information</h2>
        <BaseInput v-model="profile.name" label="Full name" :error="profile.errors.name" />
        <BaseInput v-model="profile.phone" label="Phone" :error="profile.errors.phone" />
        <BaseButton type="submit" :loading="profile.busy">Save changes</BaseButton>
      </form>
      <form class="space-y-4 bg-ivory p-6" novalidate @submit.prevent="savePassword">
        <h2 class="text-2xl">Change password</h2>
        <BaseInput
          v-model="pw.currentPassword"
          label="Current password"
          type="password"
          autocomplete="current-password"
          :error="pw.errors.currentPassword"
        />
        <BaseInput
          v-model="pw.newPassword"
          label="New password"
          type="password"
          autocomplete="new-password"
          hint="At least 8 characters"
          :error="pw.errors.newPassword"
        />
        <BaseButton type="submit" :loading="pw.busy">Update password</BaseButton>
      </form>
    </div>

    <section class="mt-12" aria-labelledby="addr">
      <div class="flex items-center justify-between">
        <h2 id="addr" class="text-3xl">Saved addresses</h2>
        <BaseButton variant="secondary" size="sm" @click="openAddress()">Add address</BaseButton>
      </div>
      <p v-if="!addresses.length" class="mt-6 text-sm text-stone-deep">
        You have no saved addresses yet.
      </p>
      <ul class="mt-6 grid gap-4 sm:grid-cols-2">
        <li v-for="a in addresses" :key="a._id" class="border border-stone/30 p-5 text-sm">
          <p class="font-medium">
            {{ a.label || 'Address'
            }}<span v-if="a.isDefault" class="ml-2 text-xs text-gold-deep">Default</span>
          </p>
          <p class="mt-2">{{ a.fullName }}</p>
          <p>
            {{ a.line1 }}<template v-if="a.line2">, {{ a.line2 }}</template>
          </p>
          <p>{{ a.city }} {{ a.postalCode }}, {{ a.country }}</p>
          <div class="mt-4 flex gap-4">
            <button class="underline underline-offset-4" @click="openAddress(a)">Edit</button
            ><button class="underline underline-offset-4" @click="removeAddress(a)">Delete</button>
          </div>
        </li>
      </ul>
    </section>

    <BaseModal
      :open="modal"
      :title="editingId ? 'Edit address' : 'New address'"
      wide
      @close="modal = false"
    >
      <form class="grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="submitAddress">
        <BaseInput
          v-for="[k, label] in FIELDS"
          :key="k"
          v-model="form[k]"
          :label="label"
          :error="formErrors[k]"
          :class="['line1', 'line2'].includes(k) ? 'sm:col-span-2' : ''"
        />
        <label class="flex items-center gap-2 text-sm sm:col-span-2"
          ><input v-model="form.isDefault" type="checkbox" /> Use as my default address</label
        >
        <div class="flex justify-end gap-3 sm:col-span-2">
          <BaseButton variant="ghost" @click="modal = false">Cancel</BaseButton
          ><BaseButton type="submit">Save address</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
