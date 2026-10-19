import { mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaShippingPrivacy from '../GlasJenaShippingPrivacy.vue';

describe('GlasJenaShippingPrivacy', () => {
  beforeEach(() => {
    useAdditionalInformation().setShippingPrivacyAgreement(false);
  });

  it('should show the short label of the LTS shop and keep the full consent text closed', async () => {
    const wrapper = await mountSuspended(GlasJenaShippingPrivacy);

    expect(wrapper.get('label[for="shipping-agreement-checkbox"]').text()).toBe(
      'Receive current status by email from the parcel service provider.',
    );
    expect(wrapper.get('[data-testid="gj-shipping-privacy-info"]').attributes('aria-expanded')).toBe('false');
    expect((wrapper.get('[data-testid="gj-shipping-privacy-details"]').element as HTMLElement).style.display).toBe(
      'none',
    );
  });

  it('should open the full consent text with the info button', async () => {
    const wrapper = await mountSuspended(GlasJenaShippingPrivacy);

    await wrapper.get('[data-testid="gj-shipping-privacy-info"]').trigger('click');

    expect(wrapper.get('[data-testid="gj-shipping-privacy-info"]').attributes('aria-expanded')).toBe('true');
    expect((wrapper.get('[data-testid="gj-shipping-privacy-details"]').element as HTMLElement).style.display).toBe('');
  });

  it('should give the consent with the checkbox, as before', async () => {
    const wrapper = await mountSuspended(GlasJenaShippingPrivacy);

    await wrapper.get('#shipping-agreement-checkbox').setValue(true);

    expect(useAdditionalInformation().shippingPrivacyAgreement.value).toBe(true);
  });
});
