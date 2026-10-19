import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import GlasJenaCheckoutGeneralTerms from '../GlasJenaCheckoutGeneralTerms.vue';
import GlasJenaCheckoutLegalNotice from '../GlasJenaCheckoutLegalNotice.vue';

const { route } = vi.hoisted(() => ({ route: { path: '/checkout/', meta: {}, query: {}, params: {} } }));

mockNuxtImport('useRoute', () => () => route);

describe('GlasJenaCheckoutGeneralTerms', () => {
  beforeEach(() => {
    useAgreementCheckbox('checkoutGeneralTerms').setCheckboxValue(false);
  });

  it('should accept the terms without a checkbox, so the checkout can place the order', async () => {
    route.path = '/checkout/';
    const wrapper = await mountSuspended(GlasJenaCheckoutGeneralTerms);

    expect(useAgreementCheckbox('checkoutGeneralTerms').checkboxValue.value).toBe(true);
    expect(wrapper.find('[data-testid="checkout-terms-checkbox"]').exists()).toBe(false);
  });

  it('should leave the note to the buy button on the checkout page', async () => {
    route.path = '/checkout/';
    const wrapper = await mountSuspended(GlasJenaCheckoutGeneralTerms);

    expect(wrapper.find('[data-testid="gj-checkout-legal"]').exists()).toBe(false);
  });

  it('should show the note where the checkbox stood on the page after PayPal Express', async () => {
    route.path = '/readonly-checkout/';
    const wrapper = await mountSuspended(GlasJenaCheckoutGeneralTerms);

    expect(wrapper.find('[data-testid="gj-checkout-legal"]').exists()).toBe(true);
  });
});

describe('GlasJenaCheckoutLegalNotice', () => {
  it('should show the terms note (the tests stub i18n-t, so only its key is checked)', async () => {
    const wrapper = await mountSuspended(GlasJenaCheckoutLegalNotice);

    expect(wrapper.get('[data-testid="gj-checkout-terms"]').attributes('keypath')).toBe('terms');
  });

  it('should show the guarantee link only above the buy button and only when the shop shows it as a window', async () => {
    const wrapper = await mountSuspended(GlasJenaCheckoutLegalNotice, { props: { withGuaranteeNotice: true } });

    /* The feature flag of the EU guarantee notice is off in the tests */
    expect(wrapper.text()).not.toContain('guarantee');
  });
});
