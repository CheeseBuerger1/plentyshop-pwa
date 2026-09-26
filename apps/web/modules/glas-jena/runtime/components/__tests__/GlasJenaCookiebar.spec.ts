import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import type { CookieGroup } from '@plentymarkets/shop-core';
import GlasJenaCookiebar from '../GlasJenaCookiebar.vue';

const { cookieBarState, setConsent, setAllCookiesState, changeVisibilityState } = vi.hoisted(() => ({
  cookieBarState: { visible: true },
  setConsent: vi.fn(),
  setAllCookiesState: vi.fn(),
  changeVisibilityState: vi.fn(),
}));

const createCookieGroups = (): CookieGroup[] => [
  {
    name: 'CookieBar.essentials.label',
    description: 'CookieBar.essentials.description',
    accepted: true,
    cookies: [
      {
        name: 'consent-cookie',
        accepted: true,
        Provider: 'PlentyONE GmbH',
        Status: 'Consent',
        Lifespan: '100 days',
        PrivacyPolicy: '/PrivacyPolicy',
      },
    ],
  },
  {
    name: 'CookieBar.payment.label',
    description: 'CookieBar.payment.description',
    accepted: false,
    cookies: [
      {
        name: 'paypal',
        accepted: false,
        Provider: 'PayPal',
        Status: 'Payment',
        Lifespan: 'Session',
        PrivacyPolicy: 'https://www.paypal.com/privacy',
      },
      { name: 'paypal-express', accepted: false, Provider: 'PayPal', Status: '', Lifespan: '', PrivacyPolicy: '' },
    ],
  },
];

const cookieGroups = ref<CookieGroup[]>([]);

mockNuxtImport('useCookieBar', () => () => ({
  cookieGroups,
  visible: computed(() => cookieBarState.visible),
  setConsent,
  setAllCookiesState,
  changeVisibilityState,
}));

const mountCookiebar = () => mountSuspended(GlasJenaCookiebar);

const openSettings = async () => {
  const wrapper = await mountCookiebar();
  await wrapper.find('[data-testid="gj-cookiebar-settings"]').trigger('click');
  return wrapper;
};

describe('GlasJenaCookiebar', () => {
  beforeEach(() => {
    cookieGroups.value = createCookieGroups();
  });

  afterEach(() => {
    cookieBarState.visible = true;
  });

  it('should accept all cookies', async () => {
    const wrapper = await mountCookiebar();

    await wrapper.find('[data-testid="cookie-bar-accept-all"]').trigger('click');

    expect(setAllCookiesState).toHaveBeenCalledWith(true);
  });

  it('should reject the optional cookies from the first level', async () => {
    const wrapper = await mountCookiebar();

    await wrapper.find('[data-testid="gj-cookiebar-reject"]').trigger('click');

    expect(setAllCookiesState).toHaveBeenCalledWith(false);
  });

  it('should show the essential group as always active and a switch for the optional groups', async () => {
    const wrapper = await openSettings();

    expect(wrapper.findAll('[data-testid="gj-cookiebar-always-active"]')).toHaveLength(1);
    expect(wrapper.findAll('input[role="switch"], input[type="checkbox"]')).toHaveLength(1);
  });

  it('should switch all cookies of a group together', async () => {
    const wrapper = await openSettings();

    await wrapper.find('input[role="switch"], input[type="checkbox"]').setValue(true);

    expect(cookieGroups.value[1]?.cookies.every((cookie) => cookie.accepted)).toBe(true);
  });

  it('should save the selection', async () => {
    const wrapper = await openSettings();

    await wrapper.find('[data-testid="gj-cookiebar-save"]').trigger('click');

    expect(setConsent).toHaveBeenCalled();
  });

  it('should link the provider privacy policy or the own privacy page in the cookie details', async () => {
    cookieGroups.value.forEach((group) => {
      group.showMore = true;
    });
    const wrapper = await openSettings();

    /* The test router renders internal links as `router-link-stub`, external ones as `<a>` */
    const [ownPrivacyLink] = wrapper.findAll('.gj-cookiebar__cookie router-link-stub');
    const externalLinks = wrapper.findAll('.gj-cookiebar__cookie a');

    expect(ownPrivacyLink?.attributes('to')).toBe('/privacy-policy');
    expect(externalLinks).toHaveLength(1);
    expect(externalLinks[0]?.attributes('href')).toBe('https://www.paypal.com/privacy');
    expect(externalLinks[0]?.attributes('target')).toBe('_blank');
  });

  it('should reopen the banner from the cookie button once a choice was made', async () => {
    cookieBarState.visible = false;
    const wrapper = await mountCookiebar();

    expect(wrapper.find('[data-testid="gj-cookiebar"]').exists()).toBe(false);
    await wrapper.find('[data-testid="cookie-bar-open-btn"]').trigger('click');

    expect(changeVisibilityState).toHaveBeenCalled();
  });
});
