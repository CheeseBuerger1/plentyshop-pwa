import { getAllowedPaymentMethod, isPaymentMethodAllowed } from '../utils/checkoutPayment';

/**
 * Keeps the checkout from ordering with a payment method that is not allowed for the cart, see isPaymentMethodAllowed
 * in utils/checkoutPayment.ts.
 *
 * - Switches to the first allowed payment method as soon as the stored one is not allowed any more (e.g. after the
 *   country of delivery changed), with the original's warning `billing.methodChanged`. The original does this only
 *   when the shipping method changes.
 * - `isOrderPaymentAllowed`: whether the payment method the buy button would send (`paymentMethods.selected`, see
 *   PaymentButtons) is allowed; the buy button stops the order otherwise (GlasJenaPaymentButtons.vue), e.g. when no
 *   payment method is allowed at all or while the switch is still running.
 *
 * Call it in the setup of a checkout component, so the watcher stops with it.
 */
export const useGlasJenaPaymentGuard = () => {
  const { send } = useNotification();
  const { data: cart } = useCart();
  const { selectedMethod: selectedShippingMethod } = useCartShippingMethods();
  const { paymentMethods, paymentLoading, shippingLoading, handlePaymentMethodUpdate } =
    useCheckoutPagePaymentAndShipping();

  const orderPaymentId = computed(() => Number(paymentMethods.value?.selected || cart.value?.methodOfPaymentId || 0));
  const isOrderPaymentAllowed = computed(() =>
    isPaymentMethodAllowed(paymentMethods.value?.list ?? [], selectedShippingMethod.value, orderPaymentId.value),
  );

  let switching = false;
  const switchToAllowedPaymentMethod = async () => {
    const list = paymentMethods.value?.list ?? [];
    /* Nothing stored yet (the customer chooses), or the lists are still loading: leave it */
    if (
      switching ||
      isOrderPaymentAllowed.value ||
      orderPaymentId.value <= 0 ||
      list.length === 0 ||
      !selectedShippingMethod.value ||
      paymentLoading.value ||
      shippingLoading.value
    ) {
      return;
    }
    const fallback = getAllowedPaymentMethod(list, selectedShippingMethod.value);
    if (!fallback) {
      return;
    }
    switching = true;
    try {
      await handlePaymentMethodUpdate(fallback.id);
      send({ message: t('billing.methodChanged'), type: 'warning' });
    } finally {
      switching = false;
    }
  };

  if (import.meta.client) {
    watch([isOrderPaymentAllowed, paymentLoading, shippingLoading], switchToAllowedPaymentMethod, { immediate: true });
  }

  return { isOrderPaymentAllowed };
};
