<!--
  Sorting of the search page (used by pages/GlasJenaSearch.vue instead of CategorySorting). Copy of
  components/CategorySorting/CategorySorting.vue without the compact mode (only the "Sort" block uses it), with one
  change: the default sort of the search ("Relevanz") is offered even when the editor's list lacks it, see
  utils/searchSorting.ts. Same markup and test ids as the original, so glas-jena.css styles it alike.
-->
<template>
  <div class="w-full" data-testid="category-sorting">
    <div
      class="bg-primary-50/50 mb-4 px-4 py-2 rounded-none uppercase typography-headline-6 font-bold tracking-widest select-none"
    >
      {{ t('common.labels.sortBy') }}
    </div>
    <div class="px-4">
      <SfSelect id="sortBy" v-model="selected" :aria-label="t('common.labels.sortBy')" data-testid="select-sort-by">
        <option v-for="option in options" :key="option" :value="option">
          {{ t(`category.sorting.${option}`) }}
        </option>
      </SfSelect>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SfSelect } from '@storefront-ui/vue';
import { useRoute } from 'vue-router';
import { getSearchSortingOptions } from '../utils/searchSorting';

const { updateSorting } = useCategoryFilter();
const { getJsonSetting: availableSortingOptions } = useSiteSettings('availableSortingOptions');
const { getSetting: defaultSortingSearch } = useSiteSettings('defaultSortingSearch');

const route = useRoute();
const options = computed<string[]>(() => getSearchSortingOptions(availableSortingOptions(), defaultSortingSearch()));

const selected = computed<string>({
  get: () => {
    const sortQueryParam = route.query.sort;
    const currentSort = typeof sortQueryParam === 'string' ? sortQueryParam : '';
    if (currentSort && options.value.includes(currentSort)) {
      return currentSort;
    }
    return options.value[0] ?? '';
  },
  set: (value) => {
    if (!value) {
      return;
    }
    updateSorting(value);
  },
});
</script>
