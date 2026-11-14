<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { CheckCircle2 } from 'lucide-vue-next';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/composables/useToast';
import { createOrder, validateCoupon } from '@/services/orders.service';
import { getPaymentConfig, createCheckoutSession } from '@/services/payments.service';
import { money } from '@/utils/format';

const cart = useCartStore();
const toast = useToast();
const STEPS = ['Details', 'Shipping', 'Payment', 'Review'];
const METHODS = {
  standard: { label: 'Standard, 3–5 days', cost: 8 },
  express: { label: 'Express, 1–2 days', cost: 20 },
};
const FREE_OVER = 150; // display only: the server decides the real shipping cost

const step = ref(1);
const payMethod = ref('cod');
const stripeEnabled = ref(false);
onMounted(async () => {
  stripeEnabled.value = (await getPaymentConfig().catch(() => ({ stripe: false }))).stripe;
});
const shippingMethod = ref('standard');
const coupon = reactive({ code: '', applied: '', discount: 0, busy: false });
const placing = ref(false);
const order = ref(null);

const FIELDS = [
  ['fullName', 'Full name'],
  ['phone', 'Phone'],
  ['line1', 'Address'],
  ['line2', 'Apartment, suite (optional)'],
  ['city', 'City'],
  ['postalCode', 'Postal code'],
  ['country', 'Country'],
];
const { defineField, handleSubmit, errors } = useForm({
  validationSchema: yup.object({
    fullName: yup.string().trim().min(2, 'Enter your full name').required('Enter your full name'),
    phone: yup.string().trim().min(6, 'Enter a valid phone').required('Enter your phone'),
    line1: yup.string().trim().min(3, 'Enter your address').required('Enter your address'),
    line2: yup.string(),
    city: yup.string().trim().required('Enter your city'),
    postalCode: yup.string().trim().min(3, 'Enter a valid code').required('Enter your postal code'),
    country: yup.string().trim().min(2, 'Enter your country').required('Enter your country'),
  }),
});
const address = reactive(Object.fromEntries(FIELDS.map(([k]) => [k, defineField(k)[0]]))); // reactive() unwraps the refs for v-model

const shipping = computed(() =>
  cart.subtotal >= FREE_OVER ? 0 : METHODS[shippingMethod.value].cost,
);
const total = computed(() => cart.subtotal - coupon.discount + shipping.value);
const toShipping = handleSubmit(() => (step.value = 2));

async function applyCoupon() {
  coupon.busy = true;
  try {
    const r = await validateCoupon(coupon.code, cart.subtotal);
    Object.assign(coupon, { applied: r.code, discount: r.discount });
    toast.success(`Coupon ${r.code} applied`);
  } catch (e) {
    Object.assign(coupon, { applied: '', discount: 0 });
    toast.error(e.message);
  } finally {
    coupon.busy = false;
  }
}

async function placeOrder() {
  placing.value = true;
  try {
    order.value = await createOrder({
      items: cart.items.map((i) => ({
        productId: i.productId,
        qty: i.qty,
        color: i.color,
        prescription: i.prescription,
      })),
      shippingAddress: { ...address },
      shippingMethod: shippingMethod.value,
      paymentMethod: payMethod.value,
      couponCode: coupon.applied || undefined,
    });
    cart.clear();
    if (payMethod.value === 'stripe') {
      window.location.href = (await createCheckoutSession(order.value._id)).url; // off to Stripe's payment page
      return;
    }
    step.value = 5;
  } catch (e) {
    toast.error(e.message); // e.g. "Sorry, Aurelia Sunglass is low on stock"
  } finally {
    placing.value = false;
  }
}
</script>

<template>
  <div class="container-page py-12">
    <EmptyState
      v-if="step === 5"
      :title="`Thank you, order ${order.orderNumber} is confirmed`"
      description="You will pay in cash on delivery. You can follow the order in your account."
    >
      <template #icon><CheckCircle2 class="h-7 w-7" /></template>
      <template #action><BaseButton to="/account/orders">View my orders</BaseButton></template>
    </EmptyState>
    <EmptyState
      v-else-if="!cart.items.length"
      title="Your cart is empty"
      description="Add something first, then come back to check out."
    >
      <template #action><BaseButton to="/shop">Explore the collection</BaseButton></template>
    </EmptyState>

    <template v-else>
      <h1 class="text-5xl">Checkout</h1>
      <ol class="mt-6 flex gap-6 text-sm" aria-label="Checkout steps">
        <li
          v-for="(s, i) in STEPS"
          :key="s"
          :aria-current="step === i + 1 ? 'step' : undefined"
          :class="step === i + 1 ? 'border-b border-charcoal' : 'text-stone-deep'"
        >
          {{ i + 1 }}. {{ s }}
        </li>
      </ol>

      <div class="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem]">
        <div>
          <form
            v-if="step === 1"
            class="grid gap-5 sm:grid-cols-2"
            novalidate
            @submit.prevent="toShipping"
          >
            <BaseInput
              v-for="[k, label] in FIELDS"
              :key="k"
              v-model="address[k]"
              :label="label"
              :error="errors[k]"
              :class="k === 'line1' || k === 'line2' ? 'sm:col-span-2' : ''"
            />
            <BaseButton type="submit" class="sm:col-span-2">Continue to shipping</BaseButton>
          </form>

          <div v-else-if="step === 2" class="space-y-4">
            <label
              v-for="(m, key) in METHODS"
              :key="key"
              class="flex cursor-pointer items-center justify-between border border-stone/40 p-5 has-[:checked]:border-charcoal"
            >
              <span class="flex items-center gap-3"
                ><input v-model="shippingMethod" type="radio" name="shipping" :value="key" />
                {{ m.label }}</span
              >
              <span>{{ cart.subtotal >= FREE_OVER ? 'Free' : money(m.cost) }}</span>
            </label>
            <div class="flex gap-3">
              <BaseButton variant="ghost" @click="step = 1">Back</BaseButton
              ><BaseButton @click="step = 3">Continue to payment</BaseButton>
            </div>
          </div>

          <div v-else-if="step === 3" class="space-y-4">
            <label
              class="flex cursor-pointer items-center gap-3 border border-stone/40 p-5 has-[:checked]:border-charcoal"
              ><input v-model="payMethod" type="radio" name="pay" value="cod" /> Cash on
              delivery</label
            >
            <label
              v-if="stripeEnabled"
              class="flex cursor-pointer items-center gap-3 border border-stone/40 p-5 has-[:checked]:border-charcoal"
              ><input v-model="payMethod" type="radio" name="pay" value="stripe" /> Credit or debit
              card (secure payment by Stripe)</label
            >
            <p class="text-sm text-stone-deep">
              Card details are entered on Stripe's secure page and never touch our servers.
            </p>
            <div class="flex gap-3">
              <BaseButton variant="ghost" @click="step = 2">Back</BaseButton
              ><BaseButton @click="step = 4">Review order</BaseButton>
            </div>
          </div>

          <div v-else class="space-y-6">
            <div class="border border-stone/30 p-5 text-sm">
              <p class="font-medium">{{ address.fullName }}</p>
              <p>
                {{ address.line1 }}<template v-if="address.line2">, {{ address.line2 }}</template>
              </p>
              <p>{{ address.city }} {{ address.postalCode }}, {{ address.country }}</p>
              <p class="mt-2 text-stone-deep">
                {{ METHODS[shippingMethod].label }} ·
                {{ payMethod === 'stripe' ? 'Card payment' : 'Cash on delivery' }}
              </p>
            </div>
            <div class="flex gap-3">
              <BaseButton variant="ghost" @click="step = 3">Back</BaseButton
              ><BaseButton variant="gold" :loading="placing" @click="placeOrder"
                >Place order · {{ money(total) }}</BaseButton
              >
            </div>
          </div>
        </div>

        <aside class="h-fit space-y-4 bg-ivory p-6 text-sm">
          <h2 class="text-2xl">Order summary</h2>
          <ul class="space-y-2">
            <li
              v-for="i in cart.items"
              :key="i.productId + i.color"
              class="flex justify-between gap-3"
            >
              <span>{{ i.qty }} × {{ i.name }}</span
              ><span>{{ money(i.price * i.qty) }}</span>
            </li>
          </ul>
          <form class="flex gap-2" @submit.prevent="applyCoupon">
            <input
              v-model="coupon.code"
              aria-label="Coupon code"
              placeholder="Coupon code"
              class="field h-10"
            />
            <BaseButton
              type="submit"
              variant="secondary"
              size="sm"
              class="h-10"
              :loading="coupon.busy"
              :disabled="!coupon.code"
              >Apply</BaseButton
            >
          </form>
          <div class="space-y-1 border-t border-stone/30 pt-4">
            <p class="flex justify-between">
              <span>Subtotal</span><span>{{ money(cart.subtotal) }}</span>
            </p>
            <p v-if="coupon.discount" class="flex justify-between">
              <span>Discount ({{ coupon.applied }})</span><span>−{{ money(coupon.discount) }}</span>
            </p>
            <p class="flex justify-between">
              <span>Shipping</span><span>{{ shipping ? money(shipping) : 'Free' }}</span>
            </p>
            <p class="flex justify-between pt-2 text-base font-medium">
              <span>Total</span><span>{{ money(total) }}</span>
            </p>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>
