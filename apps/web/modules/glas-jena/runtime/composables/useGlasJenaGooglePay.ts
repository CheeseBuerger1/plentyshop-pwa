import { useGooglePay as useShopGooglePay } from '~/composables/useGooglePay/useGooglePay';
import { getGooglePayEnvironment } from '../utils/googlePay';

/**
 * The shop's `useGooglePay` (replaces the auto-import, see IMPORT_OVERRIDES in the module's index.ts), whose
 * Google Pay client is live when PlentyONE's PayPal runs live (see `getGooglePayEnvironment`): `initialize` and
 * `checkIsEligible` replace the client that the original creates, the rest is the original.
 */
export const useGooglePay: typeof useShopGooglePay = () => {
  const googlePay = useShopGooglePay();

  const initialize = async () => {
    if (!(await googlePay.initialize())) {
      return false;
    }
    googlePay.paymentsClient.value = new google.payments.api.PaymentsClient({
      environment: getGooglePayEnvironment(usePayPal().config.value),
    });
    return true;
  };

  /* As in the original, with the client of `initialize` above */
  const checkIsEligible = async () => {
    try {
      if (await initialize()) {
        const response = await toRaw(googlePay.paymentsClient.value).isReadyToPay(googlePay.getIsReadyToPayRequest());
        return response.result;
      }
      return false;
    } catch {
      return false;
    }
  };

  return { ...googlePay, initialize, checkIsEligible };
};
