<script setup>
import { SearchX } from 'lucide-vue-next';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/common/BaseButton.vue';
</script>

<template>
  <div class="container-page py-16">
    <EmptyState
      title="This page has wandered off"
      description="The page you are looking for does not exist or has moved."
    >
      <template #icon><SearchX class="h-7 w-7" /></template>
      <template #action><BaseButton to="/">Back to home</BaseButton></template>
    </EmptyState>
  </div>
</template>
