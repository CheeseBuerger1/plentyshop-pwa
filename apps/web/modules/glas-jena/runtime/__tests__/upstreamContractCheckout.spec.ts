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

  it('should find the shop list of countries of delivery that plugins/shippingCountriesOrder.ts sorts', () => {
    /* The plugin watches `default` of useAggregatedCountries and sorts it with setCountries; both replace the list */
    const countries = readApp('composables/useAggregatedCountries/useAggregatedCountries.ts');
    expect(countries).toContain('state.value.default = data.value.data.default;');
    expect(countries).toContain('state.value.default = defaultCountries;');
    expect(countries).toContain('...toRefs(state.value)');
    /* The address form of the checkout shows that list in its order */
    expect(readApp('components/AddressFormShipping/AddressFormShipping.vue')).toContain(
      'const { default: shippingCountries } = useAggregatedCountries();',
    );
  });

  it('should find the buy button, terms and guarantee notice that the module rearranges', () => {
    /* GlasJenaPaymentButtons.vue puts the notes above PaymentButtons; GuaranteeNotice below it renders nothing */
    const checkout = readApp('pages/checkout.vue');
    for (const part of [
      '<PaymentButtons />',
      '<CheckoutGeneralTerms />',
      'GUARANTEE_NOTICE_DISPLAY_MODE.Modal',
      "useFeatureFlag('shopPwaEnableEu2025-1960', false)",
      "useSiteSettings('showGuaranteeNotice')",
      'useSiteSettings(GUARANTEE_NOTICE_DISPLAY_MODE_SETTING)',
      'resolveGuaranteeNoticeDisplayMode(getGuaranteeNoticeDisplayMode(), getShowGuaranteeNotice(true))',
    ]) {
      expect(checkout).toContain(part);
    }
    expect(checkout).toMatch(/<PaymentButtons \/>[\s\S]*<GuaranteeNotice\b/);
    /* The terms count as accepted only through this state, which GlasJenaCheckoutGeneralTerms.vue sets */
    expect(readApp('composables/useCheckout/useCheckout.ts')).toContain(
      "const { checkboxValue: termsAccepted, setShowErrors } = useAgreementCheckbox('checkoutGeneralTerms');",
    );
    expect(readApp('pages/readonly-checkout.vue')).toContain('<CheckoutGeneralTerms />');
    expect(readApp('utils/paths.ts')).toContain("readonlyCheckout: '/readonly-checkout',");
  });

  it('should find the free fields of the checkout that get the frame of the form fields', () => {
    /* `[data-testid='checkout-layout'] div:has(> h2 + :is(textarea, span))` */
    expect(readApp('components/CustomerWish/CustomerWish.vue')).toMatch(/<\/h2>\s*<SfTextarea/);
    expect(readApp('components/CustomerReference/CustomerReference.vue')).toMatch(/<\/h2>\s*<SfInput/);
  });

  it('should find the consent to pass the e-mail on that the module copy GlasJenaShippingPrivacy builds on', () => {
    const original = readApp('components/ShippingPrivacy/ShippingPrivacy.vue');
    for (const part of [
      'id="shipping-agreement-checkbox"',
      '@update:model-value="(event) => setShippingPrivacyAgreement(Boolean(event))"',
      "t('shipping.method.showDataPrivacyAgreementHint', { parcelServiceInformation })",
      "t('legal.privacyPolicyRequired')",
      'const { shippingPrivacyAgreement, showErrors, setShippingPrivacyAgreement } = useAdditionalInformation();',
      'shippingProviderGetters.getShippingMethodName(selectedMethod.value)',
    ]) {
      expect(original).toContain(part);
    }
    expect(readApp('components/ShippingMethod/ShippingMethod.vue')).toContain(
      '<ShippingPrivacy v-if="showShippingPrivacy" />',
    );
  });

  it('should find the shipping methods of the checkout that the module copy GlasJenaShippingMethod builds on', () => {
    /* The copy adds the logo, keeps the price on one line and fetches the methods again when the articles change */
    const original = readApp('components/ShippingMethod/ShippingMethod.vue');
    for (const part of [
      '<div v-if="hasCheckoutAddress">',
      'data-testid="shipping-method-list"',
      '@click.prevent="updateShippingMethod(shippingProviderGetters.getParcelServicePresetId(method))"',
      '<span>{{ shippingProviderGetters.getShippingMethodName(method) }}</span>',
      '<span class="ml-auto">{{ getShippingAmount(shippingProviderGetters.getShippingAmount(method)) }}</span>',
      "t('shipping.method.maxDeliveryDays', {",
      'data-testid="no-shipping-method-available"',
      '<ShippingMethodSkeleton v-else />',
      'data-testid="shipping-method-no-address-set"',
      'const { disabled = false, loading = false } = defineProps<ShippingMethodProps>();',
      'const { shippingMethods } = useCheckoutPagePaymentAndShipping();',
      "emit('update:shippingMethod', radioModel.value);",
    ]) {
      expect(original).toContain(part);
    }
    /* The checkout's article lines can be changed; the page fetches the shipping methods only once (with an address) */
    const checkout = readApp('pages/checkout.vue');
    expect(checkout).toContain('<UiCartProductCard :cart-item="cartItem"');
    expect(checkout).toContain('...(hasCheckoutAddress.value ? [useCartShippingMethods().getShippingMethods()] : [])');
    /* The tiles (GlasJenaShippingMethodTile.vue) take the look of the payment methods' tiles */
    const payment = readApp('components/CheckoutPayment/CheckoutPayment.vue');
    expect(payment).toContain('class="peer sr-only"');
    expect(payment).toContain(
      'h-20 flex flex-col items-center justify-center py-4 px-4 cursor-pointer rounded-md border border-neutral-200 -outline-offset-2 hover:border-primary-50 hover:bg-primary-50 active:border-primary-100 active:bg-primary-50 peer-checked:outline peer-checked:outline-2 peer-checked:outline-primary-500',
    );
    /* The logo: the icon of the shipping profile */
    const shippingTypes = readFileSync(
      join(process.cwd(), '../../node_modules/@plentymarkets/shop-api/lib/types/api/shipping.d.ts'),
      'utf8',
    );
    expect(shippingTypes).toContain('icon: unknown;');
  });

  it('should find the open accordion of the Packstation search that GlasJenaPackstationFinder closes', () => {
    /* The wrapper clicks `[data-testid='preferred-delivery-location-finder'] details[open] > summary` once */
    const finder = readApp('components/PreferredDelivery/PackstationFinder.vue');
    expect(finder).toContain('data-testid="preferred-delivery-location-finder"');
    expect(finder).toContain('<SfAccordionItem v-model="packstationAccordionOpen"');
    expect(finder).toContain('const packstationAccordionOpen = ref(true);');
    expect(readApp('composables/usePackstationFinder/usePackstationFinder.ts')).toContain('deliveryLocationAvailable,');
    /* SfAccordionItem: a <details> that toggles its v-model with a click on the <summary> */
    const accordion = readFileSync(
      join(
        process.cwd(),
        '../../node_modules/@storefront-ui/vue/dist/components/SfAccordionItem/SfAccordionItem.vue.mjs',
      ),
      'utf8',
    );
    expect(accordion).toContain('i("details", {');
    expect(accordion).toContain('o.$emit("update:modelValue", !e.modelValue)');
  });

  it('should find the coupon field of the checkout that the module replaces by nothing', () => {
    /* COMPONENT_OVERRIDES: Coupon → GlasJenaNoCoupon.vue */
    expect(readApp('pages/checkout.vue')).toContain('<Coupon />');
  });
});
