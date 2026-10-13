<!--
  Category list in the filter column of article categories (replaces components/CategoryTree/CategoryTree.vue, see
  COMPONENT_OVERRIDES; the block "Sort and filter" renders it). Instead of the original's "back to the parent" link
  it shows the category list of the LTS shop, the same as beside the subcategory tiles: all main categories, the path
  to the current category open. Only from 992 px (window width); below, the breadcrumbs show the path.
-->
<template>
  <GlasJenaCategorySidebar :tree="categoryTree" class="gj-category-tree" data-testid="gj-category-tree" />
</template>

<script setup lang="ts">
import type { CategoryTreeProps } from '~/components/CategoryTree/types';
import GlasJenaCategorySidebar from './GlasJenaCategorySidebar.vue';

/* Same props as the original; the list is built from the category tree instead */
defineProps<CategoryTreeProps>();

const { data: categoryTree } = useCategoryTree();
</script>

<style scoped>
.gj-category-tree {
  display: none;
}

@media (min-width: 992px) {
  .gj-category-tree {
    display: block;
    margin-bottom: 1.5rem;
  }
}
</style>
