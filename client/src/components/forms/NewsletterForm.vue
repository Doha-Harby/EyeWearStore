<script setup>
import { ref } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { subscribe } from '@/services/catalog.service';
import { useToast } from '@/composables/useToast';

const toast = useToast();
const email = ref('');
const error = ref('');
const busy = ref(false);

async function submit() {
  error.value = '';
  busy.value = true;
  try {
    await subscribe(email.value);
    toast.success('Thank you for subscribing');
    email.value = '';
  } catch (e) {
    error.value = e.errors?.email || e.message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <form
    class="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
    novalidate
    @submit.prevent="submit"
  >
    <div class="flex-1">
      <label for="nl-email" class="sr-only">Email address</label>
      <input
        id="nl-email"
        v-model="email"
        type="email"
        placeholder="Your email"
        autocomplete="email"
        :aria-invalid="!!error"
        class="field"
      />
      <p v-if="error" class="mt-1.5 text-left text-xs text-red-700" role="alert">{{ error }}</p>
    </div>
    <BaseButton type="submit" :loading="busy">Subscribe</BaseButton>
  </form>
</template>
