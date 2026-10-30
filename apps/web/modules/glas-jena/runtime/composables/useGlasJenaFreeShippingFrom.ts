import { FREE_SHIPPING_FROM_SETTING, toFreeShippingFrom } from '../utils/merchantPolicies';

/**
 * The limit of free shipping within Germany from the editor setting (Checkout » Other settings » Free Shipping): 150 €
 * while it is empty, null for no free shipping. Read with every page like all editor settings, so a change needs no
 * new deployment. Used by the note in the cart and the shipping for search engines.
 */
export const useGlasJenaFreeShippingFrom = () => {
  const { getSetting } = useSiteSettings(FREE_SHIPPING_FROM_SETTING);

  return computed(() => toFreeShippingFrom(getSetting()));
};
