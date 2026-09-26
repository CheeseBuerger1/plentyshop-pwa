import { categoryGetters } from '@plentymarkets/shop-api';
import {
  CATEGORY_ROUTE,
  DEFAULT_ERROR_STATUS_CODE,
  SEARCH_RESULTS_TITLE_KEY,
  SEARCH_ROUTE,
  TAG_ROUTE,
  getFixedPageBannerTitleKey,
  getTagName,
} from '../utils/pageBanner';

/**
 * Page banner below the header, like the LTS shop.
 *
 * `title`: the category name on category pages, the search phrase on search and tag pages, on error pages the
 * status code (e.g. "Fehler 404"), otherwise the page's fixed name. Empty on pages without a banner (home page,
 * product pages).
 *
 * Derived from the route instead of the page's `setPageMeta`, so pages that do not set it never show the title of
 * the previous page.
 *
 * `isCategoryPage`: the page is a category page (its breadcrumbs stay visible on narrow screens, see glas-jena.css).
 *
 * Translates with the shop's global `t()`: the banner component already calls `useI18n` for its local messages,
 * and a second call in the same component makes vue-i18n warn.
 *
 * @param getErrorTitle Title of an error page for its HTTP status code; the text lives with the banner component.
 */
export const usePageBanner = (getErrorTitle: (statusCode: number) => string) => {
  const route = useRoute();
  const getRouteBaseName = useRouteBaseName();
  const { data: productsCatalog } = useProducts();
  const error = useError();

  /* Named routes only have string names here; `String()` also covers the symbol type of route names */
  const routeBaseName = computed(() => String(getRouteBaseName(route) ?? ''));
  const isCategoryPage = computed(() => !error.value && routeBaseName.value === CATEGORY_ROUTE);

  const title = computed(() => {
    if (error.value) {
      return getErrorTitle(error.value.statusCode ?? DEFAULT_ERROR_STATUS_CODE);
    }

    if (isCategoryPage.value) {
      const category = productsCatalog.value?.category;
      return category ? categoryGetters.getCategoryName(category) : '';
    }

    if (routeBaseName.value === SEARCH_ROUTE) {
      return t(SEARCH_RESULTS_TITLE_KEY, { phrase: route.query.term?.toString() ?? '' });
    }
    if (routeBaseName.value === TAG_ROUTE) {
      return t(SEARCH_RESULTS_TITLE_KEY, { phrase: getTagName(route.params.slug?.toString() ?? '') });
    }

    const titleKey = getFixedPageBannerTitleKey(routeBaseName.value);
    return titleKey ? t(titleKey) : '';
  });

  return { title, isCategoryPage };
};
