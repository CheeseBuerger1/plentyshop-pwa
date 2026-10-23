import type { PaymentMethod, ShippingMethod } from '@plentymarkets/shop-api';
import { getAllowedPaymentMethod, isPaymentMethodAllowed } from '../checkoutPayment';

const PREPAYMENT = 6000;
const PAYPAL = 6001;
const INVOICE = 6002;

const payment = (id: number, isSelectable = true) => ({ id, isSelectable }) as PaymentMethod;
const shipping = (excludedPaymentMethodIds: number[] = []) =>
  ({ excludedPaymentMethodIds }) as unknown as ShippingMethod;

describe('checkoutPayment', () => {
  describe('isPaymentMethodAllowed', () => {
    it('should allow a payment method that is offered, selectable and not excluded', () => {
      expect(isPaymentMethodAllowed([payment(PREPAYMENT), payment(PAYPAL)], shipping(), PREPAYMENT)).toBe(true);
    });

    it('should not allow a payment method that PlentyONE no longer offers, e.g. after the country changed', () => {
      expect(isPaymentMethodAllowed([payment(PAYPAL)], shipping(), PREPAYMENT)).toBe(false);
    });

    it('should not allow a payment method that cannot be selected', () => {
      expect(isPaymentMethodAllowed([payment(PREPAYMENT, false), payment(PAYPAL)], shipping(), PREPAYMENT)).toBe(false);
    });

    it('should not allow a payment method that the shipping method excludes', () => {
      expect(isPaymentMethodAllowed([payment(PREPAYMENT), payment(PAYPAL)], shipping([PREPAYMENT]), PREPAYMENT)).toBe(
        false,
      );
    });

    it('should not allow ordering without any payment method', () => {
      expect(isPaymentMethodAllowed([payment(PAYPAL)], shipping(), 0)).toBe(false);
    });

    it('should allow a payment method without a known shipping method, like the original getters', () => {
      expect(isPaymentMethodAllowed([payment(PREPAYMENT)], undefined, PREPAYMENT)).toBe(true);
    });
  });

  describe('getAllowedPaymentMethod', () => {
    it('should return the first allowed payment method in the order of PlentyONE', () => {
      const methods = [payment(PREPAYMENT, false), payment(PAYPAL), payment(INVOICE)];

      expect(getAllowedPaymentMethod(methods, shipping([PAYPAL]))?.id).toBe(INVOICE);
    });

    it('should return nothing when no payment method is allowed', () => {
      expect(getAllowedPaymentMethod([payment(PREPAYMENT)], shipping([PREPAYMENT]))).toBeUndefined();
      expect(getAllowedPaymentMethod([], shipping())).toBeUndefined();
    });
  });
});
