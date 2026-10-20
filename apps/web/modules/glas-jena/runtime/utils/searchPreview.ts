import type { CategoryTreeItem } from '@plentymarkets/shop-api';
import { normalizePath } from './navigation';

/** Between the levels of a category path, e.g. "Teekannen › alle Filter" */
export const CATEGORY_PATH_SEPARATOR = ' › ';

/**
 * The categories from the main category down to the one the link leads to; empty if no category has that link.
 *
 * @param buildLink Link of a category as the shop builds it (`buildCategoryMenuLink`, localized)
 */
export const findCategoryPathByLink = (
  tree: CategoryTreeItem[] | undefined,
  link: string,
  buildLink: (category: CategoryTreeItem) => string,
): CategoryTreeItem[] => {
  const target = normalizePath(link);
  for (const category of tree ?? []) {
    if (normalizePath(buildLink(category)) === target) {
      return [category];
    }
    const below = findCategoryPathByLink(category.children, link, buildLink);
    if (below.length > 0) {
      return [category, ...below];
    }
  }
  return [];
};

/**
 * Name of a category in the search preview: from the third level on with the categories above it (without the main
 * category), e.g. "Teekannen › alle Filter" instead of "alle Filter" – names like "alle Größen" say little on their
 * own and occur several times. Same rule as the line above the banner title (`getCategoryKicker`).
 *
 * @param label Name the search delivers, kept for categories the tree does not know
 */
export const getCategoryPathLabel = (path: CategoryTreeItem[], label: string) => {
  const names = path.map((category) => category.details?.[0]?.name ?? '').filter(Boolean);
  return names.length > 2 ? names.slice(1).join(CATEGORY_PATH_SEPARATOR) : label;
};

/**
 * Words a search term does not begin or end with. PlentyONE builds the suggested terms from word sequences of the
 * article names, so "Glaskörper für Teekanne" also yields "für teekanne" and "glaskörper für".
 */
const FILLER_WORDS = new Set([
  'für',
  'und',
  'oder',
  'mit',
  'ohne',
  'aus',
  'passend',
  'in',
  'im',
  'zu',
  'zum',
  'zur',
  'von',
  'vom',
  'bis',
  'der',
  'die',
  'das',
  'the',
  'for',
  'and',
  'with',
  'without',
  'of',
]);

/** A fragment: begins or ends with a filler word, or begins with a number ("8 tassen"). */
const isFragment = (label: string) => {
  const words = label.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const first = words[0] ?? '';
  const last = words[words.length - 1] ?? '';
  return words.length === 0 || FILLER_WORDS.has(first) || FILLER_WORDS.has(last) || /^\d/.test(first);
};

/**
 * The suggested search terms without fragments, in the order of the search (most frequent first). A filler word in
 * the middle stays: "glaskörper für teekanne" is a sensible term.
 */
export const filterSearchSuggestions = <Suggestion extends { label: string }>(suggestions: Suggestion[]) =>
  suggestions.filter((suggestion) => !isFragment(suggestion.label));
