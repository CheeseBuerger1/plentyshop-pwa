import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaFreeShippingHint from '../GlasJenaFreeShippingHint.vue';
import { GERMANY_COUNTRY_ID } from '../../utils/freeShipping';
import { FREE_SHIPPING_FROM_SETTING } from '../../utils/merchantPolicies';

const { cart } = vi.hoisted(() => ({ cart: { value: {} as { shippingCountryId?: number; itemSum?: number } } }));

mockNuxtImport('useCart', () => () => ({ data: ref(cart.value) }));

const HINT = '[data-testid="gj-free-shipping-hint"]';
const REMAINDER = '[data-testid="gj-free-shipping-remainder"]';
const BAR = '[data-testid="gj-free-shipping-bar"]';

const mountWith = (shippingCountryId: number, itemSum: number) => {
  cart.value = { shippingCountryId, itemSum };
  return mountSuspended(GlasJenaFreeShippingHint);
};

describe('GlasJenaFreeShippingHint', () => {
  afterEach(() => {
    useSiteSettings(FREE_SHIPPING_FROM_SETTING).updateSetting('');
  });

  it('should show how much is missing to free shipping within Germany and the way to it as a bar', async () => {
    const wrapper = await mountWith(GERMANY_COUNTRY_ID, 55.8);
    const bar = wrapper.find(BAR);

    expect(wrapper.find(REMAINDER).text()).toContain('94.20');
    expect(bar.attributes()).toMatchObject({ role: 'progressbar', 'aria-valuemax': '150', 'aria-valuenow': '55.8' });
    expect(bar.find('div').attributes('style')).toContain('width: 37.2%');
  });

  it('should show that free shipping is reached from 150 € on, with a full green bar', async () => {
    const wrapper = await mountWith(GERMANY_COUNTRY_ID, 167.4);
    const fill = wrapper.find(BAR).find('div');

    expect(wrapper.find(REMAINDER).classes()).toContain('text-positive-700');
    expect(wrapper.find(BAR).attributes('aria-valuenow')).toBe('150');
    expect(fill.attributes('style')).toContain('width: 100%');
    expect(fill.classes()).toContain('bg-positive-700');
  });

  it('should show nothing for other countries of delivery', async () => {
    const wrapper = await mountWith(2, 27.9);

    expect(wrapper.find(HINT).exists()).toBe(false);
  });
  it('should take the limit from the editor setting and show nothing without free shipping', async () => {
    useSiteSettings(FREE_SHIPPING_FROM_SETTING).updateSetting('200');
    const wrapper = await mountWith(GERMANY_COUNTRY_ID, 150);

    expect(wrapper.find(REMAINDER).text()).toContain('50.00');
    expect(wrapper.find(BAR).attributes('aria-valuemax')).toBe('200');

    useSiteSettings(FREE_SHIPPING_FROM_SETTING).updateSetting('0');
    const withoutLimit = await mountWith(GERMANY_COUNTRY_ID, 150);

    expect(withoutLimit.find(HINT).exists()).toBe(false);
  });
});
