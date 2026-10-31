import { FREE_SHIPPING_FROM_SETTING, toFreeShippingFrom } from '../utils/merchantPolicies';

/**
 * The limit of free shipping within Germany from the editor setting (Checkout » Other settings » Free Shipping): 150 €
 * while it is empty, null for no free shipping. Read with every page like all editor settings, so a change needs no
 * new deployment. Used by the note in the cart and the shipping for search engines.
 *
 * Read safely: the SEO plugin reads it whenever the head is resolved, also in unit tests of the original that replace
 * `useSiteSettings` or its state only in part; there an error became an unhandled rejection that failed the test run
 * (2026-10-31). Without a readable setting the default applies.
 */
export const useGlasJenaFreeShippingFrom = () => {
  const settings = useSiteSettings(FREE_SHIPPING_FROM_SETTING);

  const readSetting = () => {
    try {
      return settings.getSetting?.();
    } catch {
      return undefined;
    }
  };

  return computed(() => toFreeShippingFrom(readSetting()));
};
