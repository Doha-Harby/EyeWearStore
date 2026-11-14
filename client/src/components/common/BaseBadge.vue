<script setup>
const tones = {
  neutral: 'bg-ivory text-stone-deep',
  gold: 'bg-gold/15 text-gold-deep',
  dark: 'bg-charcoal text-ivory',
  success: 'bg-emerald-50 text-emerald-800',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-800',
};
defineProps({ tone: { type: String, default: 'neutral' } });
</script>

<template>
  <span
    :class="['inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-medium', tones[tone]]"
  >
    <slot />
  </span>
</template>
