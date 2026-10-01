import type { Order } from '@plentymarkets/shop-api';

/**
 * Order date without the time of day, e.g. "1.10.2026" (German) or "10/1/2026" (English). The shop's
 * `orderGetters.getDate` adds the time ("1.10.2026, 18:22:05"); the shop owner wants the date only.
 */
export const formatOrderDate = (order: Order, locale = 'en') => {
  const createdAt = order?.order?.createdAt;
  return createdAt ? new Date(createdAt).toLocaleDateString(locale) : '';
};
