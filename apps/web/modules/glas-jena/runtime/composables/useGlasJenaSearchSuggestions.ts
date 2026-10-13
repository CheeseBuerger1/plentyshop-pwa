import type { ApiError, CategoryTreeItem, ItemSearchAutocompleteResult } from '@plentymarkets/shop-api';
import type { UseSearchSuggestionsReturn, UseSearchSuggestionsState } from '~/composables/useSearch/types';
import { filterSearchSuggestions, findCategoryPathByLink, getCategoryPathLabel } from '../utils/searchPreview';

const CATEGORY_LIMIT = 5;
const SUGGESTIONS_LIMIT = 5;
const ITEMS_LIMIT = 4;

/**
 * The shop's search suggestions (copy of composables/useSearch/useSearchSuggestions.ts, replaces the auto-import
 * `useSearchSuggestions`, see the module's `imports:extend` hook) with two changes, see utils/searchPreview.ts:
 * - the suggested search terms are filtered before they are cut to five: PlentyONE delivers word sequences from the
 *   article names, among them fragments like "für teekanne" (the original cuts first, so a wrapper could not filter)
 * - the matching categories carry their path from the third level on, e.g. "Teekannen › alle Filter"
 */
export const useSearchSuggestions: UseSearchSuggestionsReturn = () => {
  const state = useState<UseSearchSuggestionsState>('useSearchSuggestions', () => ({
    results: null as ItemSearchAutocompleteResult | null,
    searchTerm: '',
    loading: false,
    currentRequestId: 0,
  }));
  const { data: categoryTree } = useCategoryTree();
  const localePath = useLocalizedPath();
  const { buildCategoryMenuLink } = useLocalization();

  const buildLink = (category: CategoryTreeItem) => localePath(buildCategoryMenuLink(category, categoryTree.value));

  const searchSuggestions = async (text: string) => {
    const term = text.trim().slice(0, 80);

    if (term.length < 2) {
      state.value.currentRequestId++;
      state.value.results = null;
      state.value.loading = false;
      return;
    }

    if (state.value.searchTerm === term) {
      return;
    }

    const requestId = ++state.value.currentRequestId;
    state.value.loading = true;
    try {
      const { data } = await useSdk().plentysystems.getItemSearchAutocomplete({
        query: term,
        types: ['suggestion', 'category'],
      });

      if (data && requestId === state.value.currentRequestId) {
        data.categories = data?.categories?.splice(0, CATEGORY_LIMIT) ?? [];
        data.suggestions = filterSearchSuggestions(data?.suggestions ?? []).slice(0, SUGGESTIONS_LIMIT);
        data.items = data?.items?.splice(0, ITEMS_LIMIT) ?? [];
        state.value.searchTerm = term;
        state.value.results = data as unknown as ItemSearchAutocompleteResult;
      }
    } catch (error) {
      useHandleError(error as ApiError);
    } finally {
      if (requestId === state.value.currentRequestId) {
        state.value.loading = false;
      }
    }
  };

  const resetSuggestions = () => {
    state.value.currentRequestId++;
    state.value.results = null;
    state.value.searchTerm = '';
    state.value.loading = false;
  };

  const results = computed(() => {
    const shopResults = state.value.results;
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

  return {
    results,
    searchTerm: toRef(state.value, 'searchTerm'),
    loading: toRef(state.value, 'loading'),
    searchSuggestions,
    resetSuggestions,
  };
};
