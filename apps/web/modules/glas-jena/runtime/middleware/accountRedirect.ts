import { getAccountRedirectPath } from '../utils/accountRedirect';

/** Permanent redirect: search engines and browsers keep the target, like for other moved pages. */
const PERMANENT_REDIRECT = 301;

/**
 * Sends `/my-account` to the start page of "Mein Konto" and adds the missing trailing slash to account subpages
 * (see `getAccountRedirectPath`). Registered globally by the module, so it runs before the pages' auth guard.
 */
export default defineNuxtRouteMiddleware((to) => {
  const getRouteBaseName = useRouteBaseName();
  const localePath = useLocalizedPath();
  const { resolvePathTrailingSlash } = useUrlTrailingSlash();

  const redirectPath = getAccountRedirectPath(
    String(getRouteBaseName(to) ?? ''),
    to.path,
    localePath(paths.account),
    resolvePathTrailingSlash,
  );

  if (!redirectPath) {
    return;
  }

  return navigateTo({ path: redirectPath, query: to.query, hash: to.hash }, { redirectCode: PERMANENT_REDIRECT });
});
