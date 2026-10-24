import { RECOMMENDED_SORTING, RECOMMENDED_SORTING_FALLBACK, resolveRecommendedSorting } from '../recommendedSorting';

describe('recommendedSorting', () => {
  it('should send "Empfohlen" as its first level from the editor', () => {
    expect(resolveRecommendedSorting(RECOMMENDED_SORTING, 'variation.position_asc')).toBe('variation.position_asc');
    expect(resolveRecommendedSorting(RECOMMENDED_SORTING, 'texts.name1_asc')).toBe('texts.name1_asc');
  });

  it('should fall back to the variation position without a usable first level', () => {
    for (const firstLevel of [undefined, '', RECOMMENDED_SORTING, 3]) {
      expect(resolveRecommendedSorting(RECOMMENDED_SORTING, firstLevel)).toBe(RECOMMENDED_SORTING_FALLBACK);
    }
  });

  it('should leave every other sorting as it is', () => {
    for (const sort of ['texts.name1_asc', 'texts.name1_desc', 'sorting.price.avg_asc', 'item.score', 'item.random']) {
      expect(resolveRecommendedSorting(sort, 'variation.position_asc')).toBe(sort);
    }
    expect(resolveRecommendedSorting(undefined, 'variation.position_asc')).toBeUndefined();
  });
});
