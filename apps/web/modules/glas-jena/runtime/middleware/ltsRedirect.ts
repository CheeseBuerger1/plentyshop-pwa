import type { LocationQueryRaw } from 'vue-router';
import { findLtsRedirect, splitLocalePrefix } from '../utils/ltsRedirect';

/** Permanent redirect: search engines replace the old LTS address with the new one. */
const PERMANENT_REDIRECT = 301;

/**
 * Redirects old addresses of the LTS shop to their PWA pages (see `LTS_REDIRECTS`), in the language of the old
 * address. Registered globally by the module.
 */
export default defineNuxtRouteMiddleware((to) => {
  const { $i18n } = useNuxtApp();
  const { locale, path } = splitLocalePrefix(to.path, $i18n.localeCodes.value);
  const redirect = findLtsRedirect(path, to.query);

  if (!redirect) {
    return;
  }

  const localePath = useLocalePath();
  const { resolvePathTrailingSlash } = useUrlTrailingSlash();
  const targetPath = resolvePathTrailingSlash(localePath(paths[redirect.pathKey], locale ?? $i18n.defaultLocale));

  return navigateTo(
    { path: targetPath, query: redirect.query as LocationQueryRaw, hash: to.hash },
    { redirectCode: PERMANENT_REDIRECT },
  );
});
