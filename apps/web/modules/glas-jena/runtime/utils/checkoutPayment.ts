import type { PaymentMethod, ShippingMethod } from '@plentymarkets/shop-api';
import { paymentProviderGetters } from '@plentymarkets/shop-api';

/** Where the checkout's payment methods start (CheckoutPayment), the target when the buy button stops an order. */
export const CHECKOUT_PAYMENT_SELECTOR = '[data-testid="checkout-payment"]';

/**
 * Whether an order may go out with this payment method: PlentyONE offers it for the cart (country of delivery), it can
 * be selected, and the shipping method does not exclude it. The original buy button checks none of this and sends the
 * payment method stored in the cart, e.g. "Vorkasse" after the country changed to Chile (found by the shop owner,
 * 2026-10-24).
 */
export const isPaymentMethodAllowed = (
  methods: PaymentMethod[],
  shippingMethod: ShippingMethod | undefined,
  paymentMethodId: number,
) =>
  paymentMethodId > 0 &&
  methods.some((method) => method.id === paymentMethodId && method.isSelectable !== false) &&
  !paymentProviderGetters.isPaymentMethodExcluded(shippingMethod, paymentMethodId);

/**
 * The first payment method an order may go out with, or `undefined`: like the original's fallback after a change of
 * the shipping method (getFallbackPaymentMethod in useCheckoutPagePaymentAndShipping), which a change of the country
 * does not trigger.
 */
export const getAllowedPaymentMethod = (methods: PaymentMethod[], shippingMethod: ShippingMethod | undefined) =>
  methods.find((method) => isPaymentMethodAllowed(methods, shippingMethod, method.id));
