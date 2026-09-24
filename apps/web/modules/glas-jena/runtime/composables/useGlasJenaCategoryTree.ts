import { type CategoryTreeItem, categoryTreeGetters } from '@plentymarkets/shop-api';
import { isCategoryPathActive } from '../utils/navigation';

/**
 * Category tree, links and active path shared by the desktop and the mobile navigation.
 * Uses the categories of the header's Navigation block and falls back to the fetched category tree.
 */
export const useGlasJenaCategoryTree = (categories: () => CategoryTreeItem[]) => {
  const localePath = useLocalizedPath();
  const { buildCategoryMenuLink } = useLocalization();
  const { data: fetchedCategoryTree, getCategoryTree } = useCategoryTree();
  const route = useRoute();

  const resolvedCategories = computed(() => (categories().length > 0 ? categories() : fetchedCategoryTree.value));
  const categoryTree = ref<CategoryTreeItem[]>([]);

  /* getTree() touches the reactive source tree, so a computed would re-trigger itself (same pattern as the Navigation block) */
  watch(
    resolvedCategories,
    (tree) => {
      categoryTree.value = categoryTreeGetters.getTree(tree);
    },
    { immediate: true },
  );

  const buildLink = (category: CategoryTreeItem) => localePath(buildCategoryMenuLink(category, categoryTree.value));

  /** The category is the current page or one of its ancestors (the LTS shop highlights the whole path). */
  const isActive = (category: CategoryTreeItem) => isCategoryPathActive(route.path, buildLink(category));

  const hasChildren = (category: CategoryTreeItem) => category.childCount > 0 && (category.children?.length ?? 0) > 0;

  onNuxtReady(async () => {
    if (categories().length === 0 && fetchedCategoryTree.value.length === 0) {
      await getCategoryTree();
    }
  });

  return { categoryTree, buildLink, isActive, hasChildren };
};
