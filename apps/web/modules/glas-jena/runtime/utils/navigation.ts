/**
 * How long a submenu stays open after the pointer left it, and how long another item
 * has to be hovered before it replaces an open submenu. Lets users move diagonally
 * into a flyout without it switching to the item they brush on the way.
 */
export const NAVIGATION_HOVER_DELAY_MS = 200;

/**
 * nuxt-viewport breakpoint of the desktop navigation, like the LTS shop: from a window width of 992 px the main
 * categories are shown in the header, below that the burger menu. Registered by the module (index.ts).
 */
export const DESKTOP_NAVIGATION_BREAKPOINT = 'gjDesktopNavigation';
export const DESKTOP_NAVIGATION_MIN_WIDTH = 992;

/** Views of the mobile menu: the category levels, the account entries and the language list. */
export const VIEW_CATEGORIES = 'categories';
export const VIEW_ACCOUNT = 'account';
export const VIEW_LANGUAGE = 'language';

/** Slide-in direction of a mobile menu level: deeper levels come from the right, going back from the left. */
export const SLIDE_FORWARD = 'forward';
export const SLIDE_BACK = 'back';
export const SLIDE_NONE = 'none';

/**
 * A plain left click without modifier keys. Only such clicks are handled in the app; modifier clicks
 * (new tab or window) and other buttons keep the browser's default for the link.
 */
export const isPlainLeftClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

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
