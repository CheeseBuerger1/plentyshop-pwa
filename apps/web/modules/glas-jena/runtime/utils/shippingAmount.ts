/**
 * Shipping costs as the shop shows them, like the shipping methods of the original checkout (ShippingMethod.vue):
 * `freeText` ("Kostenlos") instead of 0,00 €, otherwise the amount formatted by `formatPrice`. Used by the shipping
 * methods of the cart and the checkout (amount from `shippingProviderGetters.getShippingAmount`, a string) and the
 * order totals (a number). Only exactly zero counts as free, like in the original.
 */
export const formatShippingAmount = (
  amount: string | number,
  freeText: string,
  formatPrice: (value: number) => string | undefined,
) => (String(amount) === '0' ? freeText : formatPrice(Number(amount)));
