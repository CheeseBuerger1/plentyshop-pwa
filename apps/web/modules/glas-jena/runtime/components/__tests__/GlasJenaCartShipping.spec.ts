import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import type { ActiveShippingCountry, ShippingMethod } from '@plentymarkets/shop-api';
import GlasJenaCartShipping from '../GlasJenaCartShipping.vue';

const { cartShipping, send } = vi.hoisted(() => ({
  cartShipping: {
    countries: { value: [] as ActiveShippingCountry[] },
    countryId: { value: 1 as number | null },
    countryLocked: { value: false },
    shippingMethods: { value: [] as ShippingMethod[] },
    shippingMethodId: { value: '25' },
    loading: { value: false },
    load: vi.fn(),
    watchCartContent: vi.fn(),
    preselectCheapest: vi.fn(),
    changeCountry: vi.fn(),
    changeShippingMethod: vi.fn(),
  },
  send: vi.fn(),
}));

vi.mock('../../composables/useGlasJenaCartShipping', () => ({
  useGlasJenaCartShipping: () => ({
    ...cartShipping,
    countries: ref(cartShipping.countries.value),
    countryId: ref(cartShipping.countryId.value),
    countryLocked: ref(cartShipping.countryLocked.value),
    shippingMethods: ref(cartShipping.shippingMethods.value),
    shippingMethodId: ref(cartShipping.shippingMethodId.value),
    loading: ref(cartShipping.loading.value),
  }),
}));

mockNuxtImport('useNotification', () => () => ({ send }));

const country = (id: number, currLangName: string) => ({ id, currLangName }) as ActiveShippingCountry;
const method = (id: number, name: string, amount: number) =>
  ({
    parcelServicePresetId: id,
    parcelServicePresetName: name,
    parcelServiceName: 'DHL',
    shippingAmount: amount,
  }) as unknown as ShippingMethod;

describe('GlasJenaCartShipping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cartShipping.countries.value = [country(1, 'Germany'), country(2, 'Austria')];
    cartShipping.countryId.value = 1;
    cartShipping.countryLocked.value = false;
    cartShipping.shippingMethods.value = [method(25, 'Parcel', 7.4)];
  });

  it("should offer the countries of delivery with the cart's country selected", async () => {
    const wrapper = await mountSuspended(GlasJenaCartShipping);
    const options = wrapper.findAll('option');

    expect(cartShipping.load).toHaveBeenCalled();
    /* The shipping methods are fetched again when the articles change */
    expect(cartShipping.watchCartContent).toHaveBeenCalled();
    /* The cheapest method is chosen when the methods on offer change */
    expect(cartShipping.preselectCheapest).toHaveBeenCalled();
    expect(wrapper.get('label[for="gj-cart-shipping-country"]').text()).toBe('Country of delivery');
    expect(options.map((option) => option.text())).toEqual(['Germany', 'Austria']);
    expect(options[0]!.attributes('selected')).toBeDefined();
  });

  it('should change the country when another one is chosen', async () => {
    cartShipping.changeCountry.mockResolvedValue(true);
    const wrapper = await mountSuspended(GlasJenaCartShipping);

    await wrapper.get('select').setValue('2');

    expect(cartShipping.changeCountry).toHaveBeenCalledWith(2);
    expect(send).not.toHaveBeenCalled();
  });

  it('should say so if the country could not be changed', async () => {
    cartShipping.changeCountry.mockResolvedValue(false);
    const wrapper = await mountSuspended(GlasJenaCartShipping);

    await wrapper.get('select').setValue('2');
    await flushPromises();

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: 'negative' }));
  });

  it('should show no choice of shipping methods if there is only one', async () => {
    const wrapper = await mountSuspended(GlasJenaCartShipping);

    expect(wrapper.find('[data-testid="gj-cart-shipping-methods"]').exists()).toBe(false);
  });

  it('should offer the shipping methods as tiles with their costs if there are several', async () => {
    cartShipping.shippingMethods.value = [method(26, 'Warenpost', 10.4), method(25, 'Parcel', 20.3)];
    const wrapper = await mountSuspended(GlasJenaCartShipping);
    const tiles = wrapper.findAll('[data-testid="gj-shipping-method-tile"]');

    /* Only the name of the shipping profile: the logo shows the parcel service */
    expect(tiles.map((tile) => tile.text())).toEqual([expect.stringContaining('Warenpost'), expect.any(String)]);
    expect(tiles[0]!.text()).not.toContain('DHL');
    expect(tiles[0]!.text()).toContain('10.40');
    expect(tiles[1]!.text()).toContain('20.30');
    /* The chosen one: the cart's shipping method */
    expect((wrapper.get('[data-testid="gj-shipping-method-25"]').element as HTMLInputElement).checked).toBe(true);

    await wrapper.get('[data-testid="gj-shipping-method-26"]').trigger('click');

    expect(cartShipping.changeShippingMethod).toHaveBeenCalledWith('26');
  });

  it('should let the country be chosen without an address in the cart', async () => {
    const wrapper = await mountSuspended(GlasJenaCartShipping);

    expect(wrapper.get('select').attributes('disabled')).toBeUndefined();
    expect(wrapper.find('[data-testid="gj-cart-shipping-country-locked"]').exists()).toBe(false);
  });

  it('should fix the country with a note when the cart has an address, like the LTS shop', async () => {
    cartShipping.countryLocked.value = true;
    const wrapper = await mountSuspended(GlasJenaCartShipping);

    expect(wrapper.get('select').attributes('disabled')).toBeDefined();
    expect(wrapper.get('select').attributes('aria-describedby')).toBe('gj-cart-shipping-country-locked');
    expect(wrapper.get('#gj-cart-shipping-country-locked').text()).toBe(
      'Please change your address in the checkout in order to change the country of delivery.',
    );
  });
});
