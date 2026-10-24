/**
 * Pages of the shop (route base names) that search engines should not index (wish of the shop owner, 2026-10-24):
 * the cart, the guest login, "forgot password", the newsletter unsubscription and the page after PayPal Express. The
 * original gives them `robots: all` – login and registration set `noindex, nofollow` themselves, the search follows
 * the robots setting "search results" in PlentyONE. A disallow in robots.txt would not do: search engines would never
 * see the noindex of a blocked page.
 */
export const NOINDEX_PAGE_NAMES = [
  'cart',
  'guest-login',
  'reset-password',
  'newsletter-unsubscribe',
  'readonly-checkout',
];

/** The robots value of these pages, like login and registration in the original. */
export const NOINDEX_ROBOTS = 'noindex, nofollow';

/**
 * Pages (paths as in `pages/`) that the shop's content sitemap would list although they are not indexed; the others of
 * NOINDEX_PAGE_NAMES are excluded by the original already (`plentySitemap.exclude` in nuxt.config.ts).
 */
export const SITEMAP_EXCLUDED_PAGE_PATHS = ['/guest/login', '/newsletter/unsubscribe'];

/** Separator between the base name and the language of a route name, e.g. `cart___de` (@nuxtjs/i18n). */
const ROUTE_LOCALE_SEPARATOR = '___';

/** The robots value of a page by its route name (e.g. `guest-login___en`), or `undefined` for the shop's default. */
export const getPageRobots = (routeName: unknown) => {
  const baseName = String(routeName ?? '').split(ROUTE_LOCALE_SEPARATOR)[0] ?? '';
  return NOINDEX_PAGE_NAMES.includes(baseName) ? NOINDEX_ROBOTS : undefined;
};
