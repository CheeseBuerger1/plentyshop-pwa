import type { Locale } from '#i18n';
import { getCategoryLanguagePath } from '../utils/locale';

/** `meta.type` of the category page (pages/[...slug].vue and the module's copy GlasJenaCategoryPage.vue) */
const CATEGORY_PAGE_TYPE = 'category';

/**
 * Address of the current page in another language, for the language links of the header and the phone menu.
 *
 * Category pages take it from the category (`languageUrls`, the same source as their hreflang links), loaded by the
 * blocks plugin before the page renders, so the link is right in the server's HTML too. Their paths are translated:
 * `switchLocalePath` only puts the other language prefix before the German path, which led to a 404, e.g.
 * `/en/kueche-helfer/schuesseln/` instead of `/en/kitchen-helpers/bowls/` (2026-10-27). Other pages keep
 * `switchLocalePath`.
 */
export const useGlasJenaLanguagePath = () => {
  const route = useRoute();
  const switchLocalePath = useSwitchLocalePath();
  /* With a target language, like the hreflang links in useUrlPageMeta (useLocalizedPath only knows the current one) */
  // eslint-disable-next-line custom-rules/no-use-locale-path
  const localePath = useLocalePath();
  const { resolvePathTrailingSlash } = useUrlTrailingSlash();
  const { data: productsCatalog } = useProducts();

  return (locale: Locale) => {
    const categoryPath =
      route.meta.type === CATEGORY_PAGE_TYPE
        ? getCategoryLanguagePath(productsCatalog.value.languageUrls, locale)
        : undefined;
    if (!categoryPath) {
      return switchLocalePath(locale);
    }
    const query = new URLSearchParams(route.query as Record<string, string>).toString();
    return resolvePathTrailingSlash(`${localePath(categoryPath, locale)}${query ? `?${query}` : ''}`);
  };
};
