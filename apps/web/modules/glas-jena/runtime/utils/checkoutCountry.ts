/*
 * Country of a new shipping address in the checkout: the country of delivery of the cart (wish of the shop owner,
 * 2026-10-20), so a customer who chose it in the cart does not have to choose it again. The original means to do this
 * – the form's default is `defaultFormValues.country ?? <country of the cart>` (useAddressForm) – but the state starts
 * with an empty string instead of nothing, so the cart's country is never used. The module fills the default with the
 * cart's country instead, see plugins/checkoutCountry.ts.
 */

/**
 * The default country of the shipping address form after the cart's country changed: the cart's country if the
 * default is empty or still the one the module set before (the customer has not chosen another one), otherwise
 * `null` (keep the default).
 */
export const getDefaultShippingCountry = (
  currentDefault: string | null | undefined,
  lastSetByModule: string | null,
  cartCountryId: number | null | undefined,
) => {
  if (!cartCountryId) {
    return null;
  }
  const cartCountry = String(cartCountryId);
  const untouched = !currentDefault || currentDefault === lastSetByModule;
  return untouched && currentDefault !== cartCountry ? cartCountry : null;
};
