<script setup>
import { reactive, ref, watch } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { createProduct, updateProduct } from '@/services/admin.service';
import { useToast } from '@/composables/useToast';

const props = defineProps({
  open: Boolean,
  product: { type: Object, default: null },
  brands: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
});
const emit = defineEmits(['close', 'saved']);
const toast = useToast();

const SHAPES = ['round', 'square', 'rectangle', 'aviator', 'cat-eye', 'wayfarer', 'oval'];
const COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Tortoise', hex: '#7b4a2d' },
  { name: 'Gold', hex: '#C6A76B' },
  { name: 'Silver', hex: '#b8b8b8' },
  { name: 'Navy', hex: '#1f2d4d' },
  { name: 'Clear', hex: '#e8e4dc' },
];
const blank = () => ({
  name: '',
  sku: '',
  brand: '',
  category: '',
  price: '',
  discountPrice: '',
  stock: 0,
  frameShape: '',
  frameMaterial: '',
  gender: 'unisex',
  description: '',
  images: '',
  colors: [],
  featured: false,
  isActive: true,
});

const form = reactive(blank());
const errors = ref({});
const saving = ref(false);

// Every time the dialog opens, fill the form from the product being edited (or start empty).
watch(
  () => props.open,
  (open) => {
    if (!open) return;
    errors.value = {};
    const p = props.product;
    Object.assign(
      form,
      blank(),
      p && {
        ...p,
        brand: p.brand?._id,
        category: p.category?._id,
        discountPrice: p.discountPrice ?? '',
        frameShape: p.frameShape ?? '',
        frameMaterial: p.frameMaterial ?? '',
        images: (p.images || []).join('\n'),
        colors: (p.colors || []).map((c) => c.name),
      },
    );
  },
);

async function save() {
  saving.value = true;
  errors.value = {};
  const body = {
    ...form,
    images: form.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    colors: COLORS.filter((c) => form.colors.includes(c.name)),
  };
  try {
    props.product ? await updateProduct(props.product._id, body) : await createProduct(body);
    toast.success(props.product ? 'Product updated' : 'Product created');
    emit('saved');
  } catch (e) {
    errors.value = e.errors; // field-level messages from the server's validation
    toast.error(e.message);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="product ? 'Edit product' : 'New product'"
    wide
    @close="emit('close')"
  >
    <form class="grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="save">
      <BaseInput v-model="form.name" label="Name" :error="errors.name" class="sm:col-span-2" />
      <BaseInput v-model="form.sku" label="SKU" :error="errors.sku" />
      <BaseInput
        v-if="!product"
        v-model="form.stock"
        label="Opening stock"
        type="number"
        min="0"
        :error="errors.stock"
      />
      <div>
        <label for="pf-brand" class="mb-2 block text-sm">Brand</label>
        <select id="pf-brand" v-model="form.brand" class="field">
          <option value="" disabled>Choose…</option>
          <option v-for="b in brands" :key="b._id" :value="b._id">{{ b.name }}</option>
        </select>
        <p v-if="errors.brand" class="mt-1.5 text-xs text-red-700">{{ errors.brand }}</p>
      </div>
      <div>
        <label for="pf-cat" class="mb-2 block text-sm">Category</label>
        <select id="pf-cat" v-model="form.category" class="field">
          <option value="" disabled>Choose…</option>
          <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
        </select>
        <p v-if="errors.category" class="mt-1.5 text-xs text-red-700">{{ errors.category }}</p>
      </div>
      <BaseInput
        v-model="form.price"
        label="Price (USD)"
        type="number"
        min="0"
        step="0.01"
        :error="errors.price"
      />
      <BaseInput
        v-model="form.discountPrice"
        label="Discount price (optional)"
        type="number"
        min="0"
        step="0.01"
        :error="errors.discountPrice"
      />
      <div>
        <label for="pf-shape" class="mb-2 block text-sm">Frame shape</label>
        <select id="pf-shape" v-model="form.frameShape" class="field capitalize">
          <option value="">None</option>
          <option v-for="s in SHAPES" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <BaseInput v-model="form.frameMaterial" label="Material" />
      <div>
        <label for="pf-gender" class="mb-2 block text-sm">Gender</label>
        <select id="pf-gender" v-model="form.gender" class="field">
          <option value="unisex">Unisex</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
        </select>
      </div>
      <fieldset class="sm:col-span-2">
        <legend class="mb-2 text-sm">Colours</legend>
        <div class="flex flex-wrap gap-4 text-sm">
          <label v-for="c in COLORS" :key="c.name" class="flex items-center gap-2"
            ><input v-model="form.colors" type="checkbox" :value="c.name" /><span
              class="h-4 w-4 rounded-full ring-1 ring-stone/40"
              :style="{ background: c.hex }"
            />{{ c.name }}</label
          >
        </div>
      </fieldset>
      <div class="sm:col-span-2">
        <label for="pf-desc" class="mb-2 block text-sm">Description</label
        ><textarea id="pf-desc" v-model="form.description" rows="3" class="field h-auto py-3" />
      </div>
      <div class="sm:col-span-2">
        <label for="pf-img" class="mb-2 block text-sm">Image URLs (one per line)</label
        ><textarea
          id="pf-img"
          v-model="form.images"
          rows="3"
          class="field h-auto py-3"
          placeholder="https://…"
        />
        <p
          v-if="Object.keys(errors).some((k) => k.startsWith('images'))"
          class="mt-1.5 text-xs text-red-700"
        >
          Each image must be a full URL (https://…)
        </p>
      </div>
      <label class="flex items-center gap-2 text-sm"
        ><input v-model="form.featured" type="checkbox" /> Featured</label
      >
      <label class="flex items-center gap-2 text-sm"
        ><input v-model="form.isActive" type="checkbox" /> Visible in the shop</label
      >
      <div class="flex justify-end gap-3 sm:col-span-2">
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton
        ><BaseButton type="submit" :loading="saving">{{
          product ? 'Save changes' : 'Create product'
        }}</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
