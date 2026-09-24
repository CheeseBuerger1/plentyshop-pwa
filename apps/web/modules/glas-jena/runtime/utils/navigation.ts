/**
 * How long a submenu stays open after the pointer left it, and how long another item
 * has to be hovered before it replaces an open submenu. Lets users move diagonally
 * into a flyout without it switching to the item they brush on the way.
 */
export const NAVIGATION_HOVER_DELAY_MS = 200;

const withoutTrailingSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/**
 * Whether a category link belongs to the current page: the category itself or anything below it
 * (subcategories and products), so the whole path is highlighted like in the LTS shop.
 * Query strings and hashes are ignored.
 */
export const isCategoryPathActive = (currentPath: string, categoryPath: string) => {
  const current = withoutTrailingSlash(currentPath.split(/[?#]/)[0] ?? '');
  const category = withoutTrailingSlash(categoryPath.split(/[?#]/)[0] ?? '');

  if (!category || category === '/') {
    return false;
  }
  return current === category || current.startsWith(`${category}/`);
};
