import { orderGetters } from '@plentymarkets/shop-api';
import { formatOrderDate } from '../utils/orderDate';

/*
 * Order dates without the time of day (my orders, order details, order confirmation), see utils/orderDate.ts. The
 * pages call `orderGetters.getDate` directly, so the getter itself is replaced instead of copying the pages.
 */
export default defineNuxtPlugin(() => {
  orderGetters.getDate = formatOrderDate;
});
