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
});
