import { getAccountRedirectPath } from '../utils/accountRedirect';
import { ACCOUNT_ROUTE_PREFIX } from '../utils/pageBanner';

/** Permanent redirect: search engines and browsers keep the target, like for other moved pages. */
const PERMANENT_REDIRECT = 301;

/**
 * Adds the missing trailing slash to account pages (see `getAccountRedirectPath`). Registered globally by the module, so it runs before the pages' auth guard.
 * All other pages leave at once: their route names (base name plus locale suffix, e.g. `slug___de`) do not start like
 * an account route, so they need no i18n lookup. Unit tests of the original that replace `useNuxtApp` and switch
 * pages (useUrlPageMeta.spec.ts) would otherwise fail in `useRouteBaseName` ("i18n context is not initialized").
 */
export default defineNuxtRouteMiddleware((to) => {
  if (!String(to.name ?? '').startsWith(ACCOUNT_ROUTE_PREFIX)) {
    return;
  }

  const getRouteBaseName = useRouteBaseName();
  const { resolvePathTrailingSlash } = useUrlTrailingSlash();

  const redirectPath = getAccountRedirectPath(String(getRouteBaseName(to) ?? ''), to.path, resolvePathTrailingSlash);

  if (!redirectPath) {
    return;
  }

  return navigateTo({ path: redirectPath, query: to.query, hash: to.hash }, { redirectCode: PERMANENT_REDIRECT });
});
