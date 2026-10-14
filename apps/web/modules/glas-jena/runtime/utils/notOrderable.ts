import type { Product } from '@plentymarkets/shop-api';

/*
 * Items that cannot be ordered in the shop although PlentyONE reports them as salable (wish of the shop owner,
 * 2026-10-15): availability 10 "Aktuell nicht lieferbar". All add-to-cart buttons of such an item are disabled, like
 * the LTS shop (grey button "Aktuell nicht lieferbar").
 */
export const NOT_ORDERABLE_AVAILABILITY_IDS = [10];

/** `true` if the item's variation has an availability under which it cannot be ordered. */
export const isNotOrderable = (product: Product | null | undefined) =>
  NOT_ORDERABLE_AVAILABILITY_IDS.includes(Number(product?.variation?.availabilityId));

/**
 * The shop's `productGetters.isSalable` with this rule added: on the product page it disables "In den Warenkorb"
 * (with the hint "Der Artikel ist nicht verfügbar") and hides the PayPal express buttons. The quantity stays, like
 * the LTS shop; `isActiveVariationSalable` is left alone, otherwise the quantity would give way to "Notify me".
 */
export const withNotOrderable =
  (isSalable: (product: Product) => boolean) =>
  (product: Product): boolean =>
    !isNotOrderable(product) && isSalable(product);
