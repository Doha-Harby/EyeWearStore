<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Loader2 } from 'lucide-vue-next';

const props = defineProps({
  /** 'primary' | 'secondary' | 'gold' | 'ghost' */
  variant: { type: String, default: 'primary' },
  /** 'sm' | 'md' | 'lg' */
  size: { type: String, default: 'md' },
  loading: Boolean,
  disabled: Boolean,
  /** If provided, renders a router link instead of a <button>. */
  to: { type: [String, Object], default: null },
  type: { type: String, default: 'button' },
});
const tag = computed(() => (props.to ? RouterLink : 'button'));
</script>

<template>
  <component
    :is="tag"
    :to="to || undefined"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled || loading"
    :aria-busy="loading || undefined"
    :class="['btn', `btn-${variant}`, `btn-${size}`]"
  >
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <slot />
  </component>
</template>
