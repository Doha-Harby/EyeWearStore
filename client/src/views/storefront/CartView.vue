<script setup>
import { Minus, Plus, ShoppingBag, X } from 'lucide-vue-next';
import ProductImage from '@/components/common/ProductImage.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { useCartStore } from '@/stores/cart';
import { useConfirm } from '@/composables/useConfirm';
import { money } from '@/utils/format';

const cart = useCartStore();
const { confirm } = useConfirm();

async function remove(item) {
  if (
    await confirm({
      title: 'Remove this item?',
      message: `${item.name} will be removed from your cart.`,
      confirmText: 'Remove',
      tone: 'danger',
    })
  )
    cart.remove(item);
}
</script>

<template>
  <div class="container-page py-12">
    <h1 class="text-5xl">Your cart</h1>
    <EmptyState
      v-if="!cart.items.length"
      title="Your cart is empty"
      description="Frames you add will appear here."
    >
      <template #icon><ShoppingBag class="h-7 w-7" /></template>
      <template #action><BaseButton to="/shop">Explore the collection</BaseButton></template>
    </EmptyState>

    <div v-else class="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem]">
      <ul class="divide-y divide-stone/20 border-y border-stone/20">
        <li
          v-for="item in cart.items"
          :key="item.productId + item.color + JSON.stringify(item.prescription ?? '')"
          class="flex gap-5 py-6"
        >
          <RouterLink :to="`/product/${item.slug}`" class="w-24 shrink-0"
            ><ProductImage :src="item.image" :alt="item.name"
          /></RouterLink>
          <div class="flex flex-1 flex-col justify-between">
            <div class="flex justify-between gap-4">
              <div>
                <p class="text-xs text-stone-deep">{{ item.brand }}</p>
                <h2 class="text-xl">{{ item.name }}</h2>
                <p v-if="item.color" class="text-sm text-stone-deep">{{ item.color }}</p>
                <p v-if="item.prescription" class="text-xs text-gold-deep">
                  Prescription · {{ item.prescription.type }}, {{ item.prescription.coating }}
                </p>
              </div>
              <button
                class="self-start text-stone-deep hover:text-charcoal"
                :aria-label="`Remove ${item.name}`"
                @click="remove(item)"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div
                class="flex h-10 items-center border border-stone/60"
                role="group"
                aria-label="Quantity"
              >
                <button
                  class="px-3"
                  aria-label="Decrease quantity"
                  :disabled="item.qty <= 1"
                  @click="cart.setQty(item, item.qty - 1)"
                >
                  <Minus class="h-4 w-4" />
                </button>
                <span class="w-8 text-center text-sm">{{ item.qty }}</span>
                <button
                  class="px-3"
                  aria-label="Increase quantity"
                  :disabled="item.qty >= Math.min(item.stock, 10)"
                  @click="cart.setQty(item, item.qty + 1)"
                >
                  <Plus class="h-4 w-4" />
                </button>
              </div>
              <p>{{ money(item.price * item.qty) }}</p>
            </div>
          </div>
        </li>
      </ul>
      <aside class="h-fit bg-ivory p-6">
        <h2 class="text-2xl">Summary</h2>
        <p class="mt-4 flex justify-between text-sm">
          <span>Subtotal</span><span>{{ money(cart.subtotal) }}</span>
        </p>
        <p class="mt-2 text-xs text-stone-deep">Shipping and coupons are applied at checkout.</p>
        <BaseButton to="/checkout" class="mt-6 w-full">Checkout</BaseButton>
      </aside>
    </div>
  </div>
</template>
