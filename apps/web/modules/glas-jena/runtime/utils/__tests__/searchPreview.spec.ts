import type { CategoryTreeItem } from '@plentymarkets/shop-api';
import {
  CATEGORY_PATH_SEPARATOR,
  filterSearchSuggestions,
  findCategoryPathByLink,
  getCategoryPathLabel,
} from '../searchPreview';

const category = (id: number, name: string, children: CategoryTreeItem[] = []) =>
  ({
    id,
    type: 'item',
    childCount: children.length,
    children,
    itemCount: [],
    right: 'all',
    details: [{ name, lang: 'de', nameUrl: name, metaTitle: name, imagePath: null, image2Path: null }],
  }) as CategoryTreeItem;

const tree = [
  category(24, 'Tee & Kaffee', [
    category(56, 'Kaffee & mehr'),
    category(25, 'Teekannen', [category(30, 'alle Filter', [category(31, 'alle Größen')])]),
  ]),
  category(57, 'Diverses'),
];

/** Links as the shop builds them, here simply from the id */
const buildLink = (item: CategoryTreeItem) => `/c/${item.id}`;

const idsOf = (path: CategoryTreeItem[]) => path.map(({ id }) => id);

describe('searchPreview', () => {
  it('should return the categories from the main category down to the linked one', () => {
    expect(idsOf(findCategoryPathByLink(tree, '/c/24', buildLink))).toEqual([24]);
    expect(idsOf(findCategoryPathByLink(tree, '/c/25', buildLink))).toEqual([24, 25]);
    expect(idsOf(findCategoryPathByLink(tree, '/c/31', buildLink))).toEqual([24, 25, 30, 31]);
  });

  it('should compare links without trailing slash, query and hash', () => {
    expect(idsOf(findCategoryPathByLink(tree, '/c/30/', buildLink))).toEqual([24, 25, 30]);
    expect(idsOf(findCategoryPathByLink(tree, '/c/30?page=2#top', buildLink))).toEqual([24, 25, 30]);
    expect(idsOf(findCategoryPathByLink(tree, '/c/57', (item) => `/c/${item.id}/`))).toEqual([57]);
  });

  it('should return an empty path for a link no category has and without a tree', () => {
    expect(findCategoryPathByLink(tree, '/c/999', buildLink)).toEqual([]);
    expect(findCategoryPathByLink(undefined, '/c/24', buildLink)).toEqual([]);
  });

  it('should keep the name of the search for main categories and their subcategories', () => {
    expect(getCategoryPathLabel(findCategoryPathByLink(tree, '/c/24', buildLink), 'Tee & Kaffee')).toBe('Tee & Kaffee');
    expect(getCategoryPathLabel(findCategoryPathByLink(tree, '/c/25', buildLink), 'Teekannen')).toBe('Teekannen');
  });

  it('should put the categories above in front of the name from the third level on', () => {
    expect(getCategoryPathLabel(findCategoryPathByLink(tree, '/c/30', buildLink), 'alle Filter')).toBe(
      `Teekannen${CATEGORY_PATH_SEPARATOR}alle Filter`,
    );
    expect(getCategoryPathLabel(findCategoryPathByLink(tree, '/c/31', buildLink), 'alle Größen')).toBe(
      'Teekannen › alle Filter › alle Größen',
    );
  });

  it('should keep the name of the search for a category the tree does not know', () => {
    expect(getCategoryPathLabel([], 'Sonderposten')).toBe('Sonderposten');
  });
  const labelsOf = (labels: string[]) =>
    filterSearchSuggestions(labels.map((label) => ({ label }))).map(({ label }) => label);

  it('should drop suggested terms that begin or end with a filler word', () => {
    expect(
      labelsOf(['teekanne', 'für teekanne', 'glaskörper für', 'und auflaufform', 'auflaufform rund mit', 'mit deckel']),
    ).toEqual(['teekanne']);
  });

  it('should keep a filler word in the middle and the order of the search', () => {
    expect(labelsOf(['glaskörper für teekanne', 'teekanne miko', 'brat und auflaufform'])).toEqual([
      'glaskörper für teekanne',
      'teekanne miko',
      'brat und auflaufform',
    ]);
  });

  it('should drop terms that begin with a number, whatever the case, and empty ones', () => {
    expect(labelsOf(['8 tassen', 'Für Tasse', '  ', 'teekanne kando 1.2l'])).toEqual(['teekanne kando 1.2l']);
  });

  it('should keep the other fields of a suggestion', () => {
    expect(filterSearchSuggestions([{ label: 'deckel', count: 22 }])).toEqual([{ label: 'deckel', count: 22 }]);
  });
});
