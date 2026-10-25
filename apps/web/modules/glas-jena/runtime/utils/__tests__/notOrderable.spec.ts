import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Product } from '@plentymarkets/shop-api';
import {
  NOT_ORDERABLE_BUTTONS,
  NOT_ORDERABLE_LABELLED,
  isNotOrderable,
  labelNotOrderableButtons,
  withNotOrderable,
} from '../notOrderable';

const withAvailability = (availabilityId: number) => ({ variation: { availabilityId } }) as unknown as Product;

describe('notOrderable', () => {
  it('should treat items with availability 10 ("Aktuell nicht lieferbar") as not orderable', () => {
    expect(isNotOrderable(withAvailability(10))).toBe(true);
    expect(isNotOrderable(withAvailability(1))).toBe(false);
    expect(isNotOrderable(undefined)).toBe(false);
  });

  it('should make the shop salable check false for such items and keep it otherwise', () => {
    const salable = vi.fn(() => true);
    const isSalable = withNotOrderable(salable);

    expect(isSalable(withAvailability(10))).toBe(false);
    expect(isSalable(withAvailability(1))).toBe(true);
    salable.mockReturnValue(false);
    expect(isSalable(withAvailability(1))).toBe(false);
  });
});

describe('labelNotOrderableButtons', () => {
  const html = document.documentElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div data-testid="product-card" data-gj-not-orderable><button data-testid="add-to-basket-short" aria-label=""></button></div>
      <div data-testid="product-card"><button data-testid="add-to-basket-short" aria-label=""></button></div>
      <div data-testid="purchase-card"><button data-testid="add-to-cart" disabled></button></div>`;
    html.removeAttribute('data-gj-not-orderable');
  });

  const buttons = () => [...document.querySelectorAll('button')];

  it('should name the disabled buttons with the text that the CSS shows', () => {
    html.setAttribute('data-gj-not-orderable', '');

    labelNotOrderableButtons(document, 'de');

    expect(buttons().map((button) => button.getAttribute('aria-label'))).toEqual([
      'Nicht lieferbar',
      '',
      'Aktuell nicht lieferbar',
    ]);
  });

  it('should take the English texts for other languages', () => {
    labelNotOrderableButtons(document, 'fr');

    expect(buttons()[0]?.getAttribute('aria-label')).toBe('Not available');
    expect(buttons()[2]?.hasAttribute(NOT_ORDERABLE_LABELLED)).toBe(false);
  });

  it('should remove the name again once a button no longer matches', () => {
    html.setAttribute('data-gj-not-orderable', '');
    labelNotOrderableButtons(document, 'de');

    html.removeAttribute('data-gj-not-orderable');
    document.querySelector('[data-testid="product-card"]')?.removeAttribute('data-gj-not-orderable');
    labelNotOrderableButtons(document, 'de');

    expect(buttons().every((button) => !button.hasAttribute(NOT_ORDERABLE_LABELLED))).toBe(true);
    expect(buttons()[0]?.hasAttribute('aria-label')).toBe(false);
    expect(buttons()[2]?.hasAttribute('aria-label')).toBe(false);
  });

  it('should use the selectors of the buttons that glas-jena.css gives the texts', () => {
    /* Vitest runs in apps/web; the CSS puts `.font-body` in between, which the buttons always have around them */
    const css = readFileSync(join(process.cwd(), 'modules/glas-jena/runtime/glas-jena.css'), 'utf8').replaceAll(
      '.font-body ',
      '',
    );
    for (const { selector } of NOT_ORDERABLE_BUTTONS) {
      expect(css).toContain(selector);
    }
  });
});
