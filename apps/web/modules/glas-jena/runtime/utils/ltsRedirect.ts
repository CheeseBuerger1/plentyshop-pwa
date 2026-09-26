import type { LtsRedirect } from './types';

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

/** Path without trailing slash, e.g. `/en/sbc5/gtc/` → `/en/sbc5/gtc`; the home page stays `/`. */
const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, '') || '/';

/**
 * Redirect for an address without language prefix: LTS system pages from `LTS_REDIRECTS` with the query kept, and the
 * search, whose LTS parameter `query` becomes `term` (a search without any phrase goes to the home page, the PWA
 * search page fails without one).
 */
const findPageRedirect = (path: string, query: Record<string, unknown>) => {
  const pathKey = LTS_REDIRECTS[path];
  if (pathKey) {
    return { path: paths[pathKey], query };
  }

  if (path === paths.search && !query[SEARCH_PARAM]) {
    const { [LTS_SEARCH_PARAM]: phrase, ...otherQuery } = query;
    if (phrase) {
      return { path: paths.search, query: { ...otherQuery, [SEARCH_PARAM]: phrase } };
    }
    return { path: paths.home, query: otherQuery };
  }

  return undefined;
};

/**
 * Target of an old LTS address, or `undefined` if the address needs no redirect. Needs no i18n, so the middleware can
 * leave every other page at once; the language prefix it returns still has to be checked against the shop's languages.
 *
 * - LTS system pages and the search (see `findPageRedirect`), with or without language prefix (`/en/sbc5/gtc`).
 * - A doubled language prefix (`/en/en/…` → `/en/…`): the LTS created such links, search engines may know them.
 *
 * @param path Path of the request, e.g. `/en/sbc5/gtc/`.
 * @param query Query of the request.
 * @example findLtsRedirect('/en/basket/', {}) // { locale: 'en', path: '/cart', query: {} }
 */
export const findLtsRedirect = (path: string, query: Record<string, unknown>): LtsRedirect | undefined => {
  const cleanPath = withoutTrailingSlash(path);
  const [, prefix = '', second] = cleanPath.split('/');
  const rest = cleanPath.slice(prefix.length + 1) || '/';

  if (prefix && prefix === second) {
    /* One redirect for both, e.g. `/en/en/sbc5/gtc` → `/en/gtc` */
    return (
      findLtsRedirect(rest, query) ?? {
        locale: prefix,
        path: withoutTrailingSlash(rest.slice(prefix.length + 1)),
        query,
      }
    );
  }

  const unprefixed = findPageRedirect(cleanPath, query);
  if (unprefixed) {
    return unprefixed;
  }

  const prefixed = prefix ? findPageRedirect(rest, query) : undefined;
  return prefixed ? { locale: prefix, ...prefixed } : undefined;
};

/**
 * Path of the redirect target in the language of the old address, e.g. `en` + `/cart` → `/en/cart`. The shop uses
 * the same paths in every language (strategy `prefix_and_default`), so the prefix is all that changes.
 */
export const getLtsRedirectPath = ({ locale, path }: Pick<LtsRedirect, 'locale' | 'path'>) => {
  if (!locale) {
    return path;
  }
  return path === paths.home ? `/${locale}` : `/${locale}${path}`;
};
