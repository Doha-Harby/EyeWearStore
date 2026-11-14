<script setup>
import ProductImage from '@/components/common/ProductImage.vue';
</script>

<template>
  <!-- Temporary hero. The full homepage is built in Phase 4. -->
  <section class="bg-ivory">
    <div class="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
      <div>
        <p class="eyebrow">THE NEW COLLECTION</p>
        <h1 class="mt-5 text-5xl leading-[1.05] sm:text-7xl">See the World Differently.</h1>
        <p class="mt-6 max-w-md text-stone-deep">
          Handcrafted frames, designed in small batches and made to last.
        </p>
      </div>
      <div class="mx-auto w-full max-w-sm"><ProductImage alt="LUMIÈRE eyewear" /></div>
    </div>
  </section>
</template>
