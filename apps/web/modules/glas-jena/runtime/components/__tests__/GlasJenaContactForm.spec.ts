import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaContactForm from '../GlasJenaContactForm.vue';

const { settings } = vi.hoisted(() => ({
  settings: { cloudflareTurnstileApiSiteKey: '', contactShopEmail: '' } as Record<string, string>,
}));

mockNuxtImport('useCustomerContact', () => () => ({ loading: ref(false), doCustomerContactMail: vi.fn() }));
mockNuxtImport('useSiteSettings', () => (key: string) => ({ getSetting: () => settings[key] ?? '' }));

const configure = () => {
  settings.cloudflareTurnstileApiSiteKey = 'site-key';
  settings.contactShopEmail = 'shop@example.com';
};

describe('GlasJenaContactForm', () => {
  afterEach(() => {
    settings.cloudflareTurnstileApiSiteKey = '';
    settings.contactShopEmail = '';
  });

  it('should show the hint instead of the form while the form is not configured', async () => {
    const wrapper = await mountSuspended(GlasJenaContactForm);

    expect(wrapper.find('[data-testid="gj-contact-form-misconfigured"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="contact-form"]').exists()).toBe(false);
  });

  it('should show the fields in the order of the LTS form, with subject and order number', async () => {
    configure();

    const wrapper = await mountSuspended(GlasJenaContactForm);
    const fieldIds = wrapper
      .findAll('[data-testid="contact-form"] :is(input, textarea)')
      .map((field) => field.attributes('id'));

    expect(fieldIds).toEqual([
      'contact-name',
      'contact-email',
      'contact-subject',
      'contact-order-id',
      'contact-message',
      'contact-privacy-policy',
    ]);
  });

  it('should use the shared form look and have no clear all button', async () => {
    configure();

    const wrapper = await mountSuspended(GlasJenaContactForm);
    const form = wrapper.get('[data-testid="contact-form"]');

    expect(form.classes()).toContain('gj-form');
    expect(form.findAll('button').map((button) => button.attributes('type'))).toEqual(['submit']);
  });

  it('should open the privacy policy in a new tab and say so to screen readers', async () => {
    configure();

    /* The test i18n instance has no messages, so i18n-t would not render its slot: a stub renders it */
    const wrapper = await mountSuspended(GlasJenaContactForm, {
      global: { stubs: { 'i18n-t': { template: '<span><slot name="privacyPolicy" /></span>' } } },
    });
    const link = wrapper.get('[data-testid="gj-contact-form-privacy-link"]');

    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toContain('noopener');
    expect(link.find('.sr-only').text()).not.toBe('');
  });
});
