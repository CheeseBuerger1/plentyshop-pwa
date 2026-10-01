<template>
  <section class="gj-product-carousel" :aria-labelledby="title ? titleId : undefined" data-testid="gj-product-carousel">
    <h2 v-if="title" :id="titleId" class="gj-product-carousel__title" data-testid="gj-product-carousel-title">
      {{ title }}
    </h2>
    <div v-if="products.length" ref="sliderRef" class="gj-product-carousel__slider">
      <button
        type="button"
        class="gj-product-carousel__arrow gj-product-carousel__arrow--previous"
        :aria-label="t('previous')"
        data-testid="gj-product-carousel-previous"
        @click="showPrevious"
      />
      <button
        type="button"
        class="gj-product-carousel__arrow gj-product-carousel__arrow--next"
        :aria-label="t('next')"
        data-testid="gj-product-carousel-next"
        @click="showNext"
      />
      <ProductSlider :items="products" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { GlasJenaProductCarouselProps } from './types';
import { PRODUCT_CAROUSEL_SORT_RANDOM, clampCarouselItems } from '../../../utils/home';

/** Scroll area of the shop's ProductSlider */
const SLIDER_SELECTOR = '[data-testid="product-slider"]';

/*
 * Item carousel of the home page like the LTS shop ("Unsere Topseller"): a blue bar with the heading, below it the
 * items of one category with the shop's own item cards and slider (ProductSlider). Unlike the shop's "Recommended
 * products" block it shows up to 50 items in a chosen order (random like the LTS shop) and fetches them on the
 * server, so the item links are part of the page for search engines.
 */
const props = defineProps<GlasJenaProductCarouselProps>();

const { locale } = useI18n();
const { t } = useI18n({ useScope: 'local' });
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

/*
 * Own arrows instead of the slider's buttons, like the LTS shop: always both visible, paging round in a loop (from
 * the end "next" goes back to the start, from the start "previous" to the end).
 */
const sliderRef = ref<HTMLElement | null>(null);
const getScrollArea = () => sliderRef.value?.querySelector<HTMLElement>(SLIDER_SELECTOR) ?? null;

const page = (direction: number) => {
  const area = getScrollArea();
  if (!area) {
    return;
  }
  const end = area.scrollWidth - area.clientWidth;
  if (direction > 0 && area.scrollLeft >= end - 1) {
    area.scrollTo({ left: 0 });
    return;
  }
  if (direction < 0 && area.scrollLeft <= 1) {
    area.scrollTo({ left: end });
    return;
  }
  area.scrollBy({ left: direction * area.clientWidth });
};

const showNext = () => page(1);
const showPrevious = () => page(-1);
</script>

<i18n lang="json">
{
  "en": { "previous": "Previous items", "next": "Next items" },
  "de": { "previous": "Vorherige Artikel", "next": "Nächste Artikel" }
}
</i18n>

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
  position: relative;
  padding: 0 3.5rem;
}

/* Paging with the arrows and swiping end on a card's edge */
.gj-product-carousel :deep([data-testid='product-slider']) {
  gap: 1rem;
  padding-bottom: 0;
  scroll-snap-type: x mandatory;
}

/* Less space below the items (as requested by the shop owner): the price note 8 px below the cards and above the
   next block instead of 32 px below the cards */
.gj-product-carousel__slider > :deep(div:last-child) {
  margin: 0.5rem 0;
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

/* The slider's own buttons are replaced by the arrows below */
.gj-product-carousel__slider :deep(div:has(> [data-testid='product-slider']) > button) {
  display: none;
}

/*
 * Thin line arrows like the "Did you know" box (2.75rem, lines 1.4 px) in the margin next to the items, centred on
 * the cards, in the bar's blue (3.23:1 on white). On phones the items are swiped, without arrows.
 */
.gj-product-carousel__arrow {
  position: absolute;
  top: 0;
  bottom: 2rem;
  z-index: 1;
  width: 2.75rem;
  height: 2.75rem;
  margin: auto 0;
  color: #6a94b4;
}

.gj-product-carousel__arrow::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: currentColor;
  mask: var(--gj-chevron) center / contain no-repeat;
}

.gj-product-carousel__arrow:hover {
  color: #4b6a82;
}

.gj-product-carousel__arrow:focus-visible {
  outline: 2px solid #263238;
  outline-offset: 2px;
}

.gj-product-carousel__arrow--previous {
  left: 0.375rem;
  --gj-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15 3L6 12L15 21' fill='none' stroke='black' stroke-width='0.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.gj-product-carousel__arrow--next {
  right: 0.375rem;
  --gj-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 3L18 12L9 21' fill='none' stroke='black' stroke-width='0.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
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

  .gj-product-carousel__arrow {
    display: none;
  }

  .gj-product-carousel :deep([data-testid='product-card']) {
    width: calc((100% - 1rem) / 2);
  }
}
</style>
