/**
 * Upstream contract: what the GLAS IN JENA module relies on in the original plentyshop-pwa files.
 *
 * The module changes the shop without touching original files, so an update from plentymarkets/plentyshop-pwa
 * ("Sync fork") never conflicts – but it can silently break a customisation, e.g. when a `data-testid`, a route or
 * a translation key is renamed. These tests fail in that case and name what has to be adapted in the module.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { orderGetters } from '@plentymarkets/shop-api';
import { COMPONENT_OVERRIDES, LAYOUT_OVERRIDES, PAGE_OVERRIDES, REMOVED_PAGE_FILES } from '../../index';
import {
  ACCOUNT_ROUTE_PREFIX,
  ACCOUNT_TITLE_KEY,
  CATEGORY_ROUTE,
  OWN_PAGE_BANNER_TITLE_KEYS,
  PAGE_BANNER_TITLE_KEYS,
  SEARCH_RESULTS_TITLE_KEY,
  SEARCH_ROUTE,
  TAG_ROUTE,
} from '../utils/pageBanner';
import { CONSENT_COOKIE, GTM_COOKIE_GROUP } from '../utils/googleTagManager';
import { CONFIRMATION_ORDER_STATE, CONFIRMATION_ROUTE } from '../utils/purchaseTracking';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const WEB_DIR = process.cwd();
const APP_DIR = join(WEB_DIR, 'app');
const MODULE_CSS = join(WEB_DIR, 'modules/glas-jena/runtime/glas-jena.css');
/** Test ids of the module's own components; everything else in glas-jena.css belongs to original files. */
const OWN_TEST_ID_PREFIX = 'gj-';

const readApp = (path: string) => readFileSync(join(APP_DIR, path), 'utf8');

const listFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === '__tests__' || name === 'node_modules') {
      return [];
    }
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });

/** Where original test ids are set: the shop's Vue files and the Storefront UI icons (e.g. `favorite`). */
const STOREFRONT_ICONS_DIR = join(WEB_DIR, '../../node_modules/@storefront-ui/vue/dist/components/SfIcons');
const originalSources = [
  ...listFiles(APP_DIR).filter((file) => file.endsWith('.vue')),
  ...listFiles(STOREFRONT_ICONS_DIR).filter((file) => file.endsWith('.mjs')),
]
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

/** Static (`data-testid="x"`) or bound test id (`:data-testid="... 'x'"`, `'data-testid': 'x'` in the icons). */
const hasTestId = (id: string) =>
  originalSources.includes(`data-testid="${id}"`) ||
  originalSources.includes(`'${id}'`) ||
  originalSources.includes(`"${id}"`);

/** Route names like Nuxt builds them from the page files (without the i18n locale suffix). */
const routeNames = listFiles(join(APP_DIR, 'pages'))
  .filter((file) => file.endsWith('.vue'))
  .map((file) =>
    relative(join(APP_DIR, 'pages'), file)
      .replace(/\\/g, '/')
      .replace(/\.vue$/, '')
      .replace(/\[\.\.\.(\w+)\]/g, '$1')
      .replace(/\[(\w+)\]/g, '$1')
      .replace(/\/index$/, '')
      .replace(/\//g, '-'),
  );

const getTranslation = (locale: string, key: string) =>
  key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      JSON.parse(readApp(`lang/${locale}.json`)),
    );

describe('upstream contract of the glas-jena module', () => {
  it('should find every original data-testid that glas-jena.css styles', () => {
    const testIds = [...readFileSync(MODULE_CSS, 'utf8').matchAll(/data-testid='([\w-]+)'/g)]
      .map(([, id]) => id as string)
      .filter((id) => !id.startsWith(OWN_TEST_ID_PREFIX));

    const missing = [...new Set(testIds)].filter((id) => !hasTestId(id));

    expect(missing).toEqual([]);
  });

  it('should find every original component the module replaces', () => {
    const componentFile = (name: string) => {
      /* Nuxt names: `UiHeaderBlocks` → components/ui/HeaderBlocks…, `Cookiebar` → components/Cookiebar… */
      const path = name.startsWith('Ui') ? name.replace(/^Ui/, 'components/ui/') : `components/${name}`;
      const fileName = path.split('/').pop();
      return [`${path}.vue`, `${path}/${fileName}.vue`].find((file) => existsSync(join(APP_DIR, file)));
    };

    const missing = Object.keys(COMPONENT_OVERRIDES).filter((name) => !componentFile(name));

    expect(missing).toEqual([]);
  });

  it('should find every original page the module removes (wishlist, returns)', () => {
    const missing = REMOVED_PAGE_FILES.filter((file) => !existsSync(join(APP_DIR, file)));

    expect(missing).toEqual([]);
    /* glas-jena.css hides the links to the return pages by their address */
    expect(readApp('utils/paths.ts')).toMatch(/accountReturns: '\/my-account\/returns'/);
    expect(readApp('pages/my-account/my-orders.vue')).toContain('paths.accountNewReturn}/${orderGetters.getId(order)}');
  });

  it('should find the redirect parameter of the login page that leads into the account after logging in', () => {
    /* getAccountLoginPath: /login/?redirect=/my-account */
    expect(readApp('pages/login.vue')).toContain('router.currentRoute.value.query.redirect as string');
    expect(readApp('pages/login.vue')).toContain(
      'window.location.href = redirectUrl ? localePath(redirectUrl) : localePath(paths.home);',
    );
  });

  it('should find the account parts that glas-jena.css restyles ("Ändern", dialogs, cookie button)', () => {
    /* "Ändern": the button right after the heading of AccountData */
    expect(readApp('components/AccountData/AccountData.vue')).toMatch(
      /<h2 class="typography-headline-4[^"]*">\{\{ header \}\}<\/h2>\s*<UiButton v-if="showEditButton"/,
    );
    /* Dialogs: UiModal = SfModal (data-testid="modal") on UiOverlay (data-testid="overlay") */
    expect(readApp('components/ui/Modal/Modal.vue')).toMatch(/<UiOverlay[^>]*>\s*<SfModal/);
    expect(readApp('components/ui/Overlay/Overlay.vue')).toContain('data-testid="overlay"');
    /* Page titles next to the menu, shown by the window width (gj-account-layout--wide) */
    for (const page of ['personal-data', 'billing-details', 'shipping-details', 'my-orders']) {
      expect(readApp(`pages/my-account/${page}.vue`)).toContain('data-testid="account-orders-heading"');
    }
    expect(readApp('pages/my-account/personal-data.vue')).toContain(
      'class="h-full w-full overflow-auto @md:w-[600px] @md:h-fit"',
    );
  });

  it('should find the original account layout that GlasJenaAccountLayout replaces and mirrors', () => {
    for (const name of Object.keys(LAYOUT_OVERRIDES)) {
      expect(existsSync(join(APP_DIR, 'layouts', `${name}.vue`))).toBe(true);
    }
    /* Same frame, menu and content area as the original; only the menu page on phones is new */
    const layout = readApp('layouts/account.vue');
    for (const part of [
      '<NuxtLayout name="default" :breadcrumbs="breadcrumbs">',
      'data-testid="account-layout-heading"',
      'data-testid="account-page-sidebar"',
      'data-testid="category-grid"',
      'const isRoot = computed(() => currentPath.value === localePath(paths.account));',
      "label: t('account.accountSettings.section.personalData')",
      "label: t('account.ordersAndReturns.section.myOrders')",
      'await logout();',
    ]) {
      expect(layout).toContain(part);
    }
    for (const page of ['index', 'personal-data', 'billing-details', 'shipping-details', 'my-orders']) {
      expect(readApp(`pages/my-account/${page}.vue`)).toContain("layout: 'account'");
    }
  });

  it('should find every original page the module replaces', () => {
    const missing = Object.keys(PAGE_OVERRIDES).filter((file) => !existsSync(join(APP_DIR, file)));

    expect(missing).toEqual([]);
  });

  it('should find the cancellation form logic that GlasJenaCancellationForm reuses', () => {
    /* The module's form mirrors pages/cancellation-form.vue: same composable, settings, fields and texts */
    const composable = readApp('composables/useCancellationForm/useCancellationForm.ts');
    const originalPage = readApp('pages/cancellation-form.vue');

    expect(composable).toMatch(/submitCancellation,\s*validationSchema,\s*turnstileSiteKey,/);
    for (const field of ['orderId', 'name', 'email', 'reason']) {
      expect(composable).toContain(`${field}: string()`);
      expect(originalPage).toContain(`defineField('${field}')`);
    }
    expect(originalPage).toContain("useSiteSettings('cancellationFormRecipient')");
    expect(originalPage).toContain("'cf-turnstile-response': turnstile.value");
    for (const key of ['orderId', 'name', 'email', 'reason', 'submit', 'misConfigured', 'privacyPolicy', 'success']) {
      expect(typeof getTranslation('de', `cancellationForm.${key}`)).toBe('string');
    }
  });

  it('should find the login dialog parts of the original header that GlasJenaHeaderBlocks reuses', () => {
    /* Account tile: LoginComponent / Register in UiModal like components/blocks/Header/Header.vue, logout via utils */
    const login = readApp('components/LoginComponent/LoginComponent.vue');
    const register = readApp('components/Register/Register.vue');
    const originalHeader = readApp('components/blocks/Header/Header.vue');

    expect(login).toMatch(/isModal = false/);
    expect(login).toMatch(/defineEmits\(\[[^\]]*'loggedIn'[^\]]*'change-view'/);
    expect(register).toMatch(/isModal = false/);
    expect(register).toMatch(/defineEmits\(\['registered', 'change-view'\]\)/);
    expect(originalHeader).toContain('<LoginComponent');
    const paths = readApp('utils/paths.ts');
    /* The mobile menu links guests to the login and registration pages (opening the dialog on a plain click) */
    for (const path of ['account:', 'accountMyOrders:', 'accountReturns:', 'authLogin:', 'register:']) {
      expect(paths).toContain(path);
    }
  });

  it('should find the contact form logic that GlasJenaContactForm mirrors', () => {
    /* The module's form and utils/contactForm.ts mirror pages/contact.vue: same fields, rules, settings and texts */
    const originalPage = readApp('pages/contact.vue');

    for (const field of ['name', 'email', 'subject', 'orderId', 'message', 'privacyPolicy', 'turnstile']) {
      expect(originalPage).toContain(`defineField('${field}')`);
    }
    for (const rule of ['min-clean-length', 'min-if-not-empty', 'min-length', 'digits-if-not-empty']) {
      expect(originalPage).toContain(`'${rule}'`);
    }
    expect(originalPage).toContain('doCustomerContactMail(params)');
    expect(originalPage).toContain("useSiteSettings('contactShopEmail')");
    expect(originalPage).toContain("setRobotForStaticPage('ContactPage')");
    for (const key of [
      'contact.misConfigured',
      'contact.form.nameLabel',
      'contact.form.emailLabel',
      'contact.form.subjectLabel',
      'contact.form.order-id',
      'contact.form.message',
      'contact.form.asterixHint',
      'contact.privacyPolicy',
      'contact.contactSend',
      'contact.success',
    ]) {
      expect(typeof getTranslation('de', key)).toBe('string');
    }
  });

  it('should find every page the banner has a title for', () => {
    const bannerRoutes = [
      ...Object.keys(PAGE_BANNER_TITLE_KEYS),
      ...Object.keys(OWN_PAGE_BANNER_TITLE_KEYS),
      CATEGORY_ROUTE,
      SEARCH_ROUTE,
      TAG_ROUTE,
    ];

    expect(bannerRoutes.filter((route) => !routeNames.includes(route))).toEqual([]);
    expect(routeNames).toContain(ACCOUNT_ROUTE_PREFIX);
  });

  it('should find the banner titles in German and English', () => {
    const keys = [...Object.values(PAGE_BANNER_TITLE_KEYS), ACCOUNT_TITLE_KEY, SEARCH_RESULTS_TITLE_KEY];

    for (const locale of ['de', 'en']) {
      expect(keys.filter((key) => typeof getTranslation(locale, key) !== 'string')).toEqual([]);
      expect(getTranslation(locale, SEARCH_RESULTS_TITLE_KEY)).toContain('{phrase}');
    }
  });

  it('should render the banner as a sibling right before main in the layouts with a header', () => {
    /* The banner rules in glas-jena.css use `.gj-page-banner ~ main` and `~ [data-testid='narrow-container']` */
    expect(readApp('layouts/default.vue')).toMatch(
      /<UiHeaderBlocks \/>\s*<NarrowContainer[^>]*>\s*<LazyUiBreadcrumbs[^>]*\/>\s*<\/NarrowContainer>\s*<main>/,
    );
    expect(readApp('layouts/auth.vue')).toMatch(/<UiHeaderBlocks \/>\s*<main[^>]*>\s*<h1/);
    expect(readApp('layouts/simplifiedHeaderAndFooter.vue')).toMatch(/<UiSimplifiedHeader \/>\s*<main>/);
  });

  it('should find the block list structure that the content page spacing relies on', () => {
    /* glas-jena.css: `[data-testid='category-page-content'] > .content > div > * > [data-testid='block-wrapper']` */
    expect(readApp('pages/[...slug].vue')).toContain('data-testid="category-page-content"');
    expect(readApp('components/EditableBlocks/EditableBlocks.vue')).toMatch(
      /<template>\s*<div>[\s\S]*<div v-else class="content">\s*<div v-for="block in data"[^>]*>\s*<BlockItem/,
    );
    expect(readApp('components/EditableBlocks/BlockItem.vue')).toMatch(
      /<template>\s*<component[^>]*>\s*<component[\s\S]*?data-testid="block-wrapper"/,
    );
  });

  it('should render the legal texts in a no-preflight box directly in main', () => {
    /* glas-jena.css styles the legal texts via `main > .no-preflight` */
    expect(readApp('layouts/default.vue')).toMatch(/<main>\s*<slot \/>\s*<\/main>/);
    for (const page of [
      'legal-disclosure',
      'terms-and-conditions',
      'privacy-policy',
      'cancellation-rights',
      'declaration-of-accessibility',
    ]) {
      expect(readApp(`pages/${page}.vue`)).toMatch(/<template>\s*<div class="[^"]*\bno-preflight\b[^"]*" v-html=/);
    }
  });

  it('should load editor blocks from the module (hero image, tile)', () => {
    const blocksImports = readApp('utils/blocks/blocks-imports.ts');

    expect(blocksImports).toContain("'~~/modules/*/runtime/components/blocks/**/*.vue'");
    expect(blocksImports).toContain("'~~/modules/*/runtime/components/blocks/**/defaults.ts'");
    expect(readApp('utils/blocks/block-icons.ts')).toContain("'~~/modules/*/runtime/components/blocks/**/icon.svg'");
  });

  it('should find the grid structure that the equal heights of hero image and tiles rely on', () => {
    /* glas-jena.css: `[data-testid='multi-grid-column'] > div:only-child:has(> * > * > [data-testid='gj-tile'])` */
    expect(readApp('components/blocks/structure/MultiGrid/MultiGrid.vue')).toMatch(
      /data-testid="multi-grid-column"\s*>\s*<div\s+v-for="row in columns\[cell\.colIndex\]"[^>]*>\s*<slot/,
    );
    for (const block of ['PageBlock/PageBlock.vue', 'EditorPageBlock/EditorPageBlock.vue']) {
      expect(readApp(`components/${block}`)).toMatch(/<template>\s*<div[^>]*class="h-full"[\s\S]*?<PageBlockContent/);
    }
    expect(readApp('components/PageBlock/PageBlockContent.vue')).toMatch(
      /<template>\s*<div[^>]*:class="wrapperClass">/,
    );
  });

  it('should find the slider that the item carousel block reuses and restyles', () => {
    /* GlasJenaProductCarousel: ProductSlider with its test ids, card image size and the scrollable's side buttons */
    const slider = readApp('components/ProductSlider/ProductSlider.vue');
    expect(slider).toContain('data-testid="product-slider"');
    expect(slider).toContain('buttons-placement="floating"');
    expect(slider).toMatch(/<UiProductCard[\s\S]*?class="w-48 max-w-48 shrink-0"/);
    const card = readApp('components/ui/ProductCard/ProductCard.vue');
    expect(card).toContain('data-testid="product-card"');
    expect(card).toContain("{ 'size-48': isFromSlider }");
    /* The carousel hides the rating row: a div around SfRating, whose root has the test id "rating" */
    expect(card).toMatch(/<div[^>]*>\s*<SfRating/);
    expect(readFileSync(join(STOREFRONT_ICONS_DIR, '../SfRating/SfRating.vue.mjs'), 'utf8')).toContain(
      '"data-testid": "rating"',
    );
  });

  it('should find the class of rendered rich text that the check mark lists rely on', () => {
    expect(readApp('components/TextContent/TextContent.vue')).toContain('class="rte-prose rte-prose--render"');
  });

  it('should find the page headings that the banner replaces', () => {
    expect(readApp('layouts/checkout.vue')).toMatch(
      /data-testid="checkout-layout">\s*<NarrowContainer[^>]*>\s*<div[^>]*>\s*<h1/,
    );
    expect(readApp('components/CategoryPageContent/CategoryPageContent.vue')).toMatch(
      /data-testid="category-layout">\s*<h1/,
    );
    expect(readApp('pages/contact.vue')).toMatch(
      /<NuxtLayout name="default">\s*<div[^>]*>\s*<h1 class="[^"]*typography-headline-3/,
    );
  });

  it('should find the logic of the original "My orders" page that GlasJenaMyOrders mirrors', () => {
    const myOrders = readApp('pages/my-account/my-orders.vue');
    for (const part of [
      "layout: 'account'",
      "middleware: ['auth-guard']",
      'const { fetchCustomerOrders, data, loading } = useCustomerOrders();',
      '(page) => fetchCustomerOrders({ page: Number(page) || defaults.DEFAULT_PAGE })',
      'localePath(`${paths.confirmation}/${orderGetters.getId(order)}/${orderGetters.getAccessKey(order)}`)',
      ':current-page="data.data.page"',
      ':total-items="data.data.totalsCount"',
      ':page-size="data.data.itemsPerPage"',
      'orderGetters.getTotalNet(orderGetters.getTotals(order))',
      'orderGetters.getShippingDate(order, locale)',
    ]) {
      expect(myOrders).toContain(part);
    }
  });

  it('should find the "continue shopping" button as the only link directly in the order confirmation', () => {
    const confirmation = readApp('components/ConfirmationPageContent/ConfirmationPageContent.vue');
    const root = confirmation.slice(confirmation.indexOf('data-testid="order-success-page"'));
    expect(root).toMatch(
      /<\/div>\s*<UiButton :tag="NuxtLink" :href="localePath\(paths\.home\)"[^>]*>\s*\{\{ t\('common\.actions\.continueShopping'\) \}\}/,
    );
    expect(confirmation).toContain('<OrderAgainButton v-if="isAuthorized"');
    expect(readApp('utils/paths.ts')).toContain("accountMyOrders: '/my-account/my-orders'");
  });

  it('should find the global t() that applies the texts of the translation editor (translated. prefix)', () => {
    const useT = readFileSync(
      join(WEB_DIR, '../../node_modules/@plentymarkets/shop-core/dist/runtime/composables/useT.js'),
      'utf8',
    );

    expect(useT).toContain('translated.');
  });

  it('should find the order date getter that the module replaces (date without time)', () => {
    expect(readApp('pages/my-account/my-orders.vue')).toContain('orderGetters.getDate(order, locale)');
    expect(readApp('components/OrderDetails/OrderDetails.vue')).toContain('orderGetters.getDate(order, locale)');
    expect(Object.getOwnPropertyDescriptor(orderGetters, 'getDate')?.writable).toBe(true);
  });

  it('should find the home page identifier and the SEO defaults that the English home page texts replace', () => {
    expect(readApp('pages/index.vue')).toContain('identifier: HOMEPAGE_IDENTIFIER');
    expect(readApp('utils/blocks/immutable-page-identifiers.ts')).toContain(
      "export const HOMEPAGE_IDENTIFIER = 'index'",
    );
    const appVue = readApp('app.vue');
    expect(appVue).toContain("useSiteSettings('metaTitle')");
    expect(appVue).toContain("useSiteSettings('metaDescription')");
    expect(appVue).toMatch(/useSeoMeta\(\{\s*title: \(\) => title\.value,/);
  });

  it('should find the order of the confirmation page that the purchase event of GTM is built from', () => {
    expect(routeNames).toContain(CONFIRMATION_ROUTE);
    expect(readApp('pages/confirmation/[orderId]/[accessKey].vue')).toContain(
      `useCustomerOrder('${CONFIRMATION_ORDER_STATE}')`,
    );
    const customerOrder = readApp('composables/useCustomerOrder/useCustomerOrder.ts');
    expect(customerOrder).toContain("useState<UseCustomerOrderState>('useCustomerOrder-' + id");
    expect(customerOrder).toContain('state.value.data = orderData?.order ? orderData : null;');
    for (const getter of ['getId', 'getTotals', 'getTotal', 'getOrderEmail', 'getBillingAddress'] as const) {
      expect(typeof orderGetters[getter]).toBe('function');
    }
  });

  it('should find the cookie group and the consent cookie that the Google consent relies on', () => {
    expect(readApp('configuration/cookie.config.ts')).toContain(`name: '${GTM_COOKIE_GROUP}'`);
    const cookieBar = readFileSync(
      join(WEB_DIR, '../../node_modules/@plentymarkets/shop-core/dist/runtime/composables/useCookieBar.js'),
      'utf8',
    );
    expect(cookieBar).toContain(`useCookie("${CONSENT_COOKIE}"`);
    expect(cookieBar).toContain('consentCookie.value = { hash: state.value.data.configHash, groups: jsonCookie };');
  });
});
