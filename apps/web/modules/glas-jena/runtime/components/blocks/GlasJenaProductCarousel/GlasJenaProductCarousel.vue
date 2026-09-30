<template>
  <section class="gj-product-carousel" :aria-labelledby="title ? titleId : undefined" data-testid="gj-product-carousel">
    <h2 v-if="title" :id="titleId" class="gj-product-carousel__title" data-testid="gj-product-carousel-title">
      {{ title }}
    </h2>
    <div v-if="products.length" class="gj-product-carousel__slider">
      <ProductSlider :items="products" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { GlasJenaProductCarouselProps } from './types';
import { PRODUCT_CAROUSEL_SORT_RANDOM, clampCarouselItems } from '../../../utils/home';

/*
 * Item carousel of the home page like the LTS shop ("Unsere Topseller"): a blue bar with the heading, below it the
 * items of one category with the shop's own item cards and slider (ProductSlider). Unlike the shop's "Recommended
 * products" block it shows up to 50 items in a chosen order (random like the LTS shop) and fetches them on the
 * server, so the item links are part of the page for search engines.
 */
const props = defineProps<GlasJenaProductCarouselProps>();

const { locale } = useI18n();
const titleId = useId();

const title = computed(() => props.content?.text?.title?.trim() ?? '');
const categoryId = computed(() => props.content?.source?.categoryId?.toString().trim() ?? '');
const sort = computed(() => props.content?.source?.sort || PRODUCT_CAROUSEL_SORT_RANDOM);
const itemsPerPage = computed(() => clampCarouselItems(props.content?.source?.itemsPerPage));

const { data } = useAsyncData(
  () =>
    `gj-product-carousel-${props.meta.uuid}-${categoryId.value}-${sort.value}-${itemsPerPage.value}-${locale.value}`,
  async () => {
    if (!categoryId.value) {
      return [];
    }
    try {
      const { data: facet } = await useSdk().plentysystems.getFacet({
        type: 'category',
        categoryId: categoryId.value,
        itemsPerPage: itemsPerPage.value,
        sort: sort.value,
      });
      return facet?.products ?? [];
    } catch {
      return [];
    }
  },
  { watch: [categoryId, sort, itemsPerPage, locale] },
);

const products = computed(() => data.value ?? []);
</script>

<style scoped>
/*
 * Bar like the LTS shop: full width, 48 px high, heading in white Light on the left (LTS 24.5 px at 14 px, scaled to
 * 28 px). The LTS mid blue #6e9abb reaches only 2.999:1 with white (needed 3:1 for large text), so it is darkened
 * a little to #6a94b4 (3.23:1).
 */
.gj-product-carousel__title {
  margin: 0 0 0.875rem;
  padding: 0.25rem 1.3125rem;
  font-size: 1.75rem;
  font-weight: 300;
  line-height: 1.4;
  color: #fff;
  background-color: #6a94b4;
}

/*
 * Items like the LTS shop: four per view on desktops, three on tablets (below 992 px), two on phones (below 576 px)
 * instead of the slider's fixed 192 px cards; the picture grows with the card. Arrows at the sides in the mid blue.
 */
.gj-product-carousel__slider {
  padding: 0 3.5rem;
}

/* Paging with the arrows and swiping end on a card's edge */
.gj-product-carousel :deep([data-testid='product-slider']) {
  gap: 1rem;
  scroll-snap-type: x mandatory;
}

.gj-product-carousel :deep([data-testid='product-card']) {
  width: calc((100% - 3rem) / 4);
  max-width: none;
  scroll-snap-align: start;
}

.gj-product-carousel :deep([data-testid='product-card'] .size-48) {
  width: 100%;
  height: auto;
}

/*
 * No rating stars on the cards (the shop shows no reviews; as requested by the shop owner). The editor's "Item card"
 * setting only reaches the item grid of category pages, the slider always shows them.
 */
.gj-product-carousel :deep([data-testid='product-card'] div:has(> [data-testid='rating'])) {
  display: none;
}

.gj-product-carousel__slider :deep(div:has(> [data-testid='product-slider']) > button) {
  color: #fff;
  background-color: #6a94b4;
}

/* The arrows sit in the margin next to the items, not over the first and last card */
.gj-product-carousel__slider :deep(div:has(> [data-testid='product-slider']) > button:first-child) {
  left: -3.5rem;
}

.gj-product-carousel__slider :deep(div:has(> [data-testid='product-slider']) > button:last-child) {
  right: -3.5rem;
}

@media (max-width: 991.98px) {
  .gj-product-carousel :deep([data-testid='product-card']) {
    width: calc((100% - 2rem) / 3);
  }
}

@media (max-width: 575.98px) {
  .gj-product-carousel__slider {
    padding: 0;
  }

  .gj-product-carousel__slider :deep(div:has(> [data-testid='product-slider']) > button:first-child) {
    left: 0;
  }

  .gj-product-carousel__slider :deep(div:has(> [data-testid='product-slider']) > button:last-child) {
    right: 0;
  }

  .gj-product-carousel :deep([data-testid='product-card']) {
    width: calc((100% - 1rem) / 2);
  }
}
</style>
