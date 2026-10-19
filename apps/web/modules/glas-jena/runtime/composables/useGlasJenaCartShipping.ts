import { shippingProviderGetters } from '@plentymarkets/shop-api';
import {
  MIGRATE_LTS_SESSION_FLAG,
  SHIPPING_COUNTRY_URL,
  getCartContentKey,
  sortShippingCountries,
} from '../utils/cartShipping';

/**
 * Country of delivery and shipping method in the cart, like the LTS shop (see utils/cartShipping.ts).
 *
 * `countries`: the shop's countries of delivery by name; `countryId`: the cart's country.
 * `shippingMethods`: the shipping methods (shipping profiles) for the cart and its country; `shippingMethodId`: the
 * one the cart is calculated with.
 * `changeCountry` / `changeShippingMethod` save the choice in the session and reload the cart, so the order summary
 * shows the new shipping costs (and net prices for countries without VAT, e.g. Great Britain). `changeCountry`
 * returns `false` if the country could not be changed. `watchCartContent` (in the component) fetches the shipping
 * methods again when the articles change.
 */
export const useGlasJenaCartShipping = () => {
  const { data: cart } = useCart();
  const { default: shippingCountries, fetchAggregatedCountries } = useAggregatedCountries();
  const { data: shippingProvider, getShippingMethods, saveShippingMethod } = useCartShippingMethods();
  const { fetchSession } = useFetchSession();
  const { $i18n } = useNuxtApp();
  const loading = useState('glasJenaCartShippingLoading', () => false);
  /* The server route has to call PlentyONE with the middleware's user agent, see getMiddlewareUserAgent */
  const forwardUserAgent = useFeatureFlag(MIGRATE_LTS_SESSION_FLAG);

  const countries = computed(() => sortShippingCountries(shippingCountries.value, $i18n.locale.value));
  const countryId = computed(() => cart.value?.shippingCountryId ?? null);
  const shippingMethods = computed(() => shippingProvider.value?.list ?? []);
  const shippingMethodId = computed(() => String(shippingProviderGetters.getShippingProfileId(cart.value)));
  /* Changes when articles are added, removed or their quantity changes, see watchCartContent */
  const cartContent = computed(() => getCartContentKey(cart.value?.items));

  const load = async () => {
    await Promise.all([fetchAggregatedCountries(), getShippingMethods()]);
  };

  /*
   * The shipping methods depend on the articles (weight, size): e.g. abroad "Warenpost" only for light parcels. So they
   * are fetched again whenever the articles change, not only when the page loads or the country changes – otherwise a
   * cart reduced to one light article kept showing only DHL (found by the shop owner, 2026-10-19).
   */
  const watchCartContent = () =>
    watch(cartContent, async (content, previous) => {
      if (content !== previous) {
        await getShippingMethods();
      }
    });

  const changeCountry = async (shippingCountryId: number) => {
    if (shippingCountryId === countryId.value) {
      return true;
    }
    loading.value = true;
    try {
      await $fetch(SHIPPING_COUNTRY_URL, {
        method: 'POST',
        body: { shippingCountryId, locale: $i18n.locale.value, forwardUserAgent: forwardUserAgent.value },
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
    shippingMethods,
    shippingMethodId,
    loading,
    load,
    watchCartContent,
    changeCountry,
    changeShippingMethod,
  };
};
