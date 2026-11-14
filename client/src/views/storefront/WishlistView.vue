<script setup>
import { Heart } from 'lucide-vue-next';
import ProductCard from '@/components/products/ProductCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { useWishlistStore } from '@/stores/wishlist';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/composables/useToast';

const wishlist = useWishlistStore();
const cart = useCartStore();
const toast = useToast();

function moveToCart(p) {
  cart.add({
    productId: p._id,
    slug: p.slug,
    name: p.name,
    brand: p.brand?.name,
    image: p.images?.[0],
    color: p.colors?.[0]?.name || '',
    price: p.discountPrice ?? p.price,
    stock: p.stock,
    qty: 1,
  });
  wishlist.toggle(p); // removes it from the wishlist
  toast.success(`${p.name} moved to your cart`);
}
</script>

<template>
  <div class="container-page py-12">
    <h1 class="text-5xl">Wishlist</h1>
    <EmptyState
      v-if="!wishlist.items.length"
      title="Nothing saved yet"
      description="Tap the heart on any frame to keep it here."
    >
      <template #icon><Heart class="h-7 w-7" /></template>
      <template #action><BaseButton to="/shop">Explore the collection</BaseButton></template>
    </EmptyState>
    <div v-else class="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
      <div v-for="p in wishlist.items" :key="p._id">
        <ProductCard :product="p" /><BaseButton
          size="sm"
          variant="secondary"
          class="mt-3 w-full"
          :disabled="p.stock === 0"
          @click="moveToCart(p)"
          >{{ p.stock ? 'Move to cart' : 'Sold out' }}</BaseButton
        >
      </div>
    </div>
  </div>
</template>
