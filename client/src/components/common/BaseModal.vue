<script setup>
import { ref, watch, nextTick } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  open: Boolean,
  title: { type: String, required: true },
  wide: Boolean,
});
const emit = defineEmits(['close']);
const panel = ref(null);
// Focus moves into the dialog when it opens; Escape and the backdrop close it.
watch(
  () => props.open,
  async (o) => {
    if (o) {
      await nextTick();
      panel.value?.focus();
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="page">
      <div
        v-if="open"
        class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
        @keydown.esc="emit('close')"
      >
        <div class="fixed inset-0 bg-charcoal/50" @click="emit('close')" />
        <div
          ref="panel"
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :class="[
            'relative my-8 w-full bg-white p-6 shadow-xl outline-none sm:p-8',
            wide ? 'max-w-2xl' : 'max-w-md',
          ]"
        >
          <div class="mb-6 flex items-start justify-between gap-4">
            <h2 class="text-3xl">{{ title }}</h2>
            <button
              aria-label="Close"
              class="text-stone-deep hover:text-charcoal"
              @click="emit('close')"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
