<script setup>
import { ref } from 'vue';
import ProductImage from '@/components/common/ProductImage.vue';

defineProps({ src: { type: String, default: '' }, alt: { type: String, required: true } });
const zoomed = ref(false);
const origin = ref('50% 50%');
// Zoom follows the pointer: the point under the cursor stays put while the image scales up.
function move(e) {
  const r = e.currentTarget.getBoundingClientRect();
  origin.value = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
}
</script>

<template>
  <div
    class="cursor-zoom-in overflow-hidden"
    @mouseenter="zoomed = true"
    @mouseleave="zoomed = false"
    @mousemove="move"
  >
    <div
      class="transition-transform duration-200"
      :style="{ transform: zoomed ? 'scale(1.8)' : 'scale(1)', transformOrigin: origin }"
    >
      <ProductImage :src="src" :alt="alt" />
    </div>
  </div>
</template>
