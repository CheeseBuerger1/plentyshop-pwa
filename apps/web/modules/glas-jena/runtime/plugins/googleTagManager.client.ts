import { getConsentState, getGtag, GTM_COOKIE_NAME, loadGtm } from '../utils/googleTagManager';
import { CONFIRMATION_ORDER_STATE, isPurchaseReady, pushPurchaseOnce } from '../utils/purchaseTracking';

/*
 * Google Tag Manager in the browser, see utils/googleTagManager.ts: the banner choice updates the consent and, once
 * granted, loads the container; the order confirmation pushes the `purchase` event once its page has the order (also
 * after the soft login) and the visitor has consented. If the visitor only accepts on the confirmation page, the
 * event follows the consent update, so GTM reads it with the consent granted.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { consent } = useCookieConsent(GTM_COOKIE_NAME);
  const router = useRouter();
  const { data: order } = useCustomerOrder(CONFIRMATION_ORDER_STATE);

  const pushPurchaseIfReady = () => {
    if (order.value && isPurchaseReady(order.value, router.currentRoute.value, consent.value)) {
      pushPurchaseOnce(order.value);
    }
  };

  watch(consent, (granted) => {
    getGtag()('consent', 'update', getConsentState(granted));
    if (granted) {
      loadGtm();
      pushPurchaseIfReady();
    }
  });

  nuxtApp.hook('app:mounted', () => {
    watch([() => router.currentRoute.value, order], pushPurchaseIfReady, { immediate: true });
  });
});
