<script setup>
import ToastHost from '@/components/common/ToastHost.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
</script>

<template>
  <RouterView />
  <!-- Mounted once for the whole app; any component can trigger them via composables. -->
  <ToastHost />
  <ConfirmDialog />
</template>
