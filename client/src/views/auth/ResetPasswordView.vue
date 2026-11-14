<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { resetPassword } from '@/services/auth.service';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const password = ref('');
const confirm = ref('');
const error = ref('');
const busy = ref(false);

async function submit() {
  error.value = '';
  if (password.value.length < 8) return (error.value = 'Use at least 8 characters');
  if (password.value !== confirm.value) return (error.value = 'Passwords do not match');
  busy.value = true;
  try {
    await resetPassword(route.query.token || '', password.value);
    toast.success('Password updated. Please sign in.');
    router.push('/login');
  } catch (e) {
    error.value = e.message; // e.g. link expired
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="container-page flex justify-center py-16 sm:py-24">
    <form class="w-full max-w-md space-y-6" novalidate @submit.prevent="submit">
      <div>
        <h1 class="text-5xl">Choose a new password</h1>
        <p class="mt-2 text-sm text-stone-deep">You will be signed out on all devices.</p>
      </div>
      <BaseInput
        v-model="password"
        label="New password"
        type="password"
        autocomplete="new-password"
        hint="At least 8 characters"
      />
      <BaseInput
        v-model="confirm"
        label="Confirm password"
        type="password"
        autocomplete="new-password"
        :error="error"
      />
      <BaseButton type="submit" class="w-full" :loading="busy">Update password</BaseButton>
    </form>
  </div>
</template>
