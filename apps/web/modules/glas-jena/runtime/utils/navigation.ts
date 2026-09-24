/**
 * How long a submenu stays open after the pointer left it, and how long another item
 * has to be hovered before it replaces an open submenu. Lets users move diagonally
 * into a flyout without it switching to the item they brush on the way.
 */
export const NAVIGATION_HOVER_DELAY_MS = 200;

/** Views of the mobile menu: the category levels, the account entries and the language list. */
export const VIEW_CATEGORIES = 'categories';
export const VIEW_ACCOUNT = 'account';
export const VIEW_LANGUAGE = 'language';

/** Deliberately bilingual like in the LTS shop, so it is found whatever language is active. */
export const LANGUAGE_MENU_LABEL = 'Language / Sprache';

/**
 * Focuses the first entry of the dropdown/flyout that belongs to a menu item (`<li>` with its
 * link followed by the submenu `<ul>`). Walks the direct children on purpose: a selector search
 * would also match the item's own link, which sits in a menu list itself.
 */
export const focusFirstLinkOfFlyout = (item: Element | null | undefined) => {
  const submenu = Array.from(item?.children ?? []).find((child) => child.tagName === 'UL');
  (submenu?.firstElementChild?.firstElementChild as HTMLElement | null | undefined)?.focus();
};

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
