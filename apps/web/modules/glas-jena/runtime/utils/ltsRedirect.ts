/**
 * Old addresses of the LTS shop (www.glas-jena.de) without language prefix and trailing slash, and the key of the
 * PWA page in `paths` they are redirected to. Categories and items keep their addresses in the PWA; these are the
 * LTS system pages. The `/sbc5/…` pages are the LTS shop's content categories: they still exist in PlentyONE and
 * would otherwise be shown as empty pages.
 *
 * Not listed on purpose: `/sbc5/our-glass` and `/sbc5/bank-details` are real content pages – their content is
 * created in the shop editor under the same address. `/wish-list` stays a 404 (the shop has no wishlist).
 */
export const LTS_REDIRECTS: Record<string, keyof typeof paths> = {
  '/basket': 'cart',
  '/sbc5/basket': 'cart',
  '/sbc5/checkout': 'checkout',
  '/gtc': 'termsAndConditions',
  '/sbc5/gtc': 'termsAndConditions',
  '/sbc5/contact': 'contact',
  '/sbc5/legal-disclosure': 'legalDisclosure',
  '/sbc5/privacy-policy': 'privacyPolicy',
  '/sbc5/cancellation-rights': 'cancellationRights',
  '/sbc5/shipping': 'shipping',
  '/sbc5/register': 'register',
  '/sbc5/login': 'authLogin',
  '/sbc5/my-account': 'account',
  '/password-reset': 'authResetPassword',
  '/sbc5/password-reset': 'authResetPassword',
  /* The PWA has no page to change the e-mail address; it is changed in the account */
  '/change-mail': 'account',
  '/sbc5/change-mail': 'account',
  '/sbc5/page-not-found': 'home',
};

/** The LTS search took the phrase as `query`, the PWA takes it as `term`. */
export const LTS_SEARCH_PARAM = 'query';
export const SEARCH_PARAM = 'term';

/**
 * Splits a path into its language prefix (one of the shop's locale codes, e.g. `en`) and the rest without trailing
 * slash, e.g. `/en/sbc5/gtc/` → `{ locale: 'en', path: '/sbc5/gtc' }`.
 */
export const splitLocalePrefix = (path: string, localeCodes: string[]) => {
  const [, firstSegment = ''] = path.split('/');
  const locale = localeCodes.includes(firstSegment) ? firstSegment : undefined;
  const rest = locale ? path.slice(firstSegment.length + 1) : path;
  const withoutTrailingSlash = rest.length > 1 ? rest.replace(/\/+$/, '') : rest;
  return { locale, path: withoutTrailingSlash || '/' };
};

/**
 * PWA page (key in `paths`) and query for an old LTS address, or `undefined` if the address needs no redirect.
 *
 * - LTS system pages from `LTS_REDIRECTS`, query and language kept.
 * - The search: the LTS parameter `query` becomes `term`; a search without any phrase goes to the home page (the
 *   PWA search page fails without one).
 *
 * @param path Path without language prefix and trailing slash (see `splitLocalePrefix`).
 * @param query Query of the request.
 */
export const findLtsRedirect = (path: string, query: Record<string, unknown>) => {
  const pathKey = LTS_REDIRECTS[path];
  if (pathKey) {
    return { pathKey, query };
  }

  if (path === paths.search && !query[SEARCH_PARAM]) {
    const { [LTS_SEARCH_PARAM]: phrase, ...otherQuery } = query;
    if (phrase) {
      return { pathKey: 'search' as const, query: { ...otherQuery, [SEARCH_PARAM]: phrase } };
    }
    return { pathKey: 'home' as const, query: otherQuery };
  }

  return undefined;
};
