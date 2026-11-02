import { AddressType } from '@plentymarkets/shop-api';
import { getDefaultShippingCountry } from '../utils/checkoutCountry';

/*
 * The checkout's form for a new shipping address starts with the cart's country of delivery, see
 * utils/checkoutCountry.ts. The form takes its default when it is created, so the default is kept up to date with the
 * cart before that. The country the module set last is shared state: the server sets the default while it builds the
 * first page, and the browser has to know it was the module's, not the customer's choice – with a variable of its own
 * the browser started with none, took the server's country (Germany) for a choice and no longer followed the cart
 * (China chosen in the cart, Germany in the checkout; found by the shop owner, 2026-11-03).
 */
export default defineNuxtPlugin(() => {
  const { data: cart } = useCart();
  const { defaultFormValues } = useAddressForm(AddressType.Shipping);
  const lastSetByModule = useState<string | null>('glasJenaCheckoutCountry', () => null);

  watch(
    () => cart.value?.shippingCountryId,
    (cartCountryId) => {
      const country = getDefaultShippingCountry(defaultFormValues.value.country, lastSetByModule.value, cartCountryId);
      if (country) {
        defaultFormValues.value = { ...defaultFormValues.value, country };
        lastSetByModule.value = country;
      }
    },
    { immediate: true },
  );
});
