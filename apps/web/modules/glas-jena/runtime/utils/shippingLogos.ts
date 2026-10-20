import dhlLogo from '../assets/shipping/dhl.svg';
import warenpostInternationalLogo from '../assets/shipping/deutsche-post-warenpost-international.svg';

/**
 * The shop's own logos of its shipping methods by shipping profile (`parcelServicePresetId` in PlentyONE), the ones
 * the LTS shop shows with its plugin "Ceres Beautifier Shipping Icons" (files from the shop owner, 2026-10-20: "DE
 * DHL.svg", "DE Deutsche Post Warenpost International.svg"). Shipping profiles not listed here show the icon of
 * PlentyONE, see getShippingMethodLogo in cartShipping.ts.
 */
export const SHIPPING_METHOD_LOGOS: Record<number, string> = {
  /* DHL - Paketversand */
  25: dhlLogo,
  /* POST - Warenpost International */
  26: warenpostInternationalLogo,
};
