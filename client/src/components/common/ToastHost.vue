<script setup>
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next';
import { useToastStore } from '@/stores/toast';

const store = useToastStore();
const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
const accent = { success: 'text-emerald-700', error: 'text-red-700', info: 'text-gold-deep' };
</script>

<template>
  <!-- aria-live announces new toasts to screen readers without stealing focus. -->
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 p-4 sm:items-end"
    aria-live="polite"
  >
    <TransitionGroup name="page">
      <div
        v-for="t in store.toasts"
        :key="t.id"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-3 border border-stone/30 bg-white p-4 shadow-lg"
      >
        <component
          :is="icons[t.type]"
          :class="['mt-0.5 h-5 w-5 shrink-0', accent[t.type]]"
          aria-hidden="true"
        />
        <p class="flex-1 text-sm">{{ t.message }}</p>
        <button
          class="text-stone-deep hover:text-charcoal"
          aria-label="Dismiss notification"
          @click="store.dismiss(t.id)"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
