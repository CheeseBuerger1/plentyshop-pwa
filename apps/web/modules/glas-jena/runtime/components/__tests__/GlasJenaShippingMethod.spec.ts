import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import type { Cart, ShippingMethod } from '@plentymarkets/shop-api';
import { SHIPPING_METHOD_LOGOS } from '../../utils/shippingLogos';
import GlasJenaShippingMethod from '../GlasJenaShippingMethod.vue';

const LOGO = 'https://cdn.example/webspace/DHLShipping/logo.png';

const { getShippingMethods, hasCheckoutAddress } = vi.hoisted(() => ({
  getShippingMethods: vi.fn(),
  hasCheckoutAddress: { value: true },
}));

mockNuxtImport('useCheckoutAddress', () => () => ({ hasCheckoutAddress: computed(() => hasCheckoutAddress.value) }));

mockNuxtImport('useCartShippingMethods', () => () => ({ selectedMethod: ref(), getShippingMethods }));

mockNuxtImport('useCheckoutPagePaymentAndShipping', () => () => ({
  shippingMethods: ref([
    {
      parcelServicePresetId: 30,
      parcelServiceName: 'POST',
      parcelServicePresetName: 'Warenpost International',
      shippingAmount: 10.5,
      icon: LOGO,
    },
    { parcelServicePresetId: 25, parcelServiceName: 'DHL', parcelServicePresetName: 'Paketversand', icon: '' },
  ] as unknown as ShippingMethod[]),
}));

const setCartItems = (items: { id: number; quantity: number }[]) => {
  useCart().data.value = { ...useCart().data.value, shippingProfileId: 30, items } as Cart;
};

describe('GlasJenaShippingMethod', () => {
  beforeEach(() => {
    getShippingMethods.mockClear();
    hasCheckoutAddress.value = true;
    setCartItems([{ id: 12, quantity: 2 }]);
  });

  it('should show the shop its own logo of a shipping profile, otherwise the icon of PlentyONE', async () => {
    const wrapper = await mountSuspended(GlasJenaShippingMethod);
    const [plentyLogo, ownLogo] = wrapper.findAll('[data-testid="gj-shipping-method-logo"]');

    /* Profile 30 has no logo of its own: the icon of PlentyONE, named by its parcel service */
    expect(plentyLogo?.attributes('src')).toBe(LOGO);
    expect(plentyLogo?.attributes('alt')).toBe('POST');
    expect(plentyLogo?.classes()).not.toContain('gj-shipping-method-logo--card');
    /* Profile 25 (DHL - Paketversand): the card of the LTS shop instead of PlentyONE's missing icon */
    expect(ownLogo?.attributes('src')).toBe(SHIPPING_METHOD_LOGOS[25]?.src);
    expect(ownLogo?.attributes('alt')).toBe('DHL');
    expect(ownLogo?.classes()).toContain('gj-shipping-method-logo--card');
    wrapper.unmount();
  });

  it('should show tiles with the name of the shipping profile and the price on one line', async () => {
    const wrapper = await mountSuspended(GlasJenaShippingMethod);
    const tiles = wrapper.findAll('[data-testid="gj-shipping-method-tile"]');

    expect(tiles[0]?.text()).toContain('Warenpost International');
    expect(tiles[0]?.text()).not.toContain('POST -');
    expect(wrapper.get('[data-testid="gj-shipping-method-amount"]').classes()).toContain('whitespace-nowrap');
    /* The chosen one: the cart's shipping method */
    expect((wrapper.get('[data-testid="gj-shipping-method-30"]').element as HTMLInputElement).checked).toBe(true);
    wrapper.unmount();
  });

  it('should pass the chosen tile on to the checkout page', async () => {
    const wrapper = await mountSuspended(GlasJenaShippingMethod);

    await wrapper.get('[data-testid="gj-shipping-method-25"]').trigger('click');

    expect(wrapper.emitted('update:shippingMethod')).toEqual([['25']]);
    wrapper.unmount();
  });

  it('should not change the shipping method while the checkout is busy', async () => {
    const wrapper = await mountSuspended(GlasJenaShippingMethod, { props: { disabled: true } });

    await wrapper.get('[data-testid="gj-shipping-method-25"]').trigger('click');

    expect(wrapper.emitted('update:shippingMethod')).toBeUndefined();
    wrapper.unmount();
  });

  it('should fetch the shipping methods again when the articles change', async () => {
    const wrapper = await mountSuspended(GlasJenaShippingMethod);

    setCartItems([{ id: 12, quantity: 1 }]);
    await flushPromises();

    expect(getShippingMethods).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('should not fetch shipping methods without an address, like the checkout page', async () => {
    hasCheckoutAddress.value = false;
    const wrapper = await mountSuspended(GlasJenaShippingMethod);

    setCartItems([{ id: 12, quantity: 1 }]);
    await flushPromises();

    expect(getShippingMethods).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
