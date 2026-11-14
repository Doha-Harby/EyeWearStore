<script setup>
import { Heart } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import ProductImage from '@/components/common/ProductImage.vue';
import BaseBadge from '@/components/common/BaseBadge.vue';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import { useToast } from '@/composables/useToast';
import { money } from '@/utils/format';

const props = defineProps({ product: { type: Object, required: true }, list: Boolean });
const auth = useAuthStore();
const wishlist = useWishlistStore();
const router = useRouter();
const toast = useToast();

function toggleWish() {
  if (!auth.isAuthenticated) {
    toast.info('Sign in to save favourites');
    return router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
  }
  wishlist.toggle(props.product);
}
</script>

<template>
  <RouterLink :to="`/product/${product.slug}`" :class="['group block', list && 'flex gap-6']">
    <div :class="['relative', list && 'w-40 shrink-0 sm:w-52']">
      <div class="overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
        <ProductImage :src="product.images?.[0]" :alt="product.name" />
      </div>
      <BaseBadge v-if="product.stock === 0" class="absolute left-3 top-3" tone="dark"
        >Sold out</BaseBadge
      >
      <BaseBadge v-else-if="product.discountPrice" class="absolute left-3 top-3" tone="gold"
        >Sale</BaseBadge
      >
      <!-- click.prevent.stop: toggling the heart must not follow the card's link -->
      <button
        type="button"
        class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 hover:bg-white"
        :aria-label="wishlist.has(product._id) ? 'Remove from wishlist' : 'Add to wishlist'"
        :aria-pressed="wishlist.has(product._id)"
        @click.prevent.stop="toggleWish"
      >
        <Heart
          :class="[
            'h-4 w-4',
            wishlist.has(product._id) ? 'fill-gold-deep text-gold-deep' : 'text-charcoal',
          ]"
        />
      </button>
    </div>
    <div :class="list && 'flex flex-col justify-center'">
      <p class="mt-4 text-xs text-stone-deep" :class="list && '!mt-0'">{{ product.brand?.name }}</p>
      <h3 class="mt-1 text-xl">{{ product.name }}</h3>
      <p v-if="product.ratingCount" class="mt-1 text-xs text-stone-deep">
        ★ {{ product.ratingAvg }} ({{ product.ratingCount }})
      </p>
      <p v-if="list" class="mt-2 hidden max-w-md text-sm text-stone-deep sm:block">
        {{ product.description }}
      </p>
      <p class="mt-1 text-sm">
        <template v-if="product.discountPrice"
          ><span class="mr-2">{{ money(product.discountPrice) }}</span
          ><span class="text-stone-deep line-through">{{ money(product.price) }}</span></template
        >
        <template v-else>{{ money(product.price) }}</template>
      </p>
    </div>
  </RouterLink>
</template>
