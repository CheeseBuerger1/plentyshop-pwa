import type { Product } from '@plentymarkets/shop-api';
import { isNotOrderable, withNotOrderable } from '../notOrderable';

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
