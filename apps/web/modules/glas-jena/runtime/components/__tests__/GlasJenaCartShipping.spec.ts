import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import type { ActiveShippingCountry, ShippingMethod } from '@plentymarkets/shop-api';
import GlasJenaCartShipping from '../GlasJenaCartShipping.vue';

const { cartShipping, send } = vi.hoisted(() => ({
  cartShipping: {
    countries: { value: [] as ActiveShippingCountry[] },
    countryId: { value: 1 as number | null },
    shippingMethods: { value: [] as ShippingMethod[] },
    shippingMethodId: { value: '25' },
    loading: { value: false },
    load: vi.fn(),
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
    cartShipping.shippingMethods.value = [method(25, 'Parcel', 7.4)];
  });

  it("should offer the countries of delivery with the cart's country selected", async () => {
    const wrapper = await mountSuspended(GlasJenaCartShipping);
    const options = wrapper.findAll('option');

    expect(cartShipping.load).toHaveBeenCalled();
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

  it('should offer the shipping methods with their costs if there are several', async () => {
    cartShipping.shippingMethods.value = [method(26, 'Warenpost', 10.4), method(25, 'Parcel', 20.3)];
    const wrapper = await mountSuspended(GlasJenaCartShipping);
    const methods = wrapper.get('[data-testid="gj-cart-shipping-methods"]');

    expect(methods.text()).toContain('Warenpost');
    expect(methods.text()).toContain('10.40');
    expect(methods.text()).toContain('20.30');

    await methods.findAll('input[type="radio"]')[0]!.setValue(true);

    expect(cartShipping.changeShippingMethod).toHaveBeenCalledWith('26');
  });
});
