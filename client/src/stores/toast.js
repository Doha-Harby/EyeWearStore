import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);
  let nextId = 1;

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }
  function push(type, message, timeout = 4000) {
    const id = nextId++;
    toasts.value.push({ id, type, message });
    setTimeout(() => dismiss(id), timeout);
  }
  return {
    toasts,
    dismiss,
    success: (m) => push('success', m),
    error: (m) => push('error', m, 6000), // errors stay a bit longer
    info: (m) => push('info', m),
  };
});
