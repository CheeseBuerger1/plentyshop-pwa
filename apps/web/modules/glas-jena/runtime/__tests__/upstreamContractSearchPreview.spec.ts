/**
 * Upstream contract of the search preview (the suggestions below the search bar of the header).
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IMPORT_OVERRIDES } from '../../index';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const APP_DIR = join(process.cwd(), 'app');
const readApp = (path: string) => readFileSync(join(APP_DIR, path), 'utf8');

/** Files of the shop whose auto-import the module replaces, in the order of IMPORT_OVERRIDES */
const REPLACED_IMPORT_FILES = [
  'composables/defaults.ts',
  'composables/useSearch/useSearchSuggestions.ts',
  'composables/useStructuredData/useStructuredData.ts',
];

describe('upstream contract of the glas-jena module: search preview', () => {
  it('should find every auto-import of the shop that the module replaces', () => {
    expect(IMPORT_OVERRIDES).toHaveLength(REPLACED_IMPORT_FILES.length);
    IMPORT_OVERRIDES.forEach((override, index) => {
      const file = REPLACED_IMPORT_FILES[index] ?? '';
      expect(existsSync(join(APP_DIR, file))).toBe(true);
      expect(override.file.test(`/app/${file}`)).toBe(true);
      expect(readApp(file)).toContain(`export const ${override.name}`);
    });
  });

  it('should find the search suggestions that useGlasJenaSearchSuggestions copies', () => {
    /* The copy differs in two places (filter before the cut to five, categories with path); the rest is the original */
    const suggestions = readApp('composables/useSearch/useSearchSuggestions.ts');
    for (const part of [
      'const CATEGORY_LIMIT = 5;',
      'const SUGGESTIONS_LIMIT = 5;',
      'const ITEMS_LIMIT = 4;',
      'export const useSearchSuggestions: UseSearchSuggestionsReturn = () => {',
      "const state = useState<UseSearchSuggestionsState>('useSearchSuggestions', () => ({",
      'results: null as ItemSearchAutocompleteResult | null,',
      'const term = text.trim().slice(0, 80);',
      'if (term.length < 2) {',
      'if (state.value.searchTerm === term) return;',
      'const { data } = await useSdk().plentysystems.getItemSearchAutocomplete({',
      "types: ['suggestion', 'category'],",
      'data.categories = data?.categories?.splice(0, CATEGORY_LIMIT) ?? [];',
      'data.suggestions = data?.suggestions?.splice(0, SUGGESTIONS_LIMIT) ?? [];',
      'data.items = data?.items?.splice(0, ITEMS_LIMIT) ?? [];',
      'useHandleError(error as ApiError);',
      'const resetSuggestions = () => {',
      "results: toRef(state.value, 'results'),",
      "searchTerm: toRef(state.value, 'searchTerm'),",
      "loading: toRef(state.value, 'loading'),",
    ]) {
      expect(suggestions).toContain(part);
    }
    /* 64 lines: a longer original has new logic that the copy lacks */
    expect(suggestions.trimEnd().split('\n').length).toBeLessThanOrEqual(64);
    expect(readApp('composables/useSearch/types.ts')).toContain('export type UseSearchSuggestionsReturn');
  });

  it('should find the structure of the preview that glas-jena.css restyles', () => {
    const search = readApp('components/ui/Search.vue');
    for (const part of [
      /* The preview is a <section>, the line "Alle Ergebnisse …" its direct link with the parts in a span */
      ':aria-label="t(\'searchBar.searchSuggestions\')"',
      '<span class="flex items-center gap-1 min-w-0">',
      /* Categories: the only list that wraps; the path comes from `category.label` */
      '<ul v-if="results?.categories?.length" class="flex flex-wrap gap-1.5">',
      ':to="category.url"',
      '{{ category.label }}',
      /* Suggested articles: container `products` for the compact lines */
      '<div class="min-w-0 @container/products">',
      '<UiSearchSuggestionProduct :item="item" />',
      '<UiSearchSuggestionItem :item="item" />',
    ]) {
      expect(search).toContain(part);
    }
  });

  it('should find the suggestion entries that glas-jena.css restyles', () => {
    expect(readApp('components/ui/Search/SearchSuggestionItem.vue')).toContain('data-testid="search-suggestion-item"');
    /* Compact lines: picture (first div) beside name and price (last div) */
    const product = readApp('components/ui/Search/SearchSuggestionProduct.vue');
    expect(product).toContain('data-testid="search-suggestion-product"');
    expect(product).toContain('class="group/card flex flex-col rounded-lg overflow-hidden ring-1 ring-neutral-200');
    expect(product).toContain('<div class="aspect-[4/3] overflow-hidden">');
    expect(product).toContain('<div class="p-3 flex flex-col gap-1.5">');
  });
});
