<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
});
</script>

<template>
  <div class="flex flex-col items-center px-6 py-16 text-center">
    <div
      v-if="$slots.icon"
      class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ivory text-gold-deep"
    >
      <slot name="icon" />
    </div>
    <h2 class="text-2xl">{{ title }}</h2>
    <p v-if="description" class="mt-2 max-w-sm text-sm text-stone-deep">{{ description }}</p>
    <div v-if="$slots.action" class="mt-6"><slot name="action" /></div>
  </div>
</template>
