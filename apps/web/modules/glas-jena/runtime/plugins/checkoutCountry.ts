import { AddressType } from '@plentymarkets/shop-api';
import { getDefaultShippingCountry } from '../utils/checkoutCountry';

/*
 * The checkout's form for a new shipping address starts with the cart's country of delivery, see
 * utils/checkoutCountry.ts. The form takes its default when it is created, so the default is kept up to date with the
 * cart before that.
 */
export default defineNuxtPlugin(() => {
  const { data: cart } = useCart();
  const { defaultFormValues } = useAddressForm(AddressType.Shipping);
  let lastSetByModule: string | null = null;

  watch(
    () => cart.value?.shippingCountryId,
    (cartCountryId) => {
      const country = getDefaultShippingCountry(defaultFormValues.value.country, lastSetByModule, cartCountryId);
      if (country) {
        defaultFormValues.value = { ...defaultFormValues.value, country };
        lastSetByModule = country;
      }
    },
    { immediate: true },
  );
});
