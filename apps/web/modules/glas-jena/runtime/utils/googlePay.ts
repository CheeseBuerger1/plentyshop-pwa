import type { PayPalSettings } from '@plentymarkets/shop-api';

/**
 * Environment of the Google Pay client: live (`PRODUCTION`) when PlentyONE's PayPal settings say "no sandbox", else
 * `TEST`, also while the settings are not loaded (as in the shop's `useGooglePay`).
 *
 * The shop reads this through `paypalGetters.isProduction`, which looks for `extra.sandbox`; PlentyONE delivers
 * `isSandbox` instead (as read by the shop's PayPalPayUponInvoiceForm), so the shop always opened Google Pay as a
 * test environment ("Test environment, your card will not be charged").
 */
export const getGooglePayEnvironment = (config: PayPalSettings | null): google.payments.api.Environment =>
  config?.isSandbox === false ? 'PRODUCTION' : 'TEST';
