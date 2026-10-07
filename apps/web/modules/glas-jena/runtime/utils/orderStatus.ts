import { orderGetters, type Order } from '@plentymarkets/shop-api';

/** PlentyONE puts the status number in front of the name, e.g. "[8] Storniert" or "[3.2] In Bearbeitung". */
const STATUS_NUMBER_PREFIX = /^\[\d+(?:\.\d+)?\]\s*/;

/** The status name as customers read it: without the internal PlentyONE status number ("Storniert"). */
export const formatOrderStatus = (order: Order) => order?.order?.statusName?.replace(STATUS_NUMBER_PREFIX, '') ?? '';

/** Orders up to this age count as "just ordered": the thank-you text and the confirmation hint are shown for them. */
export const RECENT_ORDER_HOURS = 24;

/** Whether an order was placed at most `RECENT_ORDER_HOURS` ago. */
export const isRecentOrder = (createdAt: string | undefined, now = Date.now()) => {
  const created = createdAt ? new Date(createdAt).getTime() : Number.NaN;
  return Number.isFinite(created) && now - created <= RECENT_ORDER_HOURS * 60 * 60 * 1000;
};

/** PlentyONE status 8 and its sub states (8.1, 8.2 …) are "cancelled". */
const CANCELLED_STATUS = 8;

/** Whether an order is cancelled: its bank details are no payment request any more. */
export const isCancelledOrder = (order: Order) => Math.floor(Number(order?.order?.statusId)) === CANCELLED_STATUS;

/** Payment status values (`order.paymentStatus`) of a fully paid order: no payment is expected any more. */
const PAID_PAYMENT_STATUSES = ['paid', 'overpaid'];

/** Whether the order is fully paid. A missing status counts as not paid, so the bank details stay visible. */
export const isPaidOrder = (order: Order) => PAID_PAYMENT_STATUSES.includes(orderGetters.getPaymentStatus(order));

/** Whether a payment may still be expected (not cancelled, not fully paid): only then the bank details are shown. */
export const isOpenOrder = (order: Order) => !isCancelledOrder(order) && !isPaidOrder(order);
