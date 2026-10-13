import type { CategoryTreeItem } from '@plentymarkets/shop-api';

/** Between the levels of a category path, e.g. "Teekannen › alle Filter" */
export const CATEGORY_PATH_SEPARATOR = ' › ';

/** Path without query, hash and trailing slash, so links written in different ways compare equal. */
const normalizeLink = (link: string) => {
  const path = link.split(/[?#]/)[0] ?? '';
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
};

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
  const target = normalizeLink(link);
  for (const category of tree ?? []) {
    if (normalizeLink(buildLink(category)) === target) {
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
