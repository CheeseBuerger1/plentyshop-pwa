import { productGetters } from '@plentymarkets/shop-api';
import { withNotOrderable } from '../utils/notOrderable';

/** Marks the replaced getter, so it is not wrapped twice (plugin run again on the server, hot reload). */
const WRAPPED = Symbol.for('glas-jena.notOrderable');

/*
 * Items with availability "Aktuell nicht lieferbar" cannot be ordered, see utils/notOrderable.ts. The buy area of
 * the product page (PurchaseCard) calls `productGetters.isSalable` directly, so the getter itself is extended
 * instead of copying the component. The item cards are covered by GlasJenaProductCard.vue.
 */
export default defineNuxtPlugin(() => {
  const isSalable = productGetters.isSalable as typeof productGetters.isSalable & { [WRAPPED]?: boolean };
  if (isSalable[WRAPPED]) {
    return;
  }
  productGetters.isSalable = Object.assign(withNotOrderable(isSalable), { [WRAPPED]: true });
});
