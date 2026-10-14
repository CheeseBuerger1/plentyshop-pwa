import { getSearchSortingOptions } from '../searchSorting';

const EDITOR_LIST = ['default.recommended_sorting', 'texts.name1_asc', 'sorting.price.avg_asc'];

describe('searchSorting', () => {
  it('should put the default of the search in front when the editor list lacks it', () => {
    expect(getSearchSortingOptions(EDITOR_LIST, 'item.score')).toEqual(['item.score', ...EDITOR_LIST]);
  });

  it('should keep the editor list when it contains the default of the search', () => {
    expect(getSearchSortingOptions(['texts.name1_asc', 'item.score'], 'item.score')).toEqual([
      'texts.name1_asc',
      'item.score',
    ]);
  });

  it('should keep the editor list without a default of the search', () => {
    expect(getSearchSortingOptions(EDITOR_LIST, undefined)).toEqual(EDITOR_LIST);
    expect(getSearchSortingOptions(EDITOR_LIST, '')).toEqual(EDITOR_LIST);
  });
});
