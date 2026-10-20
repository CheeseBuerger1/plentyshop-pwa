import {
  addPlugin,
  addRouteMiddleware,
  addServerHandler,
  addTemplate,
  createResolver,
  defineNuxtModule,
} from 'nuxt/kit';
import type { NuxtPage } from 'nuxt/schema';
import { getGtmHeadScript, getGtmNoscript } from './runtime/utils/googleTagManager';
import { DESKTOP_NAVIGATION_BREAKPOINT, DESKTOP_NAVIGATION_MIN_WIDTH } from './runtime/utils/navigation';
import { ACCOUNT_MENU_BREAKPOINT, ACCOUNT_MENU_MIN_WIDTH } from './runtime/utils/accountMenu';
import { SHIPPING_COUNTRY_ROUTE } from './runtime/utils/cartShipping';

/** Original components (Nuxt name) replaced by the module's own ones. */
export const COMPONENT_OVERRIDES: Record<string, string> = {
  UiFooterBlocks: './runtime/components/GlasJenaFooterBlocks.vue',
  UiHeaderBlocks: './runtime/components/GlasJenaHeaderBlocks.vue',
  /* Checkout: the GLAS IN JENA header with the page banner, like the LTS shop */
  UiSimplifiedHeader: './runtime/components/GlasJenaSimplifiedHeader.vue',
  /* No bottom navbar on phones, like the LTS shop (the auth layout still renders it) */
  UiNavbarBottom: './runtime/components/GlasJenaNavbarBottom.vue',
  /* Cookie banner in the GLAS IN JENA style; consent logic unchanged (useCookieBar) */
  Cookiebar: './runtime/components/GlasJenaCookiebar.vue',
  /* No returns through the web shop: the "return items" button on the order confirmation renders nothing */
  OrderReturnItems: './runtime/components/GlasJenaNoReturns.vue',
  /* No coupons in the shop: the coupon field of the checkout renders nothing (the cart page's copy has none) */
  Coupon: './runtime/components/GlasJenaNoCoupon.vue',
  /*
   * Checkout: "Ihre gesetzlichen Gewährleistungsrechte" and the terms note above the buy button, the terms without
   * checkbox (wish of the shop owner); the guarantee link below the button renders nothing
   */
  PaymentButtons: './runtime/components/GlasJenaPaymentButtons.vue',
  CheckoutGeneralTerms: './runtime/components/GlasJenaCheckoutGeneralTerms.vue',
  GuaranteeNotice: './runtime/components/GlasJenaNoGuaranteeNotice.vue',
  /*
   * Shipping methods of the checkout: with the logo of the parcel service, the price on one line, fetched again when
   * the articles change
   */
  ShippingMethod: './runtime/components/GlasJenaShippingMethod.vue',
  /* Consent to pass the e-mail on to the parcel service: short label like the LTS shop, full text behind a button */
  ShippingPrivacy: './runtime/components/GlasJenaShippingPrivacy.vue',
  /* DHL Packstation search of the checkout closed when it appears (the original opens it) */
  PreferredDeliveryPackstationFinder: './runtime/components/GlasJenaPackstationFinder.vue',
  /* No "buy again" (as requested by the shop owner): on the order confirmation a link back to "My orders" instead */
  OrderAgainButton: './runtime/components/GlasJenaOrderBackLink.vue',
  /* Order confirmation = order details: thank-you text only for recent orders, no bank details when cancelled */
  ConfirmationPageContent: './runtime/components/GlasJenaConfirmationPageContent.vue',
  /* Order details: the shipping date ("Lieferdatum") next to the shipping method and the tracking number */
  OrderShippingSummary: './runtime/components/GlasJenaOrderShippingSummary.vue',
  /* Order details: "inkl. MwSt." in front of the label instead of in front of the amount */
  OrderTotals: './runtime/components/GlasJenaOrderTotals.vue',
  /* Window after "Add to cart": new button "Einkauf fortsetzen", cart button "Zum Warenkorb" (wish of the shop owner) */
  QuickCheckout: './runtime/components/GlasJenaQuickCheckout.vue',
  /* Article categories: the LTS category list in the filter column instead of the "back to the parent" link */
  CategoryTree: './runtime/components/GlasJenaCategoryTree.vue',
  /* Item cards: disabled add-to-cart button for items that cannot be ordered ("Aktuell nicht lieferbar") */
  UiProductCard: './runtime/components/GlasJenaProductCard.vue',
  /* Product gallery: clear arrows on the big picture instead of the hardly visible ones on the thumbnail strip */
  Gallery: './runtime/components/GlasJenaGallery.vue',
  /* Breadcrumbs: unchanged on the page, for search engines with their real names and absolute addresses */
  UiBreadcrumbs: './runtime/components/GlasJenaBreadcrumbs.vue',
};

/**
 * Replaced components whose original unit test takes the component from Nuxt's registry (`#components`): in the
 * unit tests the original stays, so that upstream test keeps testing the original (the module's copy has its own).
 */
export const COMPONENT_OVERRIDES_NOT_IN_TESTS = ['CategoryTree', 'UiProductCard', 'Gallery', 'UiBreadcrumbs'];

/**
 * Original layouts (name) replaced by the module's own ones. Account: on phones the menu has its own page and every
 * account page shows "← Zurück" to it (see the layout).
 */
export const LAYOUT_OVERRIDES: Record<string, string> = {
  account: './runtime/layouts/GlasJenaAccountLayout.vue',
};

/**
 * Error component of the module: the original error.vue inside the class `font-body` and the shop's font, which app.vue
 * sets on <body> but which the error page (shown instead of app.vue) never had.
 */
export const ERROR_COMPONENT_OVERRIDE = './runtime/components/GlasJenaError.vue';

/** Own nuxt-viewport breakpoints of the module: desktop navigation (992 px) and account menu (825 px). */
const EXTRA_VIEWPORT_BREAKPOINTS = {
  [DESKTOP_NAVIGATION_BREAKPOINT]: DESKTOP_NAVIGATION_MIN_WIDTH,
  [ACCOUNT_MENU_BREAKPOINT]: ACCOUNT_MENU_MIN_WIDTH,
};

/**
 * Auto-imports of the shop that the module replaces by its own file of the same export name (`file`: the original,
 * with or without its extension):
 * - `defaults`: wraps the original, 100 instead of 50 articles per page, see utils/shopDefaults.ts
 * - `useSearchSuggestions`: copy of the original; suggested search terms without fragments, categories of the search
 *   preview with their path, see utils/searchPreview.ts
 * - `useStructuredData`: wraps the original; the Product JSON-LD takes the meta description, see utils/seo.ts
 */
export const IMPORT_OVERRIDES = [
  {
    name: 'defaults',
    file: /\/app\/composables\/defaults(\.ts)?$/,
    replacement: './runtime/utils/shopDefaults',
  },
  {
    name: 'useSearchSuggestions',
    file: /\/app\/composables\/useSearch\/useSearchSuggestions(\.ts)?$/,
    replacement: './runtime/composables/useGlasJenaSearchSuggestions',
  },
  {
    name: 'useStructuredData',
    file: /\/app\/composables\/useStructuredData\/useStructuredData(\.ts)?$/,
    replacement: './runtime/composables/useGlasJenaStructuredData',
  },
];

/** Alias under which nuxt-viewport provides its generated options to its runtime plugins. */
const VIEWPORT_OPTIONS_ALIAS = '#viewport-options';

/**
 * The shop has no wishlist and no returns through the web shop: these pages are removed, so old links end on the
 * 404 page (the links to them are hidden in glas-jena.css and the account menu of the header).
 */
export const REMOVED_PAGE_FILES = [
  '/pages/wishlist.vue',
  '/pages/my-account/wishlist.vue',
  '/pages/my-account/returns.vue',
  '/pages/my-account/new-return/[id]/[accessKey].vue',
];

/**
 * Original pages (file) replaced by the module's own ones; route name and URL stay the same.
 * Cancellation policy: followed by the cancellation form, like the LTS page "Widerrufsbelehrung & Widerrufsformular".
 * Contact: introduction, contact data and form side by side, like the LTS contact page.
 */
export const PAGE_OVERRIDES: Record<string, string> = {
  '/pages/cancellation-rights.vue': './runtime/pages/GlasJenaCancellationRights.vue',
  '/pages/contact.vue': './runtime/pages/GlasJenaContact.vue',
  /* My orders: one layout for all widths, without the "buy again" menu */
  '/pages/my-account/my-orders.vue': './runtime/pages/GlasJenaMyOrders.vue',
  /* Category page: a product category with subcategories shows these as tiles, one without shows its articles */
  '/pages/[...slug].vue': './runtime/pages/GlasJenaCategoryPage.vue',
  /* Search results built like an article category: category list beside them, breadcrumbs on narrow screens */
  '/pages/search.vue': './runtime/pages/GlasJenaSearch.vue',
  /* Cart like the LTS shop: introduction, country of delivery and shipping method below the articles, no "Zurück" */
  '/pages/cart.vue': './runtime/pages/GlasJenaCart.vue',
};

const getPageFile = (page: NuxtPage) => page.file?.replace(/\\/g, '/') ?? '';

const isRemovedPage = (page: NuxtPage) => {
  const file = getPageFile(page);
  return REMOVED_PAGE_FILES.some((removed) => file.endsWith(removed));
};

const getPageOverride = (page: NuxtPage) => {
  const file = getPageFile(page);
  const original = Object.keys(PAGE_OVERRIDES).find((path) => file.endsWith(path));
  return original ? PAGE_OVERRIDES[original] : undefined;
};

const extendPages = (pages: NuxtPage[], resolve: (path: string) => string) => {
  for (let index = pages.length - 1; index >= 0; index--) {
    const page = pages[index];
    if (!page) {
      continue;
    }
    if (isRemovedPage(page)) {
      pages.splice(index, 1);
      continue;
    }
    const override = getPageOverride(page);
    if (override) {
      page.file = resolve(override);
    }
    if (page.children) {
      extendPages(page.children, resolve);
    }
  }
};

/**
 * GLAS IN JENA theme module.
 *
 * Keeps all shop-specific design customisations out of the original plentyshop-pwa files,
 * so updates from plentymarkets/plentyshop-pwa can be merged without conflicts.
 * See docs/glas-jena/glas-jena-design.md for the design rules.
 */
export default defineNuxtModule({
  meta: {
    name: 'glas-jena',
  },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    nuxt.options.css.push(resolve('./runtime/glas-jena.css'));

    /*
     * Own nuxt-viewport breakpoints (desktop navigation, account menu), so the shop's `lg` (1024 px) and its config stay
     * untouched. nuxt-viewport has already read its options when this local module runs, so its generated options
     * are extended instead: our template re-exports them with the extra breakpoint and takes over the alias.
     */
    const viewportOptionsPath = nuxt.options.alias[VIEWPORT_OPTIONS_ALIAS];
    if (viewportOptionsPath) {
      nuxt.options.alias[VIEWPORT_OPTIONS_ALIAS] = addTemplate({
        filename: 'glas-jena/viewport-options.mjs',
        getContents: () =>
          [
            `import options from ${JSON.stringify(viewportOptionsPath)};`,
            `export default { ...options, breakpoints: { ...options.breakpoints, ...${JSON.stringify(EXTRA_VIEWPORT_BREAKPOINTS)} } };`,
          ].join('\n'),
      }).dst;
    } else {
      console.warn(
        '[glas-jena] nuxt-viewport options not found; the desktop navigation and account menu breakpoints are missing.',
      );
    }

    nuxt.hook('components:extend', (components) => {
      for (const component of components) {
        const override = COMPONENT_OVERRIDES[component.pascalName];
        const keepOriginal = nuxt.options.test && COMPONENT_OVERRIDES_NOT_IN_TESTS.includes(component.pascalName);
        if (override && !keepOriginal) {
          component.filePath = resolve(override);
        }
      }
    });

    nuxt.hook('pages:extend', (pages) => extendPages(pages, resolve));

    /*
     * Auto-imports that come from the module's own file instead (see IMPORT_OVERRIDES). Not in the unit tests, where
     * the upstream specs expect the originals.
     */
    nuxt.hook('imports:extend', (imports) => {
      if (nuxt.options.test) {
        return;
      }
      for (const entry of imports) {
        const override = IMPORT_OVERRIDES.find(
          ({ name, file }) => entry.name === name && file.test(entry.from.replace(/\\/g, '/')),
        );
        if (override) {
          entry.from = resolve(override.replacement);
        }
      }
    });

    nuxt.hook('app:resolve', (app) => {
      for (const [name, override] of Object.entries(LAYOUT_OVERRIDES)) {
        const layout = app.layouts[name];
        if (layout) {
          layout.file = resolve(override);
        }
      }
      /* Error page in the shop's formatting: wraps the original error.vue, see GlasJenaError.vue */
      app.errorComponent = resolve(ERROR_COMPONENT_OVERRIDE);
    });

    /* Account pages without the trailing slash of the shop's URL setting, see utils/accountRedirect.ts */
    addRouteMiddleware({
      name: 'glas-jena-account-redirect',
      path: resolve('./runtime/middleware/accountRedirect'),
      global: true,
    });

    /* Jump links in the legal texts (table of contents of the AGB), see utils/legalAnchors.ts */
    addPlugin({ src: resolve('./runtime/plugins/legalAnchors.client'), mode: 'client' });

    /* English title and description of the home page for search engines, see HOME_SEO_TEXTS in utils/home.ts */
    addPlugin(resolve('./runtime/plugins/homeSeo'), { append: true });

    /*
     * Item pages: og:type "product" with price and Open Graph tags from the item data; canonical, hreflang and og:url
     * without tracking parameters; the module's breadcrumbs for search engines, see utils/seo.ts. Appended like homeSeo.
     */
    addPlugin(resolve('./runtime/plugins/seo'), { append: true });

    /* Order dates without the time of day, see utils/orderDate.ts */
    addPlugin(resolve('./runtime/plugins/orderDate'));

    /* Order status without the PlentyONE number ("[8] Storniert"), see utils/orderStatus.ts */
    addPlugin(resolve('./runtime/plugins/orderStatus'));

    /*
     * A new shipping address in the checkout starts with the cart's country of delivery, see utils/checkoutCountry.ts.
     * Appended like homeSeo: it uses the shop's composables (cart, address form).
     */
    addPlugin(resolve('./runtime/plugins/checkoutCountry'), { append: true });

    /*
     * Countries of delivery alphabetical everywhere, like the cart's selection, see resortShippingCountries in
     * utils/cartShipping.ts. Appended like homeSeo: it uses the shop's composables (countries, i18n).
     */
    addPlugin(resolve('./runtime/plugins/shippingCountriesOrder'), { append: true });

    /*
     * Items "Aktuell nicht lieferbar" cannot be ordered on the product page, see utils/notOrderable.ts. Appended like
     * homeSeo: it uses the head and the route, which before the shop's plugins (i18n) broke the hydration.
     */
    addPlugin(resolve('./runtime/plugins/notOrderable'), { append: true });

    /* Country of delivery in the cart: changes the country of the visitor's session, see utils/cartShipping.ts */
    addServerHandler({
      route: SHIPPING_COUNTRY_ROUTE,
      method: 'post',
      handler: resolve('./runtime/server/shippingCountry.post'),
    });

    /* Breadcrumbs on one line: the whole path if it fits, otherwise the short form, see utils/breadcrumbsFit.ts */
    addPlugin({ src: resolve('./runtime/plugins/breadcrumbsFit.client'), mode: 'client' });

    /* Remembers the last control the visitor used, so the cart window can give the focus back, see utils/lastInteractiveElement.ts */
    addPlugin({ src: resolve('./runtime/plugins/lastInteractiveElement.client'), mode: 'client' });

    /*
     * Google Tag Manager with consent default "denied" and the `purchase` event for Google Ads, see
     * utils/googleTagManager.ts and utils/purchaseTracking.ts.
     */
    nuxt.options.app.head.script ??= [];
    nuxt.options.app.head.script.unshift({ key: 'glas-jena-gtm', innerHTML: getGtmHeadScript() });
    nuxt.options.app.head.noscript ??= [];
    nuxt.options.app.head.noscript.push({
      key: 'glas-jena-gtm',
      tagPosition: 'bodyOpen',
      innerHTML: getGtmNoscript(),
    });
    addPlugin({ src: resolve('./runtime/plugins/googleTagManager.server'), mode: 'server' });
    addPlugin({ src: resolve('./runtime/plugins/googleTagManager.client'), mode: 'client' });
    nuxt.hook('i18n:registerModule', (register) =>
      register({
        langDir: resolve('./runtime/lang'),
        locales: [
          { code: 'de', file: 'de.json' },
          { code: 'en', file: 'en.json' },
        ],
      }),
    );

    /*
     * The gtag module (pwa_module_gtag) would send its own `purchase` through the same data layer, i.e. a second
     * conversion in GTM. All Google tags come from the GTM container, so the module stays off: without an id its
     * plugins do nothing, even if it is switched on in the shop settings.
     */
    nuxt.hook('modules:done', () => {
      const gtag = nuxt.options.runtimeConfig.public.pwa_module_gtag as { id?: string; enabled?: boolean } | undefined;
      if (gtag?.id) {
        console.warn('[glas-jena] pwa_module_gtag is switched off: Google tags come from the GTM container.');
        gtag.id = '';
        gtag.enabled = false;
      }
    });
  },
});
