<template>
  <div class="gj-hero-image" data-testid="gj-hero-image">
    <picture v-if="fallbackUrl">
      <source
        v-for="source in sources"
        :key="source.maxWidth"
        :media="`(max-width: ${source.maxWidth}px)`"
        :srcset="source.url"
        data-testid="gj-hero-image-source"
      />
      <img
        :src="fallbackUrl"
        :alt="alt"
        class="gj-hero-image__img"
        width="1000"
        height="631"
        fetchpriority="high"
        data-testid="gj-hero-image-img"
      />
    </picture>
  </div>
</template>

<script setup lang="ts">
import type { GlasJenaHeroImageProps } from './types';
import { getHeroImageSources, resolveHeroImageUrl } from '../../../utils/home';

/*
 * Large image at the top of the home page, like the LTS shop: fills its column and is cropped from the top, so the
 * lower part of the picture (the tea pot on the table) always stays visible. Its own block, so that it can later
 * become an automatically changing sequence of images without changing the page structure.
 */
const props = defineProps<GlasJenaHeroImageProps>();

const images = computed(() => props.content?.image ?? {});
const fallbackUrl = computed(() => resolveHeroImageUrl(images.value, 'wideScreen'));
const sources = computed(() => getHeroImageSources(images.value));
const alt = computed(() => images.value.alt?.trim() ?? '');
</script>

<style scoped>
/*
 * Height like the LTS shop: 391 px next to the "Did you know" box (the image column stretches to the box's height
 * if that is taller), stacked below it 47 % of the window width, at most 440 px. The LTS shop stacks below 992 px,
 * the shop's grid block below 1024 px (its tablet breakpoint), so the switch follows the grid.
 */
.gj-hero-image {
  position: relative;
  height: 100%;
  min-height: min(47vw, 27.5rem);
  overflow: hidden;
}

@media (min-width: 1024px) {
  .gj-hero-image {
    min-height: 24.4375rem;
  }
}

.gj-hero-image__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
}
</style>
