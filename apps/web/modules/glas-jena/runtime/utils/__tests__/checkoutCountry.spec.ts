import { mountSuspended } from '@nuxt/test-utils/runtime';
import { AddressType, type ActiveShippingCountry } from '@plentymarkets/shop-api';
import AddressFormShipping from '~/components/AddressFormShipping/AddressFormShipping.vue';
import { getDefaultShippingCountry } from '../checkoutCountry';

describe('checkoutCountry', () => {
  it("should take the cart's country while the default is empty or still the module's", () => {
    expect(getDefaultShippingCountry('', null, 2)).toBe('2');
    expect(getDefaultShippingCountry(undefined, null, 2)).toBe('2');
    expect(getDefaultShippingCountry('2', '2', 12)).toBe('12');
  });

  it('should keep a country the customer chose, and keep the default without a cart country', () => {
    expect(getDefaultShippingCountry('4', '2', 12)).toBeNull();
    expect(getDefaultShippingCountry('', null, 0)).toBeNull();
    expect(getDefaultShippingCountry('2', '2', 2)).toBeNull();
  });

  it("should start the original shipping address form with the default country (the cart's)", async () => {
    const countries = [
      { id: 1, currLangName: 'Germany' },
      { id: 2, currLangName: 'Austria' },
    ] as ActiveShippingCountry[];
    useAggregatedCountries().setCountries(countries, []);
    const { defaultFormValues } = useAddressForm(AddressType.Shipping);
    defaultFormValues.value = { ...defaultFormValues.value, country: '2' };

    const wrapper = await mountSuspended(AddressFormShipping, { props: { addAddress: true, disabled: false } });

    expect((wrapper.get('select[name="country"]').element as HTMLSelectElement).value).toBe('2');
  });
});
