import { shippingProviderGetters } from '@plentymarkets/shop-api';
import { SHIPPING_COUNTRY_URL, isShippingCountryLocked, sortShippingCountries } from '../utils/cartShipping';
import { useGlasJenaShippingPreselect } from './useGlasJenaShippingPreselect';
import { useGlasJenaShippingRefresh } from './useGlasJenaShippingRefresh';

/**
 * Country of delivery and shipping method in the cart, like the LTS shop (see utils/cartShipping.ts).
 *
 * `countries`: the shop's countries of delivery by name; `countryId`: the cart's country.
 * `shippingMethods`: the shipping methods (shipping profiles) for the cart and its country; `shippingMethodId`: the
 * one the cart is calculated with.
 * `changeCountry` / `changeShippingMethod` save the choice in the session and reload the cart, so the order summary
 * shows the new shipping costs (and net prices for countries without VAT, e.g. Great Britain). `changeCountry`
 * returns `false` if the country could not be changed. `countryLocked`: the cart has an address, whose country it is
 * calculated with; the country then changes only with the address (isShippingCountryLocked). `watchCartContent` (in
 * the component) fetches the shipping methods again when the articles change, `preselectCheapest` (in the component)
 * chooses the cheapest one when the methods on offer change.
 */
export const useGlasJenaCartShipping = () => {
  const { data: cart } = useCart();
  const { default: shippingCountries, fetchAggregatedCountries } = useAggregatedCountries();
  const { data: shippingProvider, getShippingMethods, saveShippingMethod } = useCartShippingMethods();
  const { fetchSession } = useFetchSession();
  const { $i18n } = useNuxtApp();
  const loading = useState('glasJenaCartShippingLoading', () => false);

  const countries = computed(() => sortShippingCountries(shippingCountries.value, $i18n.locale.value));
  const countryId = computed(() => cart.value?.shippingCountryId ?? null);
  const countryLocked = computed(() => isShippingCountryLocked(cart.value));
  const shippingMethods = computed(() => shippingProvider.value?.list ?? []);
  const shippingMethodId = computed(() => String(shippingProviderGetters.getShippingProfileId(cart.value)));

  const load = async () => {
    await Promise.all([fetchAggregatedCountries(), getShippingMethods()]);
  };

  /* The shipping methods depend on the articles (weight, size), see useGlasJenaShippingRefresh */
  const watchCartContent = () => useGlasJenaShippingRefresh();

  /* The cheapest method when the methods on offer change, see useGlasJenaShippingPreselect */
  const preselectCheapest = () => useGlasJenaShippingPreselect(shippingMethods, changeShippingMethod);

  const changeCountry = async (shippingCountryId: number) => {
    if (countryLocked.value) {
      return false;
    }
    if (shippingCountryId === countryId.value) {
      return true;
    }
    loading.value = true;
    try {
      await $fetch(SHIPPING_COUNTRY_URL, {
        method: 'POST',
        body: { shippingCountryId, locale: $i18n.locale.value },
      });
      await fetchSession();
      await getShippingMethods();
      return true;
    } catch {
      return false;
    } finally {
      loading.value = false;
    }
  };

  const changeShippingMethod = async (methodId: string) => {
    if (methodId === shippingMethodId.value) {
      return;
    }
    loading.value = true;
    try {
      await saveShippingMethod(Number(methodId));
      await fetchSession();
    } finally {
      loading.value = false;
    }
  };

  return {
    countries,
    countryId,
    countryLocked,
    shippingMethods,
    shippingMethodId,
    loading,
    load,
    watchCartContent,
    preselectCheapest,
    changeCountry,
    changeShippingMethod,
  };
};
