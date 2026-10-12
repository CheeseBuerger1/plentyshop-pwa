import type { CategoryTreeItem } from '@plentymarkets/shop-api';
import { findCategory, getCategoryImageUrl, getCategoryTileDetails, getSubcategories } from '../categoryTiles';

const category = (id: number, name: string, children: CategoryTreeItem[] = [], imagePath: string | null = null) =>
  ({
    id,
    type: 'item',
    childCount: children.length,
    children,
    itemCount: [],
    right: 'all',
    details: [{ name, lang: 'de', nameUrl: name, metaTitle: name, imagePath, image2Path: null }],
  }) as CategoryTreeItem;

const tree = [
  category(24, 'Tee & Kaffee', [
    category(56, 'Kaffee & mehr'),
    category(25, 'Teekannen', [category(30, 'mit Glasfilter', [category(31, 'kleiner 1 L')])]),
  ]),
  category(57, 'Diverses'),
];

describe('categoryTiles', () => {
  it('should find a category on every level of the tree', () => {
    expect(findCategory(tree, 24)?.id).toBe(24);
    expect(findCategory(tree, 31)?.id).toBe(31);
    expect(findCategory(tree, '30')?.id).toBe(30);
    expect(findCategory(tree, 999)).toBeNull();
  });

  it('should return the subcategories of a category in the order of the tree', () => {
    expect(getSubcategories(tree, 24).map(({ id }) => id)).toEqual([56, 25]);
    expect(getSubcategories(tree, 25).map(({ id }) => id)).toEqual([30]);
  });

  it('should return no subcategories for a category without any, an unknown id or an empty tree', () => {
    expect(getSubcategories(tree, 57)).toEqual([]);
    expect(getSubcategories(tree, 31)).toEqual([]);
    expect(getSubcategories(tree, 999)).toEqual([]);
    expect(getSubcategories(tree, undefined)).toEqual([]);
    expect(getSubcategories(undefined, 24)).toEqual([]);
  });

  it('should read name and image path of a category', () => {
    expect(getCategoryTileDetails(category(56, 'Kaffee & mehr', [], 'category/56/katkaff2.jpg'))).toEqual({
      name: 'Kaffee & mehr',
      imagePath: 'category/56/katkaff2.jpg',
    });
    expect(getCategoryTileDetails(category(57, 'Diverses')).imagePath).toBeNull();
  });

  it('should build the image address in the document folder of the shop', () => {
    expect(getCategoryImageUrl('https://www.glas-jena.de', 'category/56/katkaff2.jpg')).toBe(
      'https://www.glas-jena.de/documents/category/56/katkaff2.jpg',
    );
    expect(getCategoryImageUrl('https://www.glas-jena.de', null)).toBe('');
  });
});
