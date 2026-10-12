<!--
  Category page (replaces pages/[...slug].vue, see PAGE_OVERRIDES). Copy of the original with one change: a product
  category that has subcategories shows only these, as tiles (rule of the LTS shop), from 992 px with the category
  list beside them; one without subcategories shows its articles. In the editor (edit mode) the category template stays, so it can still be edited. Content categories
  keep their editor blocks. Everything else is the original; upstreamContract.spec.ts shows when the original changes.
-->
<template>
  <NuxtLayout
    name="default"
    :breadcrumbs="breadcrumbs"
    class="relative"
    :class="{ 'pointer-events-none opacity-50': loading }"
  >
    <SfLoaderCircular v-if="loading" class="fixed top-[50%] right-0 left-0 m-auto z-max" size="2xl" />
    <!-- Category list beside the tiles from 992 px (below: breadcrumbs of the layout, see glas-jena.css) -->
    <div v-if="hasSubcategories" class="gj-subcategories" data-testid="category-page-content">
      <GlasJenaCategorySidebar :tree="categoryTree" class="gj-subcategories__sidebar" />
      <GlasJenaCategoryTiles :categories="subcategories" :tree="categoryTree" class="gj-subcategories__tiles" />
    </div>
    <EditableBlocks
      v-else
      :identifier="identifier"
      :type="'category'"
      data-testid="category-page-content"
      :prevent-blocks-request="productsCatalog.category?.type === 'item'"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { breadcrumbGetters, categoryGetters } from '@plentymarkets/shop-api';
import type { Locale } from '#i18n';
import { SfLoaderCircular } from '@storefront-ui/vue';
import GlasJenaCategorySidebar from '../components/GlasJenaCategorySidebar.vue';
import GlasJenaCategoryTiles from '../components/GlasJenaCategoryTiles.vue';
import { getSubcategories } from '../utils/categoryTiles';

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const { setItemListMetaData } = useStructuredData();
const { setCategoriesPageMeta, getCategoryRobotsContent } = useUrlPageMeta();
const { setBlocksListContext } = useBlocksList();
const { getFacetsFromURL } = useCategoryFilter();
const { data: productsCatalog, loading } = useProducts();
const localePath = useLocalizedPath();
const { data: categoryTree } = useCategoryTree();
const { isEditMode } = useEditorState();
const isItemCategoryPage = computed(() => productsCatalog.value.category?.type === 'item');

/* Subcategories instead of articles (not in the editor's edit mode, where the category template is edited) */
const subcategories = computed(() =>
  isItemCategoryPage.value && !isEditMode.value
    ? getSubcategories(categoryTree.value, productsCatalog.value.category?.id)
    : [],
);
const hasSubcategories = computed(() => subcategories.value.length > 0);

const identifier = computed(() =>
  productsCatalog.value.category?.type === 'content' ? productsCatalog.value.category?.id : 0,
);

definePageMeta({
  layout: false,
  middleware: ['category-guard'],
  type: 'category',
  isBlockified: true,
  identifier: 0,
  cacheControl: getCacheControl(),
});

const breadcrumbs = computed(() => {
  const breadcrumb = breadcrumbGetters.mapFromCategoryBreadcrumbs(productsCatalog.value.breadcrumbs ?? []);
  breadcrumb.unshift({ name: t('common.labels.home'), link: '/' });

  return breadcrumb;
});

const canonicalDb = productsCatalog.value.category?.details?.[0]?.canonicalLink;

const handleQueryUpdate = async () => {
  if (!productsCatalog.value.category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found',
    });
  }
};

await handleQueryUpdate().then(() => {
  setCategoriesPageMeta(productsCatalog.value, getFacetsFromURL(), canonicalDb);
  setBlocksListContext(isItemCategoryPage.value ? 'productCategory' : 'content');
  if (isItemCategoryPage.value && !hasSubcategories.value) {
    setItemListMetaData(productsCatalog.value.products || []);
  }
});

const { setPageMeta } = usePageMeta();
const categoryName = computed(() => categoryGetters.getCategoryName(productsCatalog.value.category));
const icon = 'sell';
setPageMeta(categoryName.value, icon);

watch(
  () => locale.value,
  (changedLocale: string) => {
    router.push({
      path: localePath(`${productsCatalog.value.languageUrls[changedLocale]}`),
      query: route.query,
    });
  },
);

const headTitle = computed(() =>
  productsCatalog.value?.category
    ? ((categoryGetters.getMetaTitle(productsCatalog.value.category) || process.env.METATITLE) ?? '')
    : (process.env.METATITLE ?? ''),
);

const descriptionContent = computed(() =>
  productsCatalog.value?.category
    ? ((categoryGetters.getMetaDescription(productsCatalog.value.category) || process.env.METADESC) ?? '')
    : (process.env.METADESC ?? ''),
);

const keywordsContent = computed((): string =>
  productsCatalog.value?.category
    ? ((categoryGetters.getMetaKeywords(productsCatalog.value.category) || process.env.METAKEYWORDS) ?? '')
    : (process.env.METAKEYWORDS ?? ''),
);

const robotsContent = computed(() => getCategoryRobotsContent(productsCatalog));

watch(
  () => route.query,
  async () => {
    await handleQueryUpdate().then(() => {
      setCategoriesPageMeta(productsCatalog.value, getFacetsFromURL());
      if (isItemCategoryPage.value && !hasSubcategories.value) {
        setItemListMetaData(productsCatalog.value.products || []);
      }
    });
  },
);

watchEffect(() => {
  route.meta.identifier = productsCatalog.value.category?.type === 'content' ? productsCatalog.value.category?.id : 0;
});

useHead({
  title: headTitle,
  meta: [
    { name: 'description', content: descriptionContent },
    { name: 'keywords', content: keywordsContent },
    { name: 'robots', content: robotsContent.value },
  ],
});
</script>

<style scoped>
/* Subcategories: list of 270 px beside the tiles like the LTS shop; below 992 px (window width) only the tiles */
/* No padding around the tiles: their hover veil reaches the edge of the page box (the tiles have their own padding) */
.gj-subcategories {
  padding: 0;
}

.gj-subcategories__sidebar {
  display: none;
}

@media (min-width: 992px) {
  .gj-subcategories {
    display: grid;
    grid-template-columns: 16.875rem minmax(0, 1fr);
    gap: 1.875rem;
    align-items: start;
    padding-left: 1rem;
  }

  .gj-subcategories__sidebar {
    display: block;
  }
}
</style>
