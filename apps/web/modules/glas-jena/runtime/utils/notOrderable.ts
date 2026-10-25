import type { Product } from '@plentymarkets/shop-api';

/*
 * Items that cannot be ordered in the shop although PlentyONE reports them as salable (wish of the shop owner,
 * 2026-10-15): availability 10 "Aktuell nicht lieferbar". All add-to-cart buttons of such an item are disabled, like
 * the LTS shop (grey button "Aktuell nicht lieferbar").
 */
export const NOT_ORDERABLE_AVAILABILITY_IDS = [10];

/** `true` if the item's variation has an availability under which it cannot be ordered. */
/**
 * Texts of the disabled buttons per language: the short one in the item cards, the long one (like the LTS shop) on
 * the product page. glas-jena.css shows them instead of the button's own text, see getNotOrderableStyle.
 */
export const NOT_ORDERABLE_LABELS: Record<string, { short: string; long: string }> = {
  de: { short: 'Nicht lieferbar', long: 'Aktuell nicht lieferbar' },
  en: { short: 'Not available', long: 'Currently not available' },
};

/** The texts for the language (English for other languages). */
export const getNotOrderableLabels = (locale: string) => NOT_ORDERABLE_LABELS[locale] ?? NOT_ORDERABLE_LABELS.en!;

/** CSS custom properties with the texts for the language (English for other languages). */
export const getNotOrderableStyle = (locale: string) => {
  const labels = getNotOrderableLabels(locale);
  return `--gj-not-orderable-short: ${JSON.stringify(labels.short)}; --gj-not-orderable-long: ${JSON.stringify(labels.long)}`;
};

/** The disabled buttons that glas-jena.css labels with these texts (the same selectors as there) and their text. */
export const NOT_ORDERABLE_BUTTONS = [
  {
    selector: "[data-testid='product-card'][data-gj-not-orderable] [data-testid='add-to-basket-short']",
    text: 'short',
  },
  {
    selector: "html[data-gj-not-orderable] [data-testid='purchase-card'] [data-testid='add-to-cart']:disabled",
    text: 'long',
  },
] as const;

/** Marks the buttons that got their name from labelNotOrderableButtons. */
export const NOT_ORDERABLE_LABELLED = 'data-gj-not-orderable-label';

/**
 * Gives the disabled buttons the text that glas-jena.css shows as their name (`aria-label`): the CSS hides the
 * button's own content and shows the text as `::after`, which screen readers do not get (Lighthouse "Schaltflächen
 * haben keinen für Screenreader zugänglichen Namen", 2026-10-25). Buttons that no longer match lose the name again.
 */
export const labelNotOrderableButtons = (root: ParentNode, locale: string) => {
  const labels = getNotOrderableLabels(locale);
  const labelled = new Set<Element>();

  for (const { selector, text } of NOT_ORDERABLE_BUTTONS) {
    for (const button of root.querySelectorAll(selector)) {
      labelled.add(button);
      if (button.getAttribute('aria-label') !== labels[text]) {
        button.setAttribute('aria-label', labels[text]);
      }
      button.setAttribute(NOT_ORDERABLE_LABELLED, '');
    }
  }

  for (const button of root.querySelectorAll(`[${NOT_ORDERABLE_LABELLED}]`)) {
    if (!labelled.has(button)) {
      button.removeAttribute('aria-label');
      button.removeAttribute(NOT_ORDERABLE_LABELLED);
    }
  }
};

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
