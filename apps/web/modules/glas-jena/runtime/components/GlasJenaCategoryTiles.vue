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
 * Subcategories as tiles, like the LTS shop: three per row (two on phones), square image, name below in Light,
 * centred, no frame. Hover/focus: the name turns dark and gets an underline (keyboard focus ring from the browser).
 */
.gj-category-tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem 1rem;
  margin: 0 0 2.5rem;
  padding: 0 1rem;
  list-style: none;
}

@media (min-width: 768px) {
  .gj-category-tiles {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2rem 1.5rem;
  }
}

.gj-category-tiles__link {
  display: block;
  text-align: center;
  text-decoration: none;
  color: #555;
}

.gj-category-tiles__image {
  display: block;
  /* As large as in the LTS shop (there the tiles share the row with the category list) */
  max-width: 17.5rem;
  margin: 0 auto;
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
  margin-top: 0.5rem;
  font-size: 1.25rem;
  font-weight: 300;
  line-height: 1.3;
  overflow-wrap: break-word;
}

@media (min-width: 768px) {
  .gj-category-tiles__name {
    font-size: 1.5rem;
  }
}

.gj-category-tiles__link:hover .gj-category-tiles__name,
.gj-category-tiles__link:focus-visible .gj-category-tiles__name {
  color: #222;
  text-decoration: underline;
}
</style>
