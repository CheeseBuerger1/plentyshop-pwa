import { ACCOUNT_ROUTE_PREFIX } from './pageBanner';

/**
 * Where a request for a customer account page has to be redirected to, or `undefined` if it can stay.
 *
 * - `/my-account` itself: the start page of "Mein Konto" in the PWA is `paths.account` (personal data). The LTS
 *   shop's account URL is `/my-account/`, so old bookmarks and e-mails lead there; the original account layout
 *   shows an empty page with only a back button on phones for it.
 * - Account subpages without the URL form of the PlentyONE setting "trailing slash" (e.g. `/my-account/my-orders`
 *   while all shop links end with `/`): the original account layout compares the exact path and shows an empty
 *   heading on phones. `resolveTrailingSlash` applies the shop's setting, like the shop's own links.
 *
 * @param routeBaseName Route name without the locale suffix, e.g. `my-account-my-orders`.
 * @param path Path of the request, e.g. `/en/my-account/my-orders`.
 * @param accountStartPath Localised start page of the account, e.g. `/my-account/personal-data/`.
 * @param resolveTrailingSlash Applies the shop's trailing slash setting to a path.
 */
export const getAccountRedirectPath = (
  routeBaseName: string,
  path: string,
  accountStartPath: string,
  resolveTrailingSlash: (path: string) => string,
) => {
  if (routeBaseName === ACCOUNT_ROUTE_PREFIX) {
    return accountStartPath;
  }

  if (routeBaseName.startsWith(`${ACCOUNT_ROUTE_PREFIX}-`)) {
    const resolvedPath = resolveTrailingSlash(path);
    return resolvedPath === path ? undefined : resolvedPath;
  }

  return undefined;
};
