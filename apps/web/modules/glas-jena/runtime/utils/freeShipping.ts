import { FREE_SHIPPING_DE_DEFAULT } from './merchantPolicies';

/** PlentyONE's ID of Germany as country of delivery (the cart's `shippingCountryId`) */
export const GERMANY_COUNTRY_ID = 1;

/**
 * What is still missing to free shipping, for the note in the cart: only within Germany, where orders from `freeFrom`
 * item value are shipped free (editor setting, 150 € by default, see merchantPolicies.ts; abroad the shop has no such
 * limit). 0 when the limit is reached, undefined for other countries, an empty cart or no free shipping (null).
 * Rounded to cents, the cart sums are gross prices.
 * @example getFreeShippingRemainder(1, 27.9) // 122.1
 */
export const getFreeShippingRemainder = (
  countryId: number | null | undefined,
  itemSum: number | null | undefined,
  freeFrom: number | null = FREE_SHIPPING_DE_DEFAULT,
) => {
  if (freeFrom === null || countryId !== GERMANY_COUNTRY_ID || !itemSum || itemSum <= 0) {
    return undefined;
  }
  return Math.max(0, Math.round((freeFrom - itemSum) * 100) / 100);
};
