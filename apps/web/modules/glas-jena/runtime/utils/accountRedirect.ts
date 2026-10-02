import { ACCOUNT_ROUTE_PREFIX } from './pageBanner';

/**
 * Where a request for a customer account page has to be redirected to, or `undefined` if it can stay.
 *
 * Account pages without the URL form of the PlentyONE setting "trailing slash" (e.g. `/my-account/my-orders` while
 * all shop links end with `/`): the account layout compares the exact path to mark the current page and to find
 * the heading on phones. `resolveTrailingSlash` applies the shop's setting, like the shop's own links. `/my-account`
 * itself (the account URL of the LTS shop) is the page of the account menu on phones, see GlasJenaAccountLayout.vue.
 *
 * @param routeBaseName Route name without the locale suffix, e.g. `my-account-my-orders`.
 * @param path Path of the request, e.g. `/en/my-account/my-orders`.
 * @param resolveTrailingSlash Applies the shop's trailing slash setting to a path.
 */
export const getAccountRedirectPath = (
  routeBaseName: string,
  path: string,
  resolveTrailingSlash: (path: string) => string,
) => {
  if (routeBaseName !== ACCOUNT_ROUTE_PREFIX && !routeBaseName.startsWith(`${ACCOUNT_ROUTE_PREFIX}-`)) {
    return undefined;
  }

  const resolvedPath = resolveTrailingSlash(path);
  return resolvedPath === path ? undefined : resolvedPath;
};
