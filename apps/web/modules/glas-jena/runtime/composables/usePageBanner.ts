import { categoryGetters } from '@plentymarkets/shop-api';
import {
  CATEGORY_ROUTE,
  DEFAULT_ERROR_STATUS_CODE,
  ERROR_TITLE_KEY,
  ITEM_CATEGORY_TYPE,
  OWN_PAGE_BANNER_TITLE_KEYS,
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
 * status code (e.g. "Fehler 404"), otherwise the page's fixed name – the module's own text where the shop has no
 * fitting one (`OWN_PAGE_BANNER_TITLE_KEYS`). Empty on pages without a banner (home page, product pages).
 *
 * Derived from the route instead of the page's `setPageMeta`, so pages that do not set it never show the title of
 * the previous page.
 *
 * `routeBaseName`: the page's route without locale (e.g. `shipping`), set on the banner as `data-gj-route`, so
 * glas-jena.css can style single pages (the banner is a sibling right before main).
 *
 * `isItemCategoryPage`: the page is a product category (its breadcrumbs stay visible on narrow screens, see
 * glas-jena.css). Content pages share the category route, but their breadcrumbs only hold "Startseite".
 *
 * Translates with the shop's global `t()`: the banner component already calls `useI18n` for its local messages,
 * and a second call in the same component makes vue-i18n warn.
 *
 * @param translateOwn Translates the module's own banner texts (error pages, `OWN_PAGE_BANNER_TITLE_KEYS`), which
 * live with the banner component.
 */
export const usePageBanner = (translateOwn: (key: string, params?: Record<string, unknown>) => string) => {
  const route = useRoute();
  const getRouteBaseName = useRouteBaseName();
  const { data: productsCatalog } = useProducts();
  const error = useError();

  /* Named routes only have string names here; `String()` also covers the symbol type of route names */
  const routeBaseName = computed(() => String(getRouteBaseName(route) ?? ''));
  const isCategoryPage = computed(() => !error.value && routeBaseName.value === CATEGORY_ROUTE);
  const isItemCategoryPage = computed(
    () => isCategoryPage.value && productsCatalog.value?.category?.type === ITEM_CATEGORY_TYPE,
  );

  const title = computed(() => {
    if (error.value) {
      return translateOwn(ERROR_TITLE_KEY, { statusCode: error.value.statusCode ?? DEFAULT_ERROR_STATUS_CODE });
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

    const ownTitleKey = OWN_PAGE_BANNER_TITLE_KEYS[routeBaseName.value];
    if (ownTitleKey) {
      return translateOwn(ownTitleKey);
    }

    const titleKey = getFixedPageBannerTitleKey(routeBaseName.value);
    return titleKey ? t(titleKey) : '';
  });

  return { title, isItemCategoryPage, routeBaseName };
};
