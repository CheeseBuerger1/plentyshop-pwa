import type { LocationQueryRaw } from 'vue-router';
import { findLtsRedirect, getLtsRedirectPath } from '../utils/ltsRedirect';

/** Permanent redirect: search engines replace the old LTS address with the new one. */
const PERMANENT_REDIRECT = 301;

/**
 * Redirects old addresses of the LTS shop to their PWA pages (see `findLtsRedirect`), in the language of the old
 * address. Registered globally by the module. All other pages leave at once, before any i18n lookup: unit tests of the
 * original that replace `useNuxtApp` and switch pages (useUrlPageMeta.spec.ts) would otherwise fail, see
 * accountRedirect.ts.
 */
export default defineNuxtRouteMiddleware((to) => {
  const redirect = findLtsRedirect(to.path, to.query);

  if (!redirect) {
    return;
  }

  if (redirect.locale && !useNuxtApp().$i18n.localeCodes.value.some((code) => code === redirect.locale)) {
    return;
  }

  const { resolvePathTrailingSlash } = useUrlTrailingSlash();

  return navigateTo(
    {
      path: resolvePathTrailingSlash(getLtsRedirectPath(redirect)),
      query: redirect.query as LocationQueryRaw,
      hash: to.hash,
    },
    { redirectCode: PERMANENT_REDIRECT },
  );
});
