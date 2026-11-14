<script setup>
import { ref } from 'vue';
import { MailCheck } from 'lucide-vue-next';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { forgotPassword } from '@/services/auth.service';

const email = ref('');
const error = ref('');
const busy = ref(false);
const sent = ref(false);

async function submit() {
  error.value = '';
  busy.value = true;
  try {
    await forgotPassword(email.value);
    sent.value = true; // the server answers the same way whether or not the account exists
  } catch (e) {
    error.value = e.errors?.email || e.message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="container-page flex justify-center py-16 sm:py-24">
    <EmptyState
      v-if="sent"
      title="Check your inbox"
      description="If an account exists for that email, a reset link is on its way. It expires in one hour."
    >
      <template #icon><MailCheck class="h-7 w-7" /></template>
      <template #action
        ><BaseButton to="/login" variant="secondary">Back to sign in</BaseButton></template
      >
    </EmptyState>
    <form v-else class="w-full max-w-md space-y-6" novalidate @submit.prevent="submit">
      <div>
        <h1 class="text-5xl">Reset password</h1>
        <p class="mt-2 text-sm text-stone-deep">
          Enter your email and we will send you a reset link.
        </p>
      </div>
      <BaseInput v-model="email" label="Email" type="email" autocomplete="email" :error="error" />
      <BaseButton type="submit" class="w-full" :loading="busy">Send reset link</BaseButton>
      <p class="text-sm">
        <RouterLink to="/login" class="text-stone-deep underline underline-offset-4"
          >Back to sign in</RouterLink
        >
      </p>
    </form>
  </div>
</template>
