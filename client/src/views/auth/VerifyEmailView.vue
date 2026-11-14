<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { MailCheck, MailWarning } from 'lucide-vue-next';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import { verifyEmail } from '@/services/auth.service';

const state = ref('loading'); // loading | ok | error
const message = ref('');
onMounted(async () => {
  try {
    await verifyEmail(useRoute().query.token || '');
    state.value = 'ok';
  } catch (e) {
    state.value = 'error';
    message.value = e.errors?.token ? 'This verification link is invalid.' : e.message;
  }
});
</script>

<template>
  <div class="container-page py-16">
    <Skeleton v-if="state === 'loading'" class="mx-auto h-24 w-80" />
    <EmptyState
      v-else-if="state === 'ok'"
      title="Email verified"
      description="Thank you. Your account is fully set up."
    >
      <template #icon><MailCheck class="h-7 w-7" /></template>
      <template #action><BaseButton to="/shop">Browse the collection</BaseButton></template>
    </EmptyState>
    <EmptyState v-else title="We couldn't verify that link" :description="message">
      <template #icon><MailWarning class="h-7 w-7" /></template>
      <template #action><BaseButton to="/" variant="secondary">Back to home</BaseButton></template>
    </EmptyState>
  </div>
</template>
