<script setup>
import { useId } from 'vue';

defineOptions({ inheritAttrs: false }); // type, placeholder, etc. go on the <input>, not the wrapper
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
});
defineEmits(['update:modelValue']);
const id = useId(); // unique per instance, so label/aria links never collide
</script>

<template>
  <div>
    <label :for="id" class="mb-2 block text-sm">{{ label }}</label>
    <input
      :id="id"
      v-bind="$attrs"
      :value="modelValue"
      :aria-invalid="!!error"
      :aria-describedby="error || hint ? `${id}-msg` : undefined"
      :class="['field', { 'field-error': error }]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p
      v-if="error || hint"
      :id="`${id}-msg`"
      :class="['mt-1.5 text-xs', error ? 'text-red-700' : 'text-stone-deep']"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
