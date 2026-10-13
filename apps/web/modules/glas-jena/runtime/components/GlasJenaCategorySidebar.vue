<template>
  <nav class="gj-category-sidebar" :aria-label="tLocal('title')" data-testid="gj-category-sidebar">
    <p class="gj-category-sidebar__title" aria-hidden="true">{{ tLocal('title') }}</p>
    <ul class="gj-category-sidebar__list">
      <li
        v-for="row in rows"
        :key="row.category.id"
        class="gj-category-sidebar__item"
        :class="[
          `gj-category-sidebar__item--level-${Math.min(row.depth, MAX_INDENT_LEVEL)}`,
          { 'gj-category-sidebar__item--active': row.active },
        ]"
        data-testid="gj-category-sidebar-item"
      >
        <button
          v-if="row.hasChildren"
          type="button"
          class="gj-category-sidebar__toggle"
          :aria-expanded="row.expanded"
          :aria-label="tLocal(row.expanded ? 'collapse' : 'expand', { name: row.name })"
          data-testid="gj-category-sidebar-toggle"
          @click="toggle(row.category.id)"
        >
          <SfIconExpandMore v-if="row.expanded" size="xs" aria-hidden="true" />
          <SfIconChevronRight v-else size="xs" aria-hidden="true" />
        </button>
        <NuxtLink :to="row.link" class="gj-category-sidebar__link" :aria-current="row.current ? 'page' : undefined">
          {{ row.name }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { SfIconChevronRight, SfIconExpandMore } from '@storefront-ui/vue';
import type { CategoryTreeItem } from '@plentymarkets/shop-api';
import { getCategorySidebarRows, getCategoryTileDetails } from '../utils/categoryTiles';
import { isCategoryPathActive } from '../utils/navigation';

/** Deeper levels keep the indent of this one (the shop has four levels) */
const MAX_INDENT_LEVEL = 3;

const props = defineProps<{
  /** Complete category tree */
  tree: CategoryTreeItem[];
}>();

const { t: tLocal } = useI18n({ useScope: 'local' });
const localePath = useLocalizedPath();
const { buildCategoryMenuLink } = useLocalization();
const route = useRoute();

const buildLink = (category: CategoryTreeItem) => localePath(buildCategoryMenuLink(category, props.tree));
const isActive = (category: CategoryTreeItem) => isCategoryPathActive(route.path, buildLink(category));

/*
 * Open are the categories on the path to the current page, like the LTS shop; the arrows open and close single
 * categories on top of that (reset when the page changes).
 */
const toggled = ref<Record<number, boolean>>({});
const isExpanded = (category: CategoryTreeItem) => toggled.value[category.id] ?? isActive(category);
const toggle = (id: number) => {
  const category = rows.value.find((row) => row.category.id === id);
  toggled.value = { ...toggled.value, [id]: !category?.expanded };
};
watch(
  () => route.path,
  () => {
    toggled.value = {};
  },
);

const rows = computed(() =>
  getCategorySidebarRows(props.tree, isExpanded).map((row) => {
    const link = buildLink(row.category);
    return {
      ...row,
      link,
      name: getCategoryTileDetails(row.category).name,
      active: isActive(row.category),
      /* Both paths contain each other: the category is the current page itself */
      current: isActive(row.category) && isCategoryPathActive(link, route.path),
    };
  }),
);
</script>

<i18n lang="json">
{
  "en": { "title": "Categories", "expand": "Show subcategories of {name}", "collapse": "Hide subcategories of {name}" },
  "de": {
    "title": "Kategorien",
    "expand": "Unterkategorien von {name} anzeigen",
    "collapse": "Unterkategorien von {name} ausblenden"
  }
}
</i18n>

<style scoped>
/*
 * Category list beside the subcategory tiles, like the LTS shop: heading "Kategorien" in mid blue, all main
 * categories, the path to the current category open and on grey blue (LTS: soft green). Sizes of the LTS shop (main categories
 * 18.2 px / 48 px high, below 15.4 px / 37 px, 17.5 px more indent per level). The arrow stands in the indent.
 */
.gj-category-sidebar__title {
  margin: 0;
  padding: 1.05rem 1.5rem 1.05rem 0.4375rem;
  font-size: 1.3125rem;
  line-height: 1.5;
  /* Darker than the LTS blue #6e9abb (3.0:1 on white), which is too weak for text of this size */
  color: var(--gj-slate-blue);
}

.gj-category-sidebar__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.gj-category-sidebar__item {
  --gj-sidebar-indent: 1.53125rem;
  position: relative;
  font-size: 0.9625rem;
  color: #495057;
}

.gj-category-sidebar__item--level-0 {
  font-size: 1.1375rem;
}

.gj-category-sidebar__item--level-1 {
  --gj-sidebar-indent: 2.625rem;
}

.gj-category-sidebar__item--level-2 {
  --gj-sidebar-indent: 3.71875rem;
}

.gj-category-sidebar__item--level-3 {
  --gj-sidebar-indent: 4.8125rem;
}

/* Grey blue like the active path of the main navigation (the LTS marks it soft green, #ebf4eb) */
.gj-category-sidebar__item--active {
  background-color: var(--gj-menu-active);
  color: #212529;
}

.gj-category-sidebar__link {
  display: block;
  padding: 0.4375rem 0.5rem 0.4375rem var(--gj-sidebar-indent);
  line-height: 1.5;
  text-decoration: none;
  color: inherit;
  overflow-wrap: break-word;
}

.gj-category-sidebar__item--level-0 > .gj-category-sidebar__link {
  padding-block: 0.65625rem;
}

.gj-category-sidebar__item:not(.gj-category-sidebar__item--active) > .gj-category-sidebar__link:hover {
  background-color: #f8f9fa;
  color: #212529;
}

/* Arrow in the indent, right before the name; 24 px target */
.gj-category-sidebar__toggle {
  position: absolute;
  top: 50%;
  left: calc(var(--gj-sidebar-indent) - 1.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  transform: translateY(-50%);
  color: inherit;
}
</style>
