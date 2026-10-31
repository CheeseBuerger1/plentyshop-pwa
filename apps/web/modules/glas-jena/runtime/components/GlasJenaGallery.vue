<template>
  <div ref="rootRef" class="gj-gallery" data-testid="gj-gallery" @click="onGalleryClick">
    <Gallery :images="images" :configuration="configuration" />
    <div
      v-if="images.length"
      v-show="isMeasured"
      class="gj-gallery__nav"
      :style="navStyle"
      data-testid="gj-gallery-nav"
    >
      <button
        type="button"
        class="gj-gallery__enlarge"
        :aria-label="t('enlarge')"
        data-testid="gj-gallery-enlarge"
        @click="openLightbox"
      />
      <template v-if="hasMoreImages">
        <button
          type="button"
          class="gj-image-button gj-image-button--previous gj-gallery__arrow"
          :aria-label="t('previous')"
          :title="t('previous')"
          data-testid="gj-gallery-previous"
          @click="showPrevious"
        />
        <button
          type="button"
          class="gj-image-button gj-image-button--next gj-gallery__arrow"
          :aria-label="t('next')"
          :title="t('next')"
          data-testid="gj-gallery-next"
          @click="showNext"
        />
      </template>
    </div>
    <GlasJenaLightbox ref="lightboxRef" :images="images" @close="onLightboxClose" />
  </div>
</template>

<script setup lang="ts">
import type { Swiper as SwiperType } from 'swiper';
import Gallery from '~/components/Gallery/Gallery.vue';
import type { GalleryProps } from '~/components/Gallery/types';
import GlasJenaLightbox from './GlasJenaLightbox.vue';

/** The big picture of the shop's gallery and its Swiper element (Swiper keeps its instance on the element). */
const MAIN_BOX_SELECTOR = '[data-testid="gallery-images"]';
const SWIPER_SELECTOR = `${MAIN_BOX_SELECTOR} .swiper`;

/*
 * The shop's product gallery with clear arrows for changing the picture and a lightbox (wishes of the shop owner,
 * 2026-10-15). The original has its arrows on the thumbnail strip as white squares, which the flat look leaves
 * without frame and shadow, hardly visible and easily taken for part of the strip; their labels are English only.
 * Here they sit left and right on the big picture like the LTS shop, at every width (on phones besides swiping), and
 * page round in a loop like the home page's carousel. A click on the big picture opens it large like the LTS shop's
 * lightbox (GlasJenaLightbox.vue); for the keyboard a button "Bild vergrößern" lies over the picture (invisible
 * until focused, mouse clicks go through to the picture). The gallery itself stays the original; its own arrows and
 * the phone hint "double tap to zoom" are hidden (a tap opens the lightbox).
 */
const props = defineProps<GalleryProps>();

const { t } = useI18n({ useScope: 'local' });
const rootRef = ref<HTMLElement | null>(null);
const lightboxRef = ref<InstanceType<typeof GlasJenaLightbox> | null>(null);
const hasMoreImages = computed(() => props.images.length > 1);

/*
 * The buttons' area covers exactly the big picture, wherever the thumbnails are (below or beside it). Hidden until it
 * is measured in the browser: in the server HTML it had no size yet and jumped onto the picture after hydration,
 * which PageSpeed counted as a layout shift of the item page (CLS 0.29 on phones, 0.15 on desktop, 2026-10-31); an
 * element that appears in its place is no shift.
 */
const navStyle = ref<Record<string, string>>({});
const isMeasured = ref(false);

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
  isMeasured.value = true;
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

const openLightbox = () => lightboxRef.value?.open(getSwiper()?.activeIndex ?? 0);

/* A click on the big picture opens the lightbox; Swiper marks the click that ends a drag as handled (no opening) */
const onGalleryClick = (event: MouseEvent) => {
  const target = event.target as Element;
  if (!event.defaultPrevented && target.closest?.(MAIN_BOX_SELECTOR)) {
    openLightbox();
  }
};

/* The gallery shows the picture last seen in the lightbox */
const onLightboxClose = (index: number) => getSwiper()?.slideTo(index);

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
  "en": { "previous": "Previous picture", "next": "Next picture", "enlarge": "Enlarge picture" },
  "de": { "previous": "Vorheriges Bild", "next": "Nächstes Bild", "enlarge": "Bild vergrößern" }
}
</i18n>

<style scoped>
.gj-gallery {
  position: relative;
  height: 100%;
}

/* The original arrows on the thumbnail strip (replaced by the ones below) and the phone hint for zooming */
.gj-gallery :deep([data-testid='gallery'] button:is([aria-label='Previous'], [aria-label='Next'])),
.gj-gallery :deep(.zoom-hint) {
  display: none;
}

/* The big picture opens the lightbox */
.gj-gallery :deep([data-testid='gallery-images']) {
  cursor: zoom-in;
}

/* Over the big picture; only the arrows take clicks, swiping and clicks on the picture stay on the picture */
.gj-gallery__nav {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  pointer-events: none;
}

.gj-gallery__arrow {
  position: relative;
  pointer-events: auto;
}

/* For the keyboard only: covers the picture, shows a frame while focused, lets mouse and touch through */
.gj-gallery__enlarge {
  position: absolute;
  inset: 0;
}

.gj-gallery__enlarge:focus-visible {
  outline: 2px solid #263238;
  outline-offset: -2px;
}
</style>
