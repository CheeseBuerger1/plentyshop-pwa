<template>
  <nav :aria-label="tLocal('label')" data-testid="gj-category-tiles">
    <ul class="gj-category-tiles">
      <li v-for="tile in tiles" :key="tile.id" class="gj-category-tiles__item">
        <!-- Image and name are one link; the image only repeats the name, so it has no text of its own -->
        <NuxtLink :to="tile.link" class="gj-category-tiles__link" data-testid="gj-category-tile">
          <span class="gj-category-tiles__image">
            <NuxtImg
              v-if="tile.imageUrl"
              :src="tile.imageUrl"
              alt=""
              width="300"
              height="300"
              loading="lazy"
              class="gj-category-tiles__img"
            />
          </span>
          <span class="gj-category-tiles__name">{{ tile.name }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { CategoryTreeItem } from '@plentymarkets/shop-api';
import { getCategoryImageUrl, getCategoryTileDetails } from '../utils/categoryTiles';

const props = defineProps<{
  /** Subcategories to show, in the order of the category tree */
  categories: CategoryTreeItem[];
  /** Complete category tree (the links are built from it) */
  tree: CategoryTreeItem[];
}>();

const { t: tLocal } = useI18n({ useScope: 'local' });
const localePath = useLocalizedPath();
const { buildCategoryMenuLink } = useLocalization();
const runtimeConfig = useRuntimeConfig();

const tiles = computed(() =>
  props.categories.map((category) => {
    const { name, imagePath } = getCategoryTileDetails(category);
    return {
      id: category.id,
      name,
      imageUrl: getCategoryImageUrl(runtimeConfig.public.domain, imagePath),
      link: localePath(buildCategoryMenuLink(category, props.tree)),
    };
  }),
);
</script>

<i18n lang="json">
{
  "en": { "label": "Subcategories" },
  "de": { "label": "Unterkategorien" }
}
</i18n>

<style scoped>
/*
 * Subcategories as tiles, like the LTS shop: three per row (two from 576 px, one below), square image of at most
 * 200 px, name below in Light, centred, no frame. Hover and keyboard focus like the LTS: a light slate blue veil
 * over the whole tile (10 %, fades in within 0.2 s), no underline; the keyboard focus also keeps the browser's ring.
 */
.gj-category-tiles {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin: 0 0 2.5rem;
  padding: 0;
  list-style: none;
}

@media (min-width: 576px) {
  .gj-category-tiles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .gj-category-tiles {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.gj-category-tiles__link {
  position: relative;
  display: block;
  padding: 2.5rem 0.5rem 1.5rem;
  text-align: center;
  text-decoration: none;
  color: #555;
}

.gj-category-tiles__link::after {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgb(74 103 124 / 10%);
  opacity: 0;
  transition: opacity 0.2s ease-in;
  pointer-events: none;
}

.gj-category-tiles__link:hover::after,
.gj-category-tiles__link:focus-visible::after {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .gj-category-tiles__link::after {
    transition: none;
  }
}

.gj-category-tiles__image {
  display: block;
  max-width: 12.5rem;
  margin: 0 auto 0.5rem;
  aspect-ratio: 1 / 1;
}

.gj-category-tiles__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.gj-category-tiles__name {
  display: block;
  font-size: 1.575rem;
  font-weight: 300;
  line-height: 1.1;
  overflow-wrap: break-word;
}
</style>
