import { resortShippingCountries } from '../utils/cartShipping';

/*
 * The countries of delivery in alphabetical order of the shop language everywhere, like the cart's selection: sorts
 * the shop's list (useAggregatedCountries, `default`) whenever it is loaded, see resortShippingCountries. The address
 * forms of the checkout, the registration and the account read that list; the billing countries are sorted by the
 * original already.
 */
export default defineNuxtPlugin(() => {
  const { default: countries, geoRegulated, setCountries } = useAggregatedCountries();
  const { $i18n } = useNuxtApp();

  watch(
    countries,
    (list) => {
      const sorted = resortShippingCountries(list, $i18n.locale.value);
      if (sorted) {
        setCountries(sorted, geoRegulated.value);
      }
    },
    { immediate: true },
  );
});
