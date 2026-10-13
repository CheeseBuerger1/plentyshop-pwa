import type { CategoryTreeItem } from '@plentymarkets/shop-api';
import { useSearchSuggestions as useShopSearchSuggestions } from '~/composables/useSearch/useSearchSuggestions';
import type { UseSearchSuggestionsReturn } from '~/composables/useSearch/types';
import { findCategoryPathByLink, getCategoryPathLabel } from '../utils/searchPreview';

/**
 * The shop's search suggestions with one change (replaces the auto-import `useSearchSuggestions`, see the module's
 * `imports:extend` hook): the matching categories of the search preview carry their path from the third level on,
 * e.g. "Teekannen › alle Filter" instead of "alle Filter", see utils/searchPreview.ts.
 */
export const useSearchSuggestions: UseSearchSuggestionsReturn = () => {
  const suggestions = useShopSearchSuggestions();
  const { data: categoryTree } = useCategoryTree();
  const localePath = useLocalizedPath();
  const { buildCategoryMenuLink } = useLocalization();

  const buildLink = (category: CategoryTreeItem) => localePath(buildCategoryMenuLink(category, categoryTree.value));

  const results = computed(() => {
    const shopResults = suggestions.results.value;
    if (!shopResults?.categories?.length) {
      return shopResults;
    }
    return {
      ...shopResults,
      categories: shopResults.categories.map((category) => ({
        ...category,
        label: getCategoryPathLabel(
          findCategoryPathByLink(categoryTree.value, localePath(category.url), buildLink),
          category.label,
        ),
      })),
    };
  });

  return { ...suggestions, results };
};
