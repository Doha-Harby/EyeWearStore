<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Minus, Plus, PackageX } from 'lucide-vue-next';
import ProductImage from '@/components/common/ProductImage.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseBadge from '@/components/common/BaseBadge.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ProductReviews from '@/components/products/ProductReviews.vue';
import ZoomImage from '@/components/products/ZoomImage.vue';
import VirtualTryOn from '@/components/products/VirtualTryOn.vue';
import PrescriptionForm from '@/components/products/PrescriptionForm.vue';
import RelatedProducts from '@/components/products/RelatedProducts.vue';
import RecentlyViewed from '@/components/products/RecentlyViewed.vue';
import { useRecentStore } from '@/stores/recent';
import { getProduct } from '@/services/catalog.service';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/composables/useToast';
import { money } from '@/utils/format';

const route = useRoute();
const cart = useCartStore();
const toast = useToast();
const product = ref(null);
const loading = ref(true);
const error = ref('');
const image = ref(0);
const color = ref('');
const qty = ref(1);
const rx = ref({ enabled: false, valid: true, data: null }); // prescription form state
const recent = useRecentStore();
const isPrescription = computed(() => product.value?.category?.slug === 'eyeglasses');

// Re-runs when the slug changes, so navigating between products reloads the page content.
watch(
  () => route.params.slug,
  async (slug) => {
    loading.value = true;
    error.value = '';
    try {
      product.value = await getProduct(slug);
      recent.track(product.value);
      color.value = product.value.colors?.[0]?.name || '';
      image.value = 0;
      qty.value = 1;
      document.title = `${product.value.name} — LUMIÈRE`;
    } catch (e) {
      error.value =
        e.status === 404 ? 'This product does not exist or is no longer available.' : e.message;
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);

const price = computed(() => product.value?.discountPrice ?? product.value?.price);
const specs = computed(() => {
  const p = product.value;
  const d = p.dimensions || {};
  return [
    ['Frame shape', p.frameShape],
    ['Material', p.frameMaterial],
    ['For', p.gender],
    ['Size', d.lens ? `${d.lens}-${d.bridge}-${d.temple} mm` : ''],
    ['SKU', p.sku],
  ].filter(([, v]) => v);
});

function addToCart() {
  if (rx.value.enabled && !rx.value.valid)
    return toast.error('Please complete your prescription details');
  const p = product.value;
  cart.add({
    productId: p._id,
    slug: p.slug,
    name: p.name,
    brand: p.brand?.name,
    image: p.images?.[0],
    color: color.value,
    price: price.value,
    stock: p.stock,
    qty: qty.value,
    prescription: rx.value.enabled ? rx.value.data : undefined,
  });
  toast.success(`${p.name} added to your cart`);
}
</script>

<template>
  <div class="container-page py-10">
    <div v-if="loading" class="grid gap-10 md:grid-cols-2">
      <Skeleton class="aspect-[4/5] w-full" />
      <div class="space-y-4">
        <Skeleton class="h-4 w-24" /><Skeleton class="h-10 w-2/3" /><Skeleton
          class="h-6 w-32"
        /><Skeleton class="h-24 w-full" />
      </div>
    </div>
    <EmptyState v-else-if="error" title="Product not found" :description="error">
      <template #icon><PackageX class="h-7 w-7" /></template>
      <template #action
        ><BaseButton to="/shop" variant="secondary">Back to the collection</BaseButton></template
      >
    </EmptyState>

    <div v-else class="grid gap-10 md:grid-cols-2 lg:gap-16">
      <div>
        <ZoomImage :src="product.images?.[image]" :alt="product.name" />
        <div v-if="product.images?.length > 1" class="mt-3 grid grid-cols-5 gap-3">
          <button
            v-for="(src, i) in product.images"
            :key="src"
            :aria-label="`Show image ${i + 1}`"
            :aria-current="i === image"
            :class="['border-2', i === image ? 'border-charcoal' : 'border-transparent']"
            @click="image = i"
          >
            <ProductImage :src="src" :alt="`${product.name} view ${i + 1}`" />
          </button>
        </div>
      </div>

      <div>
        <p class="text-sm text-stone-deep">
          {{ product.brand?.name }} · {{ product.category?.name }}
        </p>
        <h1 class="mt-2 text-5xl">{{ product.name }}</h1>
        <p class="mt-4 text-xl">
          {{ money(price) }}
          <span v-if="product.discountPrice" class="ml-2 text-base text-stone-deep line-through">{{
            money(product.price)
          }}</span>
        </p>
        <p class="mt-6 max-w-prose leading-relaxed text-stone-deep">{{ product.description }}</p>

        <fieldset v-if="product.colors?.length" class="mt-8">
          <legend class="mb-3 text-sm">
            Colour: <span class="text-stone-deep">{{ color }}</span>
          </legend>
          <div class="flex gap-3">
            <button
              v-for="c in product.colors"
              :key="c.name"
              :aria-label="c.name"
              :aria-pressed="color === c.name"
              :style="{ background: c.hex }"
              :class="[
                'h-9 w-9 rounded-full ring-offset-2',
                color === c.name ? 'ring-2 ring-charcoal' : 'ring-1 ring-stone/40',
              ]"
              @click="color = c.name"
            />
          </div>
        </fieldset>
        <PrescriptionForm v-if="isPrescription" v-model="rx" class="mt-8" />

        <div class="mt-8 flex flex-wrap items-center gap-4">
          <div
            v-if="product.stock > 0"
            class="flex h-12 items-center border border-stone/60"
            role="group"
            aria-label="Quantity"
          >
            <button class="px-3" aria-label="Decrease quantity" :disabled="qty <= 1" @click="qty--">
              <Minus class="h-4 w-4" />
            </button>
            <span class="w-8 text-center text-sm" aria-live="polite">{{ qty }}</span>
            <button
              class="px-3"
              aria-label="Increase quantity"
              :disabled="qty >= Math.min(product.stock, 10)"
              @click="qty++"
            >
              <Plus class="h-4 w-4" />
            </button>
          </div>
          <BaseButton
            size="lg"
            class="flex-1 sm:flex-none"
            :disabled="product.stock === 0"
            @click="addToCart"
            >{{ product.stock === 0 ? 'Sold out' : 'Add to cart' }}</BaseButton
          >
        </div>
        <BaseBadge v-if="product.stock > 0 && product.stock < 5" class="mt-4" tone="warning"
          >Only {{ product.stock }} left</BaseBadge
        >

        <dl class="mt-10 divide-y divide-stone/20 border-y border-stone/20 text-sm">
          <div v-for="[k, v] in specs" :key="k" class="flex justify-between py-3">
            <dt class="text-stone-deep">{{ k }}</dt>
            <dd class="capitalize">{{ v }}</dd>
          </div>
        </dl>
      </div>
    </div>
    <template v-if="product && !loading && !error">
      <VirtualTryOn
        v-if="product.category?.slug !== 'accessories'"
        class="mt-16"
        :product-name="product.name"
      />
      <RelatedProducts :slug="product.slug" class="mt-16" />
      <RecentlyViewed :exclude="product._id" class="mt-16" />
    </template>
    <ProductReviews
      v-if="product && !loading && !error"
      :key="product._id"
      :product-id="product._id"
      class="mt-20"
    />
  </div>
</template>
