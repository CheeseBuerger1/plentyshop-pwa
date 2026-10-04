import type { Order } from '@plentymarkets/shop-api';
import { orderGetters } from '@plentymarkets/shop-api';
import type { AddressWithOptions, FlagStorage, GtagWindow, PurchaseEvent } from './types';

/**
 * `purchase` event in the data layer for the Google Ads conversion in GTM, once per order. Same structure in every
 * shop language: amounts as numbers, no formatted prices.
 */
export const PURCHASE_EVENT: PurchaseEvent['event'] = 'purchase';

/** Route of the order confirmation (without the i18n locale suffix) and the order state its page loads. */
export const CONFIRMATION_ROUTE = 'confirmation-orderId-accessKey';
export const CONFIRMATION_ORDER_STATE = 'soft-login';

/**
 * Flag per order in localStorage: unlike sessionStorage it also covers the confirmation link opened again in a new
 * tab (e.g. from the order e-mail), not only a reload.
 */
export const TRACKED_ORDER_KEY_PREFIX = 'gj-purchase-tracked-';

const DEFAULT_CURRENCY = 'EUR';
/** Address option with the e-mail address (as in `orderGetters.getOrderEmail`). */
const EMAIL_OPTION_TYPE_ID = 5;

const getAddressEmail = (address: AddressWithOptions) =>
  address?.options?.find((option) => option.typeId === EMAIL_OPTION_TYPE_ID)?.value ?? '';

/** E-mail of the order (delivery address like the confirmation page, else billing address), trimmed and lower case. */
export const getPurchaseEmail = (order: Order) =>
  (orderGetters.getOrderEmail(order) || getAddressEmail(orderGetters.getBillingAddress(order) as AddressWithOptions))
    .trim()
    .toLowerCase();

/** The event for an order, or `null` without order id or gross total. */
export const buildPurchaseEvent = (order: Order): PurchaseEvent | null => {
  const transactionId = orderGetters.getId(order);
  const totals = orderGetters.getTotals(order);
  const total = Number(totals ? orderGetters.getTotal(totals) : Number.NaN);
  if (!transactionId || !Number.isFinite(total)) {
    return null;
  }

  const event: PurchaseEvent = {
    event: PURCHASE_EVENT,
    ecommerce: {
      transaction_id: transactionId,
      value: Math.round(total * 100) / 100,
      currency: totals?.currency || DEFAULT_CURRENCY,
    },
  };
  const email = getPurchaseEmail(order);
  if (email) {
    event.user_data = { email };
  }
  return event;
};

/** Orders pushed in this page view, in case the storage is not available (e.g. blocked). */
const pushedOrders = new Set<string>();

const readFlag = (storage: FlagStorage | undefined, key: string) => {
  try {
    const value = storage?.getItem(key);
    return value !== null && value !== undefined;
  } catch {
    return false;
  }
};

const writeFlag = (storage: FlagStorage | undefined, key: string) => {
  try {
    storage?.setItem(key, String(Date.now()));
  } catch {
    /* storage blocked: the in-memory set still prevents a second event in this page view */
  }
};

const getLocalStorage = (): FlagStorage | undefined => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

/** Pushes the `purchase` event of an order unless it was pushed before; returns whether it was pushed. */
export const pushPurchaseOnce = (
  order: Order,
  dataLayer: unknown[] = ((window as unknown as GtagWindow).dataLayer ??= []),
  storage: FlagStorage | undefined = getLocalStorage(),
) => {
  const event = buildPurchaseEvent(order);
  if (!event) {
    return false;
  }
  const key = TRACKED_ORDER_KEY_PREFIX + event.ecommerce.transaction_id;
  if (pushedOrders.has(key) || readFlag(storage, key)) {
    return false;
  }
  pushedOrders.add(key);
  writeFlag(storage, key);
  dataLayer.push(event);
  return true;
};
