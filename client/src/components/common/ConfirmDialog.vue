<script setup>
import { ref, watch, nextTick } from 'vue';
import { useConfirm } from '@/composables/useConfirm';
import BaseButton from './BaseButton.vue';

const { state, accept, cancel } = useConfirm();
const confirmBtn = ref(null);

// Move focus into the dialog when it opens so keyboard users land in the right place.
watch(
  () => state.open,
  async (open) => {
    if (open) {
      await nextTick();
      confirmBtn.value?.$el.focus();
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="page">
      <div
        v-if="state.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown.esc="cancel"
      >
        <div class="absolute inset-0 bg-charcoal/50" @click="cancel" />
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-msg"
          class="relative w-full max-w-md bg-white p-8 shadow-xl"
        >
          <h2 id="confirm-title" class="text-2xl">{{ state.title }}</h2>
          <p id="confirm-msg" class="mt-2 text-sm text-stone-deep">{{ state.message }}</p>
          <div class="mt-8 flex justify-end gap-3">
            <BaseButton variant="ghost" @click="cancel">{{ state.cancelText }}</BaseButton>
            <BaseButton
              ref="confirmBtn"
              :variant="state.tone === 'danger' ? 'gold' : 'primary'"
              @click="accept"
            >
              {{ state.confirmText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
