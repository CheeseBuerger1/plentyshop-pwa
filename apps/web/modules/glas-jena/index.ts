import { addPlugin, addRouteMiddleware, addTemplate, createResolver, defineNuxtModule } from 'nuxt/kit';
import type { NuxtPage } from 'nuxt/schema';
import { getGtmHeadScript, getGtmNoscript } from './runtime/utils/googleTagManager';
import { DESKTOP_NAVIGATION_BREAKPOINT, DESKTOP_NAVIGATION_MIN_WIDTH } from './runtime/utils/navigation';
import { ACCOUNT_MENU_BREAKPOINT, ACCOUNT_MENU_MIN_WIDTH } from './runtime/utils/accountMenu';

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
  /* No "buy again" (as requested by the shop owner): on the order confirmation a link back to "My orders" instead */
  OrderAgainButton: './runtime/components/GlasJenaOrderBackLink.vue',
  /* Order confirmation = order details: thank-you text only for recent orders, no bank details when cancelled */
  ConfirmationPageContent: './runtime/components/GlasJenaConfirmationPageContent.vue',
  /* Order details: the shipping date ("Lieferdatum") next to the shipping method and the tracking number */
  OrderShippingSummary: './runtime/components/GlasJenaOrderShippingSummary.vue',
  /* Order details: "inkl. MwSt." in front of the label instead of in front of the amount */
  OrderTotals: './runtime/components/GlasJenaOrderTotals.vue',
};

/**
 * Original layouts (name) replaced by the module's own ones. Account: on phones the menu has its own page and every
 * account page shows "← Zurück" to it (see the layout).
 */
export const LAYOUT_OVERRIDES: Record<string, string> = {
  account: './runtime/layouts/GlasJenaAccountLayout.vue',
};

/** Own nuxt-viewport breakpoints of the module: desktop navigation (992 px) and account menu (825 px). */
const EXTRA_VIEWPORT_BREAKPOINTS = {
  [DESKTOP_NAVIGATION_BREAKPOINT]: DESKTOP_NAVIGATION_MIN_WIDTH,
  [ACCOUNT_MENU_BREAKPOINT]: ACCOUNT_MENU_MIN_WIDTH,
};

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
        if (override) {
          component.filePath = resolve(override);
        }
      }
    });

    nuxt.hook('pages:extend', (pages) => extendPages(pages, resolve));

    nuxt.hook('app:resolve', (app) => {
      for (const [name, override] of Object.entries(LAYOUT_OVERRIDES)) {
        const layout = app.layouts[name];
        if (layout) {
          layout.file = resolve(override);
        }
      }
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

    /* Order dates without the time of day, see utils/orderDate.ts */
    addPlugin(resolve('./runtime/plugins/orderDate'));

    /* Order status without the PlentyONE number ("[8] Storniert"), see utils/orderStatus.ts */
    addPlugin(resolve('./runtime/plugins/orderStatus'));

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
