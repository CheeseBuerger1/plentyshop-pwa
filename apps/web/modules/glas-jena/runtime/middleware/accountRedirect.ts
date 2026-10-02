import { getAccountRedirectPath } from '../utils/accountRedirect';

/** Permanent redirect: search engines and browsers keep the target, like for other moved pages. */
const PERMANENT_REDIRECT = 301;

/**
 * Adds the missing trailing slash to account pages (see `getAccountRedirectPath`). Registered globally by the module, so it runs before the pages' auth guard.
 */
export default defineNuxtRouteMiddleware((to) => {
  const getRouteBaseName = useRouteBaseName();
  const { resolvePathTrailingSlash } = useUrlTrailingSlash();

  const redirectPath = getAccountRedirectPath(String(getRouteBaseName(to) ?? ''), to.path, resolvePathTrailingSlash);

  if (!redirectPath) {
    return;
  }

  return navigateTo({ path: redirectPath, query: to.query, hash: to.hash }, { redirectCode: PERMANENT_REDIRECT });
});
