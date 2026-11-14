<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import BaseBadge from '@/components/common/BaseBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import { getAdminReviews, hideReview } from '@/services/admin.service';
import { deleteReview } from '@/services/account.service';
import { useConfirm } from '@/composables/useConfirm';
import { useToast } from '@/composables/useToast';
import { shortDate } from '@/utils/format';

const { confirm } = useConfirm();
const toast = useToast();
const filters = reactive({ page: 1 });
const reviews = ref([]);
const meta = ref({ pages: 1 });
const loading = ref(true);
const error = ref('');
async function load() {
  loading.value = true;
  try {
    ({ items: reviews.value, meta: meta.value } = await getAdminReviews({ ...filters }));
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(load);
watch(() => filters.page, load);
async function toggle(r) {
  await hideReview(r._id, !r.isHidden).catch((e) => toast.error(e.message));
  load();
}
async function remove(r) {
  if (
    !(await confirm({
      title: 'Delete this review?',
      message: 'This cannot be undone.',
      confirmText: 'Delete',
      tone: 'danger',
    }))
  )
    return;
  await deleteReview(r._id).catch((e) => toast.error(e.message));
  load();
}
</script>

<template>
  <h1 class="text-4xl">Reviews</h1>
  <div v-if="loading" class="mt-6 space-y-3">
    <Skeleton v-for="n in 4" :key="n" class="h-20 w-full" />
  </div>
  <p v-else-if="error" class="mt-6 text-red-700" role="alert">{{ error }}</p>
  <p v-else-if="!reviews.length" class="mt-6 text-sm text-stone-deep">No reviews yet.</p>
  <ul v-else class="mt-6 space-y-3">
    <li v-for="r in reviews" :key="r._id" class="bg-white p-5 text-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p>
          <span class="font-medium">{{ r.product?.name }}</span> · ★ {{ r.rating }} ·
          {{ r.user?.name }} · {{ shortDate(r.createdAt) }}
        </p>
        <div class="flex items-center gap-2">
          <BaseBadge v-if="r.verifiedPurchase" tone="gold">Verified</BaseBadge
          ><BaseBadge v-if="r.isHidden" tone="dark">Hidden</BaseBadge>
          <BaseButton size="sm" variant="secondary" @click="toggle(r)">{{
            r.isHidden ? 'Show' : 'Hide'
          }}</BaseButton><BaseButton size="sm" variant="ghost" @click="remove(r)"
            >Delete</BaseButton
          >
        </div>
      </div>
      <p v-if="r.title" class="mt-2 font-medium">{{ r.title }}</p>
      <p class="mt-1 text-stone-deep">{{ r.comment }}</p>
    </li>
  </ul>
  <nav
    v-if="meta.pages > 1"
    class="mt-6 flex items-center justify-center gap-4"
    aria-label="Pagination"
  >
    <BaseButton variant="secondary" size="sm" :disabled="filters.page <= 1" @click="filters.page--"
      >Previous</BaseButton
    ><span class="text-sm text-stone-deep">Page {{ filters.page }} of {{ meta.pages }}</span
    ><BaseButton
      variant="secondary"
      size="sm"
      :disabled="filters.page >= meta.pages"
      @click="filters.page++"
      >Next</BaseButton
    >
  </nav>
</template>
