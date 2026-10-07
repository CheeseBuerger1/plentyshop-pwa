import type { Order } from '@plentymarkets/shop-api';
import {
  formatOrderStatus,
  isCancelledOrder,
  isOpenOrder,
  isPaidOrder,
  isRecentOrder,
  RECENT_ORDER_HOURS,
} from '../orderStatus';

const createOrder = (statusName: string, statusId = 0) => ({ order: { statusName, statusId } }) as unknown as Order;

describe('formatOrderStatus', () => {
  it('should remove the PlentyONE status number in front of the name', () => {
    expect(formatOrderStatus(createOrder('[8] Storniert'))).toBe('Storniert');
    expect(formatOrderStatus(createOrder('[3.2] In Bearbeitung'))).toBe('In Bearbeitung');
  });

  it('should keep a name without a number and survive a missing status', () => {
    expect(formatOrderStatus(createOrder('Versendet'))).toBe('Versendet');
    expect(formatOrderStatus({} as Order)).toBe('');
  });
});

describe('isRecentOrder', () => {
  const now = new Date('2026-10-06T12:00:00Z').getTime();
  const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();

  it('should count orders of the last 24 hours as recent', () => {
    expect(RECENT_ORDER_HOURS).toBe(24);
    expect(isRecentOrder(hoursAgo(1), now)).toBe(true);
    expect(isRecentOrder(hoursAgo(24), now)).toBe(true);
  });

  it('should not count older orders as recent', () => {
    expect(isRecentOrder(hoursAgo(24.1), now)).toBe(false);
    expect(isRecentOrder('2026-09-25T10:22:05Z', now)).toBe(false);
  });

  it('should not count an order without a valid date as recent', () => {
    expect(isRecentOrder(undefined, now)).toBe(false);
    expect(isRecentOrder('no date', now)).toBe(false);
  });
});

describe('isCancelledOrder', () => {
  it('should recognise status 8 and its sub states', () => {
    expect(isCancelledOrder(createOrder('[8] Storniert', 8))).toBe(true);
    expect(isCancelledOrder(createOrder('[8.1] Storniert', 8.1))).toBe(true);
  });

  it('should not recognise other states or a missing status', () => {
    expect(isCancelledOrder(createOrder('[7] Warenausgang', 7))).toBe(false);
    expect(isCancelledOrder(createOrder('[18] Anderes', 18))).toBe(false);
    expect(isCancelledOrder({} as Order)).toBe(false);
  });
});

const withPayment = (paymentStatus: string | undefined, statusId = 7) =>
  ({ order: { statusId }, paymentStatus }) as unknown as Order;

describe('isOpenOrder', () => {
  it('should count unpaid and partly paid orders as open', () => {
    expect(isOpenOrder(withPayment('unpaid'))).toBe(true);
    expect(isOpenOrder(withPayment('partial'))).toBe(true);
  });

  it('should keep the bank details for an order without a payment status', () => {
    expect(isPaidOrder(withPayment(undefined))).toBe(false);
    expect(isOpenOrder(withPayment(undefined))).toBe(true);
  });

  it('should not count a paid or overpaid order as open', () => {
    expect(isPaidOrder(withPayment('paid'))).toBe(true);
    expect(isOpenOrder(withPayment('paid'))).toBe(false);
    expect(isOpenOrder(withPayment('overpaid'))).toBe(false);
  });

  it('should not count a cancelled order as open, even if unpaid', () => {
    expect(isOpenOrder(withPayment('unpaid', 8))).toBe(false);
  });
});
