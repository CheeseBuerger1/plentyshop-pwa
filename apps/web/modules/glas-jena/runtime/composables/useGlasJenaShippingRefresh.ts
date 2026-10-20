import { getCartContentKey } from '../utils/cartShipping';

/**
 * Fetches the shipping methods again whenever the articles of the cart change (added, removed, other quantity).
 *
 * The shipping methods depend on the articles (weight, size): e.g. abroad "Warenpost" only for light parcels. The
 * originals fetch them only when the page loads or the country, address or payment method changes – so a cart reduced
 * to one light article kept showing only DHL, on the cart page (found by the shop owner, 2026-10-19) and in the checkout,
 * whose article lines can be changed as well (2026-10-20).
 *
 * `when`: fetch only if it returns true (the checkout shows shipping methods only once there is an address). Call it in
 * the setup of a component before any `await`, so the watcher belongs to the component and stops with it.
 */
export const useGlasJenaShippingRefresh = (when: () => boolean = () => true) => {
  const { data: cart } = useCart();
  const { getShippingMethods } = useCartShippingMethods();
  const cartContent = computed(() => getCartContentKey(cart.value?.items));

  return watch(cartContent, async (content, previous) => {
    /* An empty cart has no shipping methods: the cart page shows its empty state, the checkout goes to the cart */
    if (content && content !== previous && when()) {
      await getShippingMethods();
    }
  });
};
