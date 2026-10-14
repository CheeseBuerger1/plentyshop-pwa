import { productGetters } from '@plentymarkets/shop-api';
import { getNotOrderableStyle, isNotOrderable, withNotOrderable } from '../utils/notOrderable';

/** Marks the replaced getter, so it is not wrapped twice (plugin run again on the server, hot reload). */
const WRAPPED = Symbol.for('glas-jena.notOrderable');

/*
 * Items with availability "Aktuell nicht lieferbar" cannot be ordered, see utils/notOrderable.ts. The buy area of
 * the product page (PurchaseCard) calls `productGetters.isSalable` directly, so the getter itself is extended
 * instead of copying the component. The item cards are covered by GlasJenaProductCard.vue.
 *
 * For the look of the disabled buttons (glas-jena.css) the root element carries the texts as custom properties and,
 * while the product page shows such an item, `data-gj-not-orderable`: the buy button is also disabled while it
 * adds to the cart, and only this attribute tells the two apart.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const isSalable = productGetters.isSalable as typeof productGetters.isSalable & { [WRAPPED]?: boolean };
  if (!isSalable[WRAPPED]) {
    productGetters.isSalable = Object.assign(withNotOrderable(isSalable), { [WRAPPED]: true });
  }

  const route = useRoute();
  const { currentProduct } = useProducts();
  /* The current item stays in the state after leaving its page, so only product pages count */
  const isProductPage = computed(() => route.meta.type === 'product');

  useHead({
    htmlAttrs: {
      style: () => getNotOrderableStyle(nuxtApp.$i18n.locale.value),
      'data-gj-not-orderable': () => (isProductPage.value && isNotOrderable(currentProduct.value) ? '' : undefined),
    },
  });
});
