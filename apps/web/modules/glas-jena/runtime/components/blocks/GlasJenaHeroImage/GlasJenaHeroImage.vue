<template>
  <div class="gj-hero-image" data-testid="gj-hero-image">
    <template v-for="(image, index) in images" :key="index">
      <img
        v-if="image && isRendered(index)"
        :src="image.src"
        :srcset="image.srcset || undefined"
        :sizes="image.srcset ? HERO_SLIDE_SIZES : undefined"
        :alt="index === current ? image.alt : ''"
        :aria-hidden="index === current ? undefined : 'true'"
        class="gj-hero-image__img"
        :class="{
          'gj-hero-image__img--current': index === current,
          'gj-hero-image__img--previous': index === previous,
        }"
        width="1000"
        height="631"
        :fetchpriority="index === 0 ? 'high' : undefined"
        :decoding="index === 0 ? undefined : 'async'"
        data-testid="gj-hero-image-img"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { GlasJenaHeroImageProps } from './types';
import { HERO_SLIDE_SIZES, clampHeroSliderInterval, getHeroSlideImage, getHeroSlides } from '../../../utils/home';

/*
 * Large image at the top of the home page, like the LTS shop: fills its column and is cropped from the top, so the
 * lower part of the picture always stays visible. With several images (as requested by the shop owner) they change
 * one after the other: every image stays for the set time (30 s), then the next one fades in over it. Only the first
 * image is part of the page; each further one is loaded one step ahead, shortly before it is due. Screen readers get
 * only the visible image's text. With "reduce motion" or a single image nothing changes.
 */
const props = defineProps<GlasJenaHeroImageProps>();

const images = computed(() => getHeroSlides(props.content).map(getHeroSlideImage));
const intervalMs = computed(() => clampHeroSliderInterval(props.content?.interval) * 1000);

const current = ref(0);
const previous = ref<number | undefined>(undefined);
const rendered = ref<number[]>([0]);

const isRendered = (index: number) => rendered.value.includes(index);

/** Index of the next image that has a picture, round in a loop. */
const getNext = (from: number) => {
  const count = images.value.length;
  for (let step = 1; step < count; step++) {
    const index = (from + step) % count;
    if (images.value[index]) {
      return index;
    }
  }
  return from;
};

/** Renders the image after the current one (hidden), so it is loaded when its turn comes. */
const preloadNext = () => {
  const next = getNext(current.value);
  if (!rendered.value.includes(next)) {
    rendered.value = [...rendered.value, next];
  }
};

const showNext = () => {
  const next = getNext(current.value);
  if (next === current.value || document.hidden) {
    return;
  }
  previous.value = current.value;
  current.value = next;
  preloadNext();
};

let timer: ReturnType<typeof setInterval> | undefined;

const stop = () => {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
};

const start = () => {
  stop();
  const changes = images.value.filter(Boolean).length > 1;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!changes || reduceMotion) {
    return;
  }
  preloadNext();
  timer = setInterval(showNext, intervalMs.value);
};

onMounted(start);
onBeforeUnmount(stop);

/* Editing in the editor: start again with the first image and the new time */
watch([images, intervalMs], () => {
  current.value = 0;
  previous.value = undefined;
  rendered.value = [0];
  start();
});
</script>

<style scoped>
/*
 * Height like the LTS shop: 391 px next to the "Did you know" box (the image column stretches to the box's height
 * if that is taller), stacked below it 47 % of the window width, at most 440 px. Stacked below 992 px like the LTS
 * shop (glas-jena.css).
 */
.gj-hero-image {
  position: relative;
  height: 100%;
  min-height: min(47vw, 27.5rem);
  overflow: hidden;
  /* The stacked images stay inside the block, never above the header's menus */
  isolation: isolate;
}

@media (min-width: 992px) {
  .gj-hero-image {
    min-height: 24.4375rem;
  }
}

/*
 * All images lie on top of each other. The current one fades in (2 s) over the previous one, which stays fully
 * visible underneath until then, so the change runs evenly without getting lighter in between.
 */
.gj-hero-image__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  opacity: 0;
}

.gj-hero-image__img--previous {
  z-index: 1;
  opacity: 1;
}

.gj-hero-image__img--current {
  z-index: 2;
  opacity: 1;
  transition: opacity 2s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .gj-hero-image__img--current {
    transition: none;
  }
}
</style>
