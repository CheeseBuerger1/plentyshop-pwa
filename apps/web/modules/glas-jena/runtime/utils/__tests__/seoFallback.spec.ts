import type { Product } from '@plentymarkets/shop-api';
import { ITEM_CONDITION_SETTINGS, SEO_AVAILABILITY_SETTINGS, withSeoFallback } from '../seo';

const IN_STOCK = 'https://schema.org/InStock';
const OUT_OF_STOCK = 'https://schema.org/OutOfStock';
const NEW_CONDITION = 'https://schema.org/NewCondition';
const USED_CONDITION = 'https://schema.org/UsedCondition';

/** The editor settings of the live shop (2026-10-28): availability 1 in stock, 10 out of stock, B-stock not set. */
const SETTINGS: Record<string, string> = {
  seoAvailability1: IN_STOCK,
  seoAvailability2: '',
  seoAvailability10: OUT_OF_STOCK,
  itemConditionNew: NEW_CONDITION,
  itemConditionUsed: USED_CONDITION,
  itemConditionBStock: '',
};
const getSetting = (key: string) => SETTINGS[key];

/** The cup JUMBO (variation 1081) as PlentyONE delivered it for minutes: available, new, `seoSettings: []`. */
const item = (seoSettings: unknown = [], availabilityId = 1, conditionId = 0) =>
  ({
    item: { id: 210106, condition: { id: conditionId, names: { lang: 'de', name: 'Neu' } } },
    variation: { id: 1081, availabilityId },
    seoSettings,
  }) as unknown as Product;

describe('withSeoFallback', () => {
  it('should know a setting for every availability and condition of PlentyONE', () => {
    expect(SEO_AVAILABILITY_SETTINGS).toEqual(Array.from({ length: 10 }, (_, index) => `seoAvailability${index + 1}`));
    expect(ITEM_CONDITION_SETTINGS).toEqual([
      'itemConditionNew',
      'itemConditionUsed',
      'itemConditionNewBox',
      'itemConditionNewLabel',
      'itemConditionBStock',
    ]);
  });

  it('should take availability and condition from the editor settings when PlentyONE delivers no SEO data', () => {
    expect(withSeoFallback(item(), getSetting).seoSettings).toEqual({
      mappedAvailability: IN_STOCK,
      conditionOfItem: NEW_CONDITION,
    });
    expect(withSeoFallback(item([], 10, 1), getSetting).seoSettings).toEqual({
      mappedAvailability: OUT_OF_STOCK,
      conditionOfItem: USED_CONDITION,
    });
  });

  it('should complete empty fields and keep the other SEO data', () => {
    const delivered = item({ sku: '210106', mappedAvailability: '', conditionOfItem: '', robots: 'all' });

    expect(withSeoFallback(delivered, getSetting).seoSettings).toEqual({
      sku: '210106',
      robots: 'all',
      mappedAvailability: IN_STOCK,
      conditionOfItem: NEW_CONDITION,
    });
  });

  it('should keep the values that PlentyONE delivers', () => {
    const delivered = item({ mappedAvailability: OUT_OF_STOCK, conditionOfItem: USED_CONDITION });

    expect(withSeoFallback(delivered, getSetting)).toBe(delivered);
  });

  it('should leave the item as it is without a setting for its availability and condition', () => {
    for (const unmapped of [item([], 2, 4), item([], 7, 9), item([], 0, -1)]) {
      expect(withSeoFallback(unmapped, getSetting)).toBe(unmapped);
    }
  });

  it('should complete only the field that has a setting', () => {
    expect(withSeoFallback(item([], 2, 0), getSetting).seoSettings).toEqual({ conditionOfItem: NEW_CONDITION });
    expect(withSeoFallback(item([], 1, 4), getSetting).seoSettings).toEqual({ mappedAvailability: IN_STOCK });
  });
});
