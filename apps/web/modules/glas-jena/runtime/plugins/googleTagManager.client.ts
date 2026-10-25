import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { orderGetters } from '@plentymarkets/shop-api';
import { getConsentState, getGtag, GTM_COOKIE_NAME, loadGtm } from '../utils/googleTagManager';
import { CONFIRMATION_ORDER_STATE, CONFIRMATION_ROUTE, pushPurchaseOnce } from '../utils/purchaseTracking';

const isConfirmationRoute = (route: RouteLocationNormalizedLoaded) =>
  String(route.name ?? '').startsWith(CONFIRMATION_ROUTE);

/*
 * Google Tag Manager in the browser, see utils/googleTagManager.ts: the banner choice updates the consent and, once
 * granted, loads the container; the order confirmation pushes the `purchase` event once its page has the order (also
 * after the soft login). Without consent the event stays in the data layer and reaches no one.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { consent } = useCookieConsent(GTM_COOKIE_NAME);
  watch(consent, (granted) => {
    getGtag()('consent', 'update', getConsentState(granted));
    if (granted) {
      loadGtm();
    }
  });

  const router = useRouter();
  const { data: order } = useCustomerOrder(CONFIRMATION_ORDER_STATE);

  nuxtApp.hook('app:mounted', () => {
    watch(
      [() => router.currentRoute.value, order],
      ([route, currentOrder]) => {
        if (
          currentOrder &&
          isConfirmationRoute(route) &&
          orderGetters.getId(currentOrder) === String(route.params.orderId)
        ) {
          pushPurchaseOnce(currentOrder);
        }
      },
      { immediate: true },
    );
  });
});
