/**
 * Upstream contract of the cart page (introduction, country of delivery and shipping method, see GlasJenaCart.vue and
 * utils/cartShipping.ts).
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { shippingProviderGetters } from '@plentymarkets/shop-api';
import { BLOCKED_SET_COOKIES, PLENTY_SESSION_COOKIE, PWA_SESSION_COOKIE } from '../utils/cartShipping';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readApp = (path: string) => readFileSync(join(process.cwd(), 'app', path), 'utf8');
const readModule = (path: string) => readFileSync(join(process.cwd(), 'modules/glas-jena/runtime', path), 'utf8');
const readPackage = (path: string) => readFileSync(join(process.cwd(), '../../node_modules', path), 'utf8');

describe('upstream contract of the glas-jena module: cart page', () => {
  it('should find the parts of the cart page that the module copy GlasJenaCart builds on', () => {
    const original = readApp('pages/cart.vue');
    const copy = readModule('pages/GlasJenaCart.vue');
    /*
     * The copy adds the introduction and GlasJenaCartShipping in place of the coupon field (the shop has no coupons);
     * everything else has to be the same as in the original
     */
    for (const part of [
      '<Coupon v-if="viewport.isLessThan(\'lg\')" class="mb-2" />',
      '<Coupon v-if="viewport.isGreaterOrEquals(\'lg\')" class="mb-5" />',
    ]) {
      expect(original).toContain(part);
      expect(copy).not.toContain(part);
    }
    for (const part of [
      'name="checkout"',
      ':heading="t(\'cart.myCart\')"',
      '<UiCartProductCard :cart-item="cartItem" :class="{ \'border-t\': index === 0 }" />',
      '<OrderSummary :cart="cart">',
      'data-testid="checkout-button"',
      ':to="goToCheckout()"',
      '<PayPalExpressButton :disabled="loading" location="cartPage" class="mt-4" type="CartPreview" />',
      'placement="cart"',
      ':amount="cartGetters.getTotal(cartGetters.getTotals(cart))"',
      "{{ t('cart.empty') }}",
      '<ModuleComponentRendering area="cart.empty" class="mt-6" />',
      "definePageMeta({ pageType: 'static' });",
      'const { data: cart, cartIsEmpty, loading } = useCart();',
      'const goToCheckout = () => (isAuthorized.value ? localePath(paths.checkout) : localePath(paths.guestLogin));',
      "setPageMeta(t('common.labels.cart'), icon);",
    ]) {
      expect(original).toContain(part);
      expect(copy).toContain(part);
    }
    /* The empty cart of the original has no button of its own; the copy adds "Weiter einkaufen" (would be twice) */
    expect(original).toMatch(/\{\{ t\('cart\.empty'\) \}\}<\/h2>\s*<ModuleComponentRendering area="cart\.empty"/);
    expect(copy).toContain('data-testid="gj-cart-continue-shopping"');
  });

  it('should find the row of the checkout layout that glas-jena.css hides above the cart ("Zurück")', () => {
    /* `[data-testid='checkout-layout']:has(...) > [data-testid='narrow-container'] > div:first-child` */
    const layout = readApp('layouts/checkout.vue');
    expect(layout).toMatch(
      /<main data-testid="checkout-layout">\s*<NarrowContainer[^>]*>\s*<div[^>]*>\s*<h1[^>]*>\{\{ heading \}\}<\/h1>\s*<UiButton/,
    );
    expect(layout).toContain('data-testid="checkout-back-button"');
    expect(readApp('components/NarrowContainer/NarrowContainer.vue')).toContain('data-testid="narrow-container"');
  });

  it('should find the total and the article price that glas-jena.css styles on the cart page', () => {
    const orderSummary = readApp('components/OrderSummary/OrderSummary.vue');
    /* The total is a heading (h2): glas-jena.css makes it bold, more than the 500 of all headings */
    expect(orderSummary).toContain('data-testid="order-summary"');
    expect(orderSummary).toContain('<h2 data-testid="total-label">');
    expect(orderSummary).toContain('<h2 data-testid="total">');
    /* The country of delivery goes into the slot, which has to stay below the totals */
    expect(orderSummary).toMatch(/<h2 data-testid="total">[\s\S]*<slot \/>/);
    /* The article price is a Price component whose `test-id` becomes the data-testid */
    expect(readApp('components/ui/CartProductCard/CartProductCard.vue')).toContain('test-id="product-full-price"');
    expect(readApp('components/Price/Price.vue')).toContain(':data-testid="props.testId"');
  });

  it('should find the composables and getters that the country and shipping method in the cart rely on', () => {
    const shippingMethods = readApp('composables/useCartShippingMethods/useCartShippingMethods.ts');
    for (const part of [
      'const getShippingMethods',
      'const saveShippingMethod',
      'setShippingProvider',
      '...toRefs(state.value)',
    ]) {
      expect(shippingMethods).toContain(part);
    }
    const countries = readApp('composables/useAggregatedCountries/useAggregatedCountries.ts');
    expect(countries).toContain('default: [] as AggregatedCountries');
    expect(countries).toContain('const fetchAggregatedCountries');
    expect(readApp('composables/useFetchSession/useFetchSession.ts')).toContain('const fetchSession = async () => {');
    for (const getter of [
      'getParcelServicePresetId',
      'getShippingMethodName',
      'getShippingAmount',
      'getShippingProfileId',
    ] as const) {
      expect(typeof shippingProviderGetters[getter]).toBe('function');
    }
  });

  it("should find the middleware's session handling that the server route of the country copies", () => {
    /*
     * The route calls PlentyONE like the middleware: session cookie as plentyID, security token, the same user agent
     * (PlentyONE gives the session a new id otherwise) and the new cookies back to the browser, without domain except
     * on a deployed shop (API_URL)
     */
    const middleware = readPackage('@plentymarkets/shop-api/server/index.js');
    for (const part of [
      `const PlentyIdCookie = '${PLENTY_SESSION_COOKIE}';`,
      `const PwaSessionIdCookie = '${PWA_SESSION_COOKIE}';`,
      `const setCookieHeaderBlacklist = ${JSON.stringify(BLOCKED_SET_COOKIES).replace(/"/g, "'")};`,
      "setCookieHeader.replace(/domain=[^;]+;/, '')",
      'const isLocalDevelopment = () => !process.env.API_URL;',
      'const skipModifyDomain = !isLocalDevelopment();',
      "request.headers['x-security-token'] = config.api?.securityToken ?? '';",
      "var axios = require('axios');",
    ]) {
      expect(middleware).toContain(part);
    }
    /* The middleware passes the browser's user agent on; without one axios sends its default with the same version */
    expect(middleware).toMatch(/const FORWARD_HEADERS_KEYS = \[[^\]]*'user-agent',?\s*\];/);
    expect(middleware).not.toMatch(/['"]user-agent['"]\s*\]\s*=/i);
    const pinnedAxios = JSON.parse(readPackage('@plentymarkets/shop-api/package.json')).dependencies.axios;
    expect(JSON.parse(readPackage('axios/package.json')).version).toBe(pinnedAxios);
    /* The shop passes the browser's user agent on to the middleware */
    expect(readPackage('@plentymarkets/shop-core/dist/runtime/plugins/sdk.js')).toContain(
      'useRequestHeaders(["cookie", "x-plenty-debug-mode", "x-plenty-debug", "user-agent"])',
    );
  });

  it('should find the addresses of the cart by which the country of delivery is fixed (isShippingCountryLocked)', () => {
    const cartTypes = readPackage('@plentymarkets/shop-api/lib/types/api/cart.d.ts');
    expect(cartTypes).toContain('customerShippingAddressId: number | null;');
    expect(cartTypes).toContain('customerInvoiceAddressId?: number | null;');
  });
  it('should find the settings loader of the editor that shows the module setting "Free shipping from"', () => {
    /* GlasJenaFreeShippingFrom.vue lies in modules/glas-jena/runtime/components/settings/checkout/other-settings/ */
    expect(readApp('utils/settings-groups-imports/index.ts')).toContain(
      "import.meta.glob('~~/modules/*/runtime/components/settings/**/*.vue'",
    );
    expect(readApp('components/settings/checkout/other-settings/View.vue')).toContain('SiteConfigurationView');
    expect(readApp('composables/useSiteSettings/createSiteSettingsLogic.ts')).toContain(
      'await sdk.plentysystems.setConfiguration({ settings });',
    );
  });
  it('should find the original article line of the cart unchanged except for the quantity check of the copy', () => {
    /*
     * GlasJenaCartProductCard.vue is a copy: without its header comment, with the original comparison and import, it
     * has to be the original. If this fails, the original changed: take the change over into the copy (or drop the
     * copy if the original compares with the article's quantity now).
     */
    const original = readApp('components/ui/CartProductCard/CartProductCard.vue').replace(/\r\n/g, '\n');
    const copy = readModule('components/GlasJenaCartProductCard.vue')
      .replace(/\r\n/g, '\n')
      .replace(/^<!--[\s\S]*?-->\n/, '')
      .replace(
        '  /* The quantity of this article (the original compared with `cartData.itemQuantity`, see above) */\n',
        '',
      )
      .replace('quantityCast === cartGetters.getItemQty(cartItem)', 'quantityCast === cartData.value.itemQuantity')
      .replace("from '~/utils/debounce'", "from '../../../utils/debounce'");

    expect(original).toContain('quantityCast === cartData.value.itemQuantity) return;');
    expect(copy).toBe(original);
  });
});
