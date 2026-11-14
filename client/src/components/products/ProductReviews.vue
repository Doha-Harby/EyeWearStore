<script setup>
import { ref, computed, onMounted } from 'vue';
import { Star, BadgeCheck } from 'lucide-vue-next';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import { getReviews, createReview, updateReview, deleteReview } from '@/services/account.service';
import { useAuthStore } from '@/stores/auth';
import { useConfirm } from '@/composables/useConfirm';
import { useToast } from '@/composables/useToast';
import { shortDate } from '@/utils/format';

const props = defineProps({ productId: { type: String, required: true } });
const auth = useAuthStore();
const { confirm } = useConfirm();
const toast = useToast();
const reviews = ref([]);
const loading = ref(true);
const form = ref({ rating: 0, title: '', comment: '' });
const editing = ref(false);
const error = ref('');
const busy = ref(false);

const mine = computed(() => reviews.value.find((r) => r.user?._id === auth.user?._id));
const average = computed(() =>
  reviews.value.length
    ? (reviews.value.reduce((n, r) => n + r.rating, 0) / reviews.value.length).toFixed(1)
    : null,
);
const load = async () => {
  try {
    reviews.value = await getReviews(props.productId);
  } finally {
    loading.value = false;
  }
};
onMounted(load);

function edit() {
  form.value = {
    rating: mine.value.rating,
    title: mine.value.title || '',
    comment: mine.value.comment || '',
  };
  editing.value = true;
}
async function submit() {
  error.value = '';
  busy.value = true;
  try {
    mine.value
      ? await updateReview(mine.value._id, form.value)
      : await createReview(props.productId, form.value);
    toast.success('Thanks for your review');
    editing.value = false;
    form.value = { rating: 0, title: '', comment: '' };
    await load();
  } catch (e) {
    error.value = e.errors?.rating || e.message;
  } finally {
    busy.value = false;
  }
}
async function remove() {
  if (
    !(await confirm({
      title: 'Delete your review?',
      message: 'This cannot be undone.',
      confirmText: 'Delete',
      tone: 'danger',
    }))
  )
    return;
  await deleteReview(mine.value._id).catch((e) => toast.error(e.message));
  load();
}
</script>

<template>
  <section aria-labelledby="reviews-h" class="border-t border-stone/20 pt-12">
    <div class="flex items-baseline justify-between">
      <h2 id="reviews-h" class="text-4xl">Reviews</h2>
      <p v-if="average" class="text-sm text-stone-deep">
        ★ {{ average }} · {{ reviews.length }} {{ reviews.length === 1 ? 'review' : 'reviews' }}
      </p>
    </div>

    <form
      v-if="auth.isAuthenticated && (!mine || editing)"
      class="mt-8 max-w-xl space-y-4 bg-ivory p-6"
      novalidate
      @submit.prevent="submit"
    >
      <div role="radiogroup" aria-label="Rating" class="flex gap-1">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          role="radio"
          :aria-checked="form.rating === n"
          :aria-label="`${n} stars`"
          @click="form.rating = n"
        >
          <Star :class="['h-7 w-7', n <= form.rating ? 'fill-gold text-gold' : 'text-stone']" />
        </button>
      </div>
      <BaseInput v-model="form.title" label="Title (optional)" />
      <div>
        <label for="rv-c" class="mb-2 block text-sm">Your review</label
        ><textarea id="rv-c" v-model="form.comment" rows="3" class="field h-auto py-3" />
      </div>
      <p v-if="error" class="text-xs text-red-700" role="alert">{{ error }}</p>
      <div class="flex gap-3">
        <BaseButton type="submit" :loading="busy">{{
          mine ? 'Save changes' : 'Post review'
        }}</BaseButton><BaseButton v-if="editing" variant="ghost" @click="editing = false"
          >Cancel</BaseButton
        >
      </div>
    </form>
    <p v-else-if="!auth.isAuthenticated" class="mt-6 text-sm text-stone-deep">
      <RouterLink
        :to="{ name: 'login', query: { redirect: $route.fullPath } }"
        class="underline underline-offset-4"
        >Sign in</RouterLink
      >
      to write a review.
    </p>

    <p v-if="!loading && !reviews.length" class="mt-8 text-sm text-stone-deep">
      No reviews yet. Be the first to share your thoughts.
    </p>
    <ul class="mt-8 divide-y divide-stone/20">
      <li v-for="r in reviews" :key="r._id" class="py-6">
        <div class="flex flex-wrap items-center gap-3">
          <span class="flex" :aria-label="`${r.rating} out of 5`"
            ><Star
              v-for="n in 5"
              :key="n"
              :class="['h-4 w-4', n <= r.rating ? 'fill-gold text-gold' : 'text-stone']"
          /></span>
          <span class="text-sm font-medium">{{ r.user?.name }}</span><span
            v-if="r.verifiedPurchase"
            class="flex items-center gap-1 text-xs text-gold-deep"
            ><BadgeCheck class="h-4 w-4" />Verified purchase</span
          ><span class="text-xs text-stone-deep">{{ shortDate(r.createdAt) }}</span>
        </div>
        <p v-if="r.title" class="mt-2 font-medium">{{ r.title }}</p>
        <p class="mt-1 text-sm text-stone-deep">{{ r.comment }}</p>
        <div v-if="mine && r._id === mine._id && !editing" class="mt-3 flex gap-4 text-sm">
          <button class="underline underline-offset-4" @click="edit">Edit</button
          ><button class="underline underline-offset-4" @click="remove">Delete</button>
        </div>
      </li>
    </ul>
  </section>
</template>
