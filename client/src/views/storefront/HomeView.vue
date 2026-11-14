<script setup>
import { ref, onMounted } from 'vue';
import { ArrowUpRight, Gem, Hammer, Leaf } from 'lucide-vue-next';
import ProductImage from '@/components/common/ProductImage.vue';
import ProductCard from '@/components/products/ProductCard.vue';
import Skeleton from '@/components/common/Skeleton.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import NewsletterForm from '@/components/forms/NewsletterForm.vue';
import { getProducts } from '@/services/catalog.service';

const collections = [
  {
    name: 'Sunglasses',
    blurb: 'Light, shade and effortless style',
    to: '/shop?category=sunglasses',
  },
  {
    name: 'Optical Frames',
    blurb: 'Everyday precision, beautifully made',
    to: '/shop?category=eyeglasses',
  },
  {
    name: 'Blue Light Glasses',
    blurb: 'Comfort for long days on screen',
    to: '/shop?category=blue-light-glasses',
  },
  {
    name: 'Luxury Collection',
    blurb: 'Titanium and hand-finished acetate',
    to: '/shop?sort=price_desc',
  },
];
const values = [
  {
    icon: Hammer,
    title: 'Made by hand',
    text: 'Every frame is cut, polished and finished in small batches.',
  },
  {
    icon: Gem,
    title: 'Considered materials',
    text: 'Premium acetate and titanium chosen for comfort and longevity.',
  },
  {
    icon: Leaf,
    title: 'Built to last',
    text: 'Designed to be worn for years, repaired rather than replaced.',
  },
];
// Sample quotes for the design. Replace with real, verified reviews once the review system is live.
const quotes = [
  {
    text: 'The most comfortable frames I have owned. They feel as good as they look.',
    who: 'Amelia H.',
  },
  { text: 'Beautiful packaging, fast delivery, and the finish is flawless.', who: 'Omar S.' },
  { text: 'Finally an eyewear brand that gets the details right.', who: 'Layla K.' },
];

const bestSellers = ref([]);
const newArrivals = ref([]);
const loading = ref(true);
onMounted(async () => {
  try {
    const [a, b] = await Promise.all([
      getProducts({ sort: 'popular', limit: 4 }),
      getProducts({ sort: 'newest', limit: 4 }),
    ]);
    bestSellers.value = a.items;
    newArrivals.value = b.items;
  } catch {
    /* sections simply stay hidden if the API is unreachable */
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="bg-ivory">
    <div class="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-28">
      <div>
        <p class="eyebrow">THE NEW COLLECTION</p>
        <h1 class="mt-5 text-5xl leading-[1.05] sm:text-7xl">See the World Differently.</h1>
        <p class="mt-6 max-w-md text-stone-deep">
          Handcrafted frames, designed in small batches and made to be worn for a lifetime.
        </p>
        <div class="mt-10 flex flex-wrap gap-3">
          <BaseButton to="/shop" size="lg">Explore Collection</BaseButton>
          <a href="#story" class="btn btn-secondary btn-lg">Discover Our Story</a>
        </div>
      </div>
      <div class="mx-auto w-full max-w-sm"><ProductImage alt="LUMIÈRE eyewear" /></div>
    </div>
  </section>

  <section class="container-page py-20" aria-labelledby="collections">
    <h2 id="collections" class="text-4xl sm:text-5xl">Shop by collection</h2>
    <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <RouterLink
        v-for="c in collections"
        :key="c.name"
        :to="c.to"
        class="group flex min-h-56 flex-col justify-between bg-ivory p-6 transition-colors hover:bg-charcoal hover:text-ivory"
      >
        <ArrowUpRight
          class="h-6 w-6 self-end text-gold-deep transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold"
          aria-hidden="true"
        />
        <div>
          <h3 class="text-3xl">{{ c.name }}</h3>
          <p class="mt-2 text-sm text-stone-deep group-hover:text-stone">{{ c.blurb }}</p>
        </div>
      </RouterLink>
    </div>
  </section>

  <template
    v-for="[title, items, id] in [
      ['Best sellers', bestSellers, 'best'],
      ['New arrivals', newArrivals, 'new'],
    ]"
    :key="id"
  >
    <section v-if="loading || items.length" class="container-page pb-20" :aria-labelledby="id">
      <div class="flex items-end justify-between">
        <h2 :id="id" class="text-4xl sm:text-5xl">{{ title }}</h2>
        <RouterLink to="/shop" class="text-sm underline underline-offset-4">View all</RouterLink>
      </div>
      <div class="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        <template v-if="loading"
          ><div v-for="n in 4" :key="n" class="space-y-3">
            <Skeleton class="aspect-[4/5] w-full" /><Skeleton class="h-3 w-1/3" /><Skeleton
              class="h-5 w-2/3"
            /></div
        ></template>
        <ProductCard v-for="p in items" v-else :key="p._id" :product="p" />
      </div>
    </section>
  </template>

  <section class="bg-charcoal text-ivory">
    <div class="container-page py-20 text-center">
      <p class="eyebrow !text-gold">WELCOME OFFER</p>
      <h2 class="mx-auto mt-4 max-w-2xl text-4xl sm:text-6xl">Ten percent off your first order</h2>
      <p class="mt-4 text-stone">
        Use code <span class="font-medium text-gold">WELCOME10</span> at checkout on orders over
        $50.
      </p>
      <BaseButton to="/shop" variant="gold" size="lg" class="mt-8">Start shopping</BaseButton>
    </div>
  </section>

  <section id="story" class="container-page scroll-mt-24 py-20" aria-labelledby="story-h">
    <div class="grid gap-12 md:grid-cols-2">
      <div>
        <p class="eyebrow">OUR STORY</p>
        <h2 id="story-h" class="mt-4 text-4xl sm:text-5xl">Eyewear, considered.</h2>
        <p class="mt-6 leading-relaxed text-stone-deep">
          LUMIÈRE began with a simple idea: glasses are the one accessory you wear every single day,
          so they should be extraordinary. We design timeless shapes, choose materials for how they
          feel on the face, and finish every pair by hand.
        </p>
      </div>
      <ul class="space-y-8">
        <li v-for="v in values" :key="v.title" class="flex gap-5">
          <component :is="v.icon" class="mt-1 h-6 w-6 shrink-0 text-gold-deep" aria-hidden="true" />
          <div>
            <h3 class="text-2xl">{{ v.title }}</h3>
            <p class="mt-1 text-sm text-stone-deep">{{ v.text }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>

  <section class="bg-ivory" aria-labelledby="quotes">
    <div class="container-page py-20">
      <h2 id="quotes" class="text-4xl sm:text-5xl">Loved by our customers</h2>
      <div class="mt-10 grid gap-6 md:grid-cols-3">
        <figure v-for="q in quotes" :key="q.who" class="bg-white p-8">
          <blockquote class="font-display text-2xl leading-snug">“{{ q.text }}”</blockquote>
          <figcaption class="mt-5 text-sm text-stone-deep">{{ q.who }}</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="container-page py-20 text-center" aria-labelledby="news">
    <h2 id="news" class="text-4xl sm:text-5xl">Join the inner circle</h2>
    <p class="mx-auto mt-3 mb-8 max-w-md text-sm text-stone-deep">
      New collections, private offers and care tips. No spam, unsubscribe any time.
    </p>
    <NewsletterForm />
  </section>
</template>
