/**
 * Upstream contract of the category page.
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readApp = (path: string) => readFileSync(join(process.cwd(), 'app', path), 'utf8');

describe('upstream contract of the glas-jena module: category page', () => {
  it('should find the category page parts that the module copy GlasJenaCategoryPage builds on', () => {
    const page = readApp('pages/[...slug].vue');
    /* The copy shows the subcategories as tiles instead of EditableBlocks, the rest is the original */
    for (const part of [
      '<EditableBlocks',
      ':prevent-blocks-request="productsCatalog.category?.type === \'item\'"',
      "middleware: ['category-guard']",
      "type: 'category'",
      'isBlockified: true',
      'const { data: productsCatalog, loading } = useProducts();',
      "const isItemCategoryPage = computed(() => productsCatalog.value.category?.type === 'item');",
      'setCategoriesPageMeta(productsCatalog.value, getFacetsFromURL(), canonicalDb);',
      "setBlocksListContext(isItemCategoryPage.value ? 'productCategory' : 'content');",
      'setItemListMetaData(productsCatalog.value.products || []);',
      "route.meta.identifier = productsCatalog.value.category?.type === 'content'",
    ]) {
      expect(page).toContain(part);
    }
  });

  it('should find the category tree data and the editor state that the tiles rely on', () => {
    expect(readApp('composables/useCategoryTree/useCategoryTree.ts')).toContain('data');
    expect(readApp('composables/useEditorState/useEditorState.ts')).toContain(
      'const isEditMode = computed(() => !!$isEditor && disableActions.value);',
    );
    /* Image path as in the category data block: `<domain>/documents/<imagePath>` */
    expect(readApp('components/blocks/CategoryData/CategoryData.vue')).toContain(
      '`${runtimeConfig.public.domain}/documents/${imagePath.value}`',
    );
  });

  it('should find the category filter of the "Sort and filter" block that GlasJenaCategoryTree replaces', () => {
    /* The block renders CategoryTree in its filter column; the module shows the LTS category list there instead */
    const sortFilter = readApp('components/blocks/SortFilter/SortFilter.vue');
    expect(sortFilter).toContain('<CategoryTree');
    expect(sortFilter).toContain(':category="productsCatalog.category"');
    expect(readApp('components/CategoryTree/types.ts')).toContain('export type CategoryTreeProps');
    /* glas-jena.css gives the article column the top space of the list's heading */
    expect(readApp('components/blocks/structure/MultiGrid/MultiGrid.vue')).toContain('data-testid="multi-grid-column"');
  });

  it('should find the defaults and the pagination that the module changes for item lists', () => {
    /* utils/shopDefaults.ts replaces the auto-import `defaults` (100 articles per page instead of 50) */
    const defaults = readApp('composables/defaults.ts');
    expect(defaults).toContain('export const defaults = {');
    expect(defaults).toContain('DEFAULT_ITEMS_PER_PAGE,');
    expect(defaults).toContain('const PER_PAGE_STEPS: number[] = [10, 20, 50, 100];');
    /* glas-jena.css hides a pagination whose two arrows are both disabled (a single page) */
    const pagination = readApp('components/ui/Pagination/Pagination.vue');
    expect(pagination).toContain('data-testid="pagination-previous"');
    expect(pagination).toContain('data-testid="pagination-next"');
    expect(pagination).toContain(':disabled="pagination.selectedPage >= pagination.totalPages || disabled"');
  });

  it('should find the search result layout that glas-jena.css rearranges (sorting on top, no stars, no "per page")', () => {
    const layout = readApp('components/CategoryPageContent/CategoryPageContent.vue');
    expect(layout).toContain('data-testid="category-layout"');
    expect(layout).toContain('<div class="@md:flex gap-6" data-testid="category-page-content">');
    expect(layout).toContain('<CategorySidebar class="@md:w-[303px]"');
    expect(layout).toContain('data-testid="category-grid"');
    /* The sidebar's last child is the footer with the phone button; sorting and "per page" come from the search page */
    const sidebar = readApp('components/CategorySidebar/CategorySidebar.vue');
    expect(sidebar).toContain('data-testid="category-sidebar"');
    expect(sidebar).toContain('<div class="p-4 @md:mt-2 flex flex-wrap justify-between');
    /* Below 768 px the button "list settings" (in the row above the results) and the drawer's title row are hidden */
    expect(layout).toContain('<div class="flex-1">');
    expect(layout).toContain('<UiButton variant="tertiary" class="@md:hidden whitespace-nowrap" @click="open">');
    expect(sidebar).toContain('<div class="p-4 flex justify-between items-center @md:hidden">');
    expect(sidebar).toContain('v-show="isOpen"');
    const search = readApp('pages/search.vue');
    expect(search).toContain('<CategorySorting />');
    expect(search).toContain('<CategoryItemsPerPage class="mt-6"');
    /* Heading, select and its test id of the sorting; the test id of "per page" */
    const sorting = readApp('components/CategorySorting/CategorySorting.vue');
    expect(sorting).toContain('data-testid="category-sorting"');
    expect(sorting).toContain('data-testid="select-sort-by"');
    expect(readApp('components/CategoryItemsPerPage/CategoryItemsPerPage.vue')).toContain(
      'data-testid="category-items-per-page"',
    );
  });

  it('should find the breadcrumb structure that the one-line breadcrumbs rely on', () => {
    /* utils/breadcrumbsFit.ts measures `nav > ol`; glas-jena.css shows the "…" menu (first li) or all levels */
    const breadcrumbs = readApp('components/ui/Breadcrumbs/Breadcrumbs.vue');
    expect(breadcrumbs).toContain('<nav data-testid="breadcrumbs"');
    expect(breadcrumbs).toContain('<ol class="flex w-auto leading-none group @md:flex-wrap">');
    expect(breadcrumbs).toContain('<li class="flex items-center @sm:hidden text-neutral-500 z-overlap">');
    expect(breadcrumbs).toContain('data-testid="breadcrumbs-dropdown"');
    expect(breadcrumbs).toContain('<span v-else>');
  });
});
