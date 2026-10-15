<template>
  <div ref="rootRef" class="gj-gallery" data-testid="gj-gallery">
    <Gallery :images="images" :configuration="configuration" />
    <div v-if="hasMoreImages" class="gj-gallery__nav" :style="navStyle">
      <button
        type="button"
        class="gj-gallery__arrow gj-gallery__arrow--previous"
        :aria-label="t('previous')"
        :title="t('previous')"
        data-testid="gj-gallery-previous"
        @click="showPrevious"
      />
      <button
        type="button"
        class="gj-gallery__arrow gj-gallery__arrow--next"
        :aria-label="t('next')"
        :title="t('next')"
        data-testid="gj-gallery-next"
        @click="showNext"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Swiper as SwiperType } from 'swiper';
import Gallery from '~/components/Gallery/Gallery.vue';
import type { GalleryProps } from '~/components/Gallery/types';

/** The big picture of the shop's gallery and its Swiper element (Swiper keeps its instance on the element). */
const MAIN_BOX_SELECTOR = '[data-testid="gallery-images"]';
const SWIPER_SELECTOR = `${MAIN_BOX_SELECTOR} .swiper`;

/*
 * The shop's product gallery with clear arrows for changing the picture (wish of the shop owner, 2026-10-15): the
 * original has them on the thumbnail strip as white squares, which the flat look leaves without frame and shadow,
 * hardly visible and easily taken for part of the strip; their labels are English only. Here they sit left and right
 * on the big picture like the LTS shop, at every width (on phones besides swiping), and page round in a loop like the
 * home page's carousel. The gallery itself stays the original; its own arrows are hidden.
 */
const props = defineProps<GalleryProps>();

const { t } = useI18n({ useScope: 'local' });
const rootRef = ref<HTMLElement | null>(null);
const hasMoreImages = computed(() => props.images.length > 1);

/* The arrows' area covers exactly the big picture, wherever the thumbnails are (below or beside it) */
const navStyle = ref<Record<string, string>>({});

const measure = () => {
  const root = rootRef.value;
  const mainBox = root?.querySelector<HTMLElement>(MAIN_BOX_SELECTOR);
  if (!root || !mainBox) {
    return;
  }
  const rootRect = root.getBoundingClientRect();
  const boxRect = mainBox.getBoundingClientRect();
  navStyle.value = {
    top: `${boxRect.top - rootRect.top}px`,
    left: `${boxRect.left - rootRect.left}px`,
    width: `${boxRect.width}px`,
    height: `${boxRect.height}px`,
  };
};

const getSwiper = () =>
  (rootRef.value?.querySelector(SWIPER_SELECTOR) as (HTMLElement & { swiper?: SwiperType }) | null)?.swiper;

/** One picture on, from the last one back to the first (and the other way round). */
const page = (direction: number) => {
  const swiper = getSwiper();
  if (!swiper) {
    return;
  }
  const count = swiper.slides.length;
  swiper.slideTo((swiper.activeIndex + direction + count) % count);
};

const showPrevious = () => page(-1);
const showNext = () => page(1);

let observer: ResizeObserver | null = null;

onMounted(() => {
  measure();
  observer = new ResizeObserver(measure);
  if (rootRef.value) {
    observer.observe(rootRef.value);
  }
  const mainBox = rootRef.value?.querySelector(MAIN_BOX_SELECTOR);
  if (mainBox) {
    observer.observe(mainBox);
  }
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<i18n lang="json">
{
  "en": { "previous": "Previous picture", "next": "Next picture" },
  "de": { "previous": "Vorheriges Bild", "next": "Nächstes Bild" }
}
</i18n>

<style scoped>
.gj-gallery {
  position: relative;
  height: 100%;
}

/* The original arrows on the thumbnail strip (replaced by the ones below) */
.gj-gallery :deep([data-testid='gallery'] button:is([aria-label='Previous'], [aria-label='Next'])) {
  display: none;
}

/* Over the big picture; only the arrows take clicks, swiping and the zoom stay on the picture */
.gj-gallery__nav {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  pointer-events: none;
}

/*
 * Line arrows like the home page's carousel, white on a semi-transparent slate blue field (75 %; wish of the shop
 * owner: the opaque field was too heavy), so they read as buttons on the white product photos and let the picture
 * show through: 44 px, always visible (touch screens have no hover). On white the field mixes to #78909f, white on it
 * 3.36:1 (needed 3:1; less opacity falls below, 55 % 2.31:1); on darker picture parts the contrast only grows.
 * A white field or the line alone was hardly visible on the white pictures.
 */
.gj-gallery__arrow {
  width: 2.75rem;
  height: 2.75rem;
  color: #fff;
  background-color: rgb(75 106 130 / 0.75);
  pointer-events: auto;
  cursor: pointer;
}

.gj-gallery__arrow::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: currentColor;
  mask: var(--gj-chevron) center / 1.5rem 1.5rem no-repeat;
}

/* Hover: the field turns opaque slate blue (5.70:1) */
.gj-gallery__arrow:hover {
  background-color: var(--gj-slate-blue);
}

.gj-gallery__arrow:focus-visible {
  outline: 2px solid #263238;
  outline-offset: 2px;
}

.gj-gallery__arrow--previous {
  --gj-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15 3L6 12L15 21' fill='none' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.gj-gallery__arrow--next {
  --gj-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 3L18 12L9 21' fill='none' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}
</style>
