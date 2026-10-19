/**
 * Upstream contract of the checkout (guest or login, checkout page) and of the heading and button weights.
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readApp = (path: string) => readFileSync(join(process.cwd(), 'app', path), 'utf8');

describe('upstream contract of the glas-jena module: checkout', () => {
  it('should find the parts of the guest or login choice that glas-jena.css spaces and separates', () => {
    /*
     * `div:has(> [data-testid='guest-checkout-button'])`: the column with the guest button, without padding;
     * `... form div:has(> h3)`: "Sie haben noch kein Konto?" below the login, with a line above it
     */
    const guestLogin = readApp('pages/guest/login.vue');
    expect(guestLogin).toContain('name="checkout"');
    expect(guestLogin).toMatch(
      /<div class="[^"]*\bp-2\b[^"]*">\s*<h2[^>]*>\{\{ t\('checkout\.guestCheckout'\) \}\}<\/h2>\s*<UiButton\s+data-testid="guest-checkout-button"/,
    );
    expect(guestLogin).toMatch(
      /<form[\s\S]*<div class="text-center mt-6">\s*<h3[^>]*>\{\{ t\('authentication\.login\.createAccount'\) \}\}<\/h3>[\s\S]*<\/form>/,
    );
  });

  it('should find the checkout layout spacing that glas-jena.css makes smaller', () => {
    /* `[data-testid='checkout-layout'] > [data-testid='narrow-container']` and its first row ("Zurück") */
    const layout = readApp('layouts/checkout.vue');
    expect(layout).toMatch(/<main data-testid="checkout-layout">\s*<NarrowContainer class="[^"]*\bmb-20\b[^"]*">/);
    expect(layout).toMatch(/<NarrowContainer[^>]*>\s*<div class="[^"]*\bmt-8 mb-10\b[^"]*">/);
  });

  it('should find the headings that glas-jena.css keeps light like the LTS shop', () => {
    /* The light list of "Heading weights" in glas-jena.css: test ids of the original's blocks */
    const read = (path: string) => readApp(`components/${path}`);
    expect(read('blocks/DidYouKnow/DidYouKnow.vue')).toContain('data-testid="did-you-know-title"');
    expect(read('blocks/TextCard/TextCard.vue')).toContain('data-testid="text-card"');
    expect(read('blocks/ItemText/ItemText.vue')).toContain('data-testid="item-text-block"');
    expect(read('blocks/TechnicalData/TechnicalData.vue')).toContain('data-testid="technical-data-block"');
  });

  it('should find the classes of UiButton by which glas-jena.css sets all buttons to 400', () => {
    /* `:where(.inline-flex.justify-center.no-underline).font-medium` */
    expect(readApp('components/ui/Button/Button.vue')).toContain(
      "'inline-flex items-center justify-center font-medium text-base no-underline",
    );
  });

  it('should find the default country of the shipping address form that the module fills with the cart country', () => {
    /* plugins/checkoutCountry.ts writes `defaultFormValues.country` of useAddressForm(AddressType.Shipping) */
    const addressForm = readApp('composables/useAddressForm/useAddressForm.ts');
    expect(addressForm).toContain("useState('useAddressForm' + type");
    expect(addressForm).toContain(
      '.default(state.value.defaultFormValues.country ?? cartGetters.getShippingCountryId(cartData.value).toString())',
    );
    expect(addressForm).toContain('...toRefs(state.value)');
    /* The form takes the defaults of the schema when it is created */
    const form = readApp('components/AddressFormShipping/AddressFormShipping.vue');
    expect(form).toContain('useForm({ validationSchema: shippingSchema })');
    expect(form).toContain("const [country, countryAttributes] = defineField('country');");
  });

  it('should find the coupon field of the checkout that the module replaces by nothing', () => {
    /* COMPONENT_OVERRIDES: Coupon → GlasJenaNoCoupon.vue */
    expect(readApp('pages/checkout.vue')).toContain('<Coupon />');
  });
});
