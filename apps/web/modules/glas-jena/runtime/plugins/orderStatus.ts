import { orderGetters } from '@plentymarkets/shop-api';
import { formatOrderStatus } from '../utils/orderStatus';

/*
 * Order status without the PlentyONE status number (my orders, order details), see utils/orderStatus.ts. The pages
 * call `orderGetters.getStatus` directly, so the getter itself is replaced instead of copying the pages.
 */
export default defineNuxtPlugin(() => {
  orderGetters.getStatus = formatOrderStatus;
});
