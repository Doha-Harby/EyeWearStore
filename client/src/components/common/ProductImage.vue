<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, required: true },
});
const failed = ref(false);
watch(
  () => props.src,
  () => (failed.value = false),
);
</script>

<template>
  <!-- Fixed 4:5 ratio prevents layout shift while images load. -->
  <div class="relative aspect-[4/5] overflow-hidden bg-ivory">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      loading="lazy"
      class="h-full w-full object-cover"
      @error="failed = true"
    />
    <!-- Elegant fallback: shown when there is no URL or the image fails to load. -->
    <svg v-else role="img" :aria-label="alt" viewBox="0 0 200 250" class="h-full w-full text-stone">
      <g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <rect x="28" y="95" width="62" height="46" rx="20" />
        <rect x="110" y="95" width="62" height="46" rx="20" />
        <path d="M90 112c6-6 14-6 20 0M28 108l-10-6M172 108l10-6" />
      </g>
    </svg>
  </div>
</template>
