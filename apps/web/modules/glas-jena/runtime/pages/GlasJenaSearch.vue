<!--
  Search results (replaces pages/search.vue, see PAGE_OVERRIDES). Copy of the original with three changes, so the
  page is built like an article category (wish of the shop owner):
  - the category list of the shop in the column beside the results (shown from 992 px, see glas-jena.css)
  - breadcrumbs "home / search" (shown below 992 px, where the category list is hidden)
  - its own sorting (GlasJenaSearchSorting) that offers "Relevanz" although the editor list lacks it
  The layout itself (three results per row, sorting on the right above them) is done in glas-jena.css.
  Everything else is the original; upstreamContractCategoryPage.spec.ts shows when the original changes.
-->
<template>
  <NuxtLayout name="default" :breadcrumbs="breadcrumbs">
    <div data-testid="search-results" class="relative" :class="{ 'pointer-events-none opacity-50': loading }">
      <SfLoaderCircular v-if="loading" class="fixed top-[50%] right-0 left-0 m-auto z-max" size="2xl" />
      <CategoryPageContent
        v-if="productsCatalog"
        :title="t('search.searchResults', { phrase: route.query.term })"
        :total-products="productsCatalog.pagination.totals"
        :products="productsCatalog.products"
        :items-per-page="Number(productsPerPage)"
      >
        <template #sidebar>
          <GlasJenaCategorySidebar :tree="categoryTree" class="gj-search-tree" data-testid="gj-search-tree" />
          <GlasJenaSearchSorting />
          <CategoryItemsPerPage class="mt-6" :total-products="productsCatalog.pagination.totals" />
          <CategoryFilters v-if="facetGetters.hasFilters(productsCatalog.facets)" :facets="productsCatalog.facets" />
        </template>
      </CategoryPageContent>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { facetGetters } from '@plentymarkets/shop-api';
import { SfLoaderCircular } from '@storefront-ui/vue';
import type { Locale } from '#i18n';
import GlasJenaCategorySidebar from '../components/GlasJenaCategorySidebar.vue';
import GlasJenaSearchSorting from '../components/GlasJenaSearchSorting.vue';

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const { getRobots, setRobotForStaticPage } = useRobots();
const { setItemListMetaData } = useStructuredData();

definePageMeta({
  layout: false,
  type: 'search',
});

const route = useRoute();
const { getSearch, data: productsCatalog, productsPerPage, loading } = useSearch();
const { getFacetsFromURL } = useCategoryFilter();
const { data: categoryTree } = useCategoryTree();
/* Own short text (below); shop texts come from the global `t` */
const { t: tLocal } = useI18n({ useScope: 'local' });

const breadcrumbs = computed(() => [
  { name: t('common.labels.home'), link: '/' },
  { name: tLocal('search'), link: route.fullPath },
]);

const handleQueryUpdate = async () => {
  await getSearch(getFacetsFromURL());
  setItemListMetaData(productsCatalog.value?.products || []);
};

await handleQueryUpdate();

watch(
  () => route.query,
  async () => {
    handleQueryUpdate();
  },
);

await getRobots();
setRobotForStaticPage('SearchResult');
</script>

<i18n lang="json">
{
  "en": { "search": "Search" },
  "de": { "search": "Suche" }
}
</i18n>
