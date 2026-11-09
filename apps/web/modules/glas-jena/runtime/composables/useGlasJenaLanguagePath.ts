import type { Locale } from '#i18n';
import { productSeoSettingsGetters } from '@plentymarkets/shop-api';
import { getCategoryLanguagePath, getProductLanguagePath } from '../utils/locale';

/** `meta.type` of the category page (pages/[...slug].vue and the module's copy GlasJenaCategoryPage.vue) */
const CATEGORY_PAGE_TYPE = 'category';
/** `meta.type` of the item page (pages/product/[slug].vue) */
const PRODUCT_PAGE_TYPE = 'product';

/**
 * Address of the current page in another language, for the language links of the header and the phone menu.
 *
 * Category and item pages take it from the same source as their hreflang links, so the link is right in the server's
 * HTML too: categories from `languageUrls` (loaded by the blocks plugin before the page renders), items from their
 * hreflang alternates (`seoSettings.canonical`). `switchLocalePath` only puts the other language prefix before the
 * current path, which led to a 404 for categories, e.g. `/en/kueche-helfer/schuesseln/` instead of
 * `/en/kitchen-helpers/bowls/` (2026-10-27), and for items to a redirect and a second address of the same item, e.g.
 * `/en/kueche-helfer/vorratsdosen/…_1314` (Search Console, 2026-11-09). Other pages keep `switchLocalePath`, but
 * with the shop's trailing slash (without it every link was redirected, e.g. `/en` to `/en/`).
 */
export const useGlasJenaLanguagePath = () => {
  const route = useRoute();
  const switchLocalePath = useSwitchLocalePath();
  /* With a target language, like the hreflang links in useUrlPageMeta (useLocalizedPath only knows the current one) */
  // eslint-disable-next-line custom-rules/no-use-locale-path
  const localePath = useLocalePath();
  const { resolvePathTrailingSlash } = useUrlTrailingSlash();
  const { data: productsCatalog, currentProduct } = useProducts();

  const getProductPath = (locale: Locale) => {
    const canonical = currentProduct.value?.seoSettings
      ? productSeoSettingsGetters.getCanonical(currentProduct.value)
      : undefined;
    return getProductLanguagePath(
      canonical ? productSeoSettingsGetters.getCanonicalAlternate(canonical) : undefined,
      locale,
    );
  };

  return (locale: Locale) => {
    const query = new URLSearchParams(route.query as Record<string, string>).toString();
    const querySuffix = query ? `?${query}` : '';

    if (route.meta.type === PRODUCT_PAGE_TYPE) {
      const productPath = getProductPath(locale);
      if (productPath) {
        return resolvePathTrailingSlash(`${productPath}${querySuffix}`);
      }
    }

    const categoryPath =
      route.meta.type === CATEGORY_PAGE_TYPE
        ? getCategoryLanguagePath(productsCatalog.value.languageUrls, locale)
        : undefined;
    if (categoryPath) {
      return resolvePathTrailingSlash(`${localePath(categoryPath, locale)}${querySuffix}`);
    }

    return resolvePathTrailingSlash(switchLocalePath(locale));
  };
};
