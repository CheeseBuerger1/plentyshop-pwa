import type { CategoryTreeItem } from '@plentymarkets/shop-api';
import { hasSubcategories, isCategoryPathActive, normalizePath } from '../navigation';

describe('isCategoryPathActive', () => {
  it('should be active on the category page itself', () => {
    expect(isCategoryPathActive('/tee-kaffee/', '/tee-kaffee/')).toBe(true);
  });

  it('should be active on subcategories and products below the category', () => {
    expect(isCategoryPathActive('/tee-kaffee/teekannen/mit-glasfilter/', '/tee-kaffee/')).toBe(true);
    expect(isCategoryPathActive('/en/tea-coffee/teapots/teapot-for-two_220006/', '/en/tea-coffee/')).toBe(true);
  });

  it('should ignore trailing slashes, query strings and hashes', () => {
    expect(isCategoryPathActive('/tee-kaffee/teekannen?page=2', '/tee-kaffee')).toBe(true);
    expect(isCategoryPathActive('/tee-kaffee#top', '/tee-kaffee/')).toBe(true);
  });

  it('should not be active on a sibling category sharing the same prefix', () => {
    expect(isCategoryPathActive('/tee-kaffee-extra/', '/tee-kaffee/')).toBe(false);
  });

  it('should not be active on unrelated pages or for the home link', () => {
    expect(isCategoryPathActive('/kueche-helfer/', '/tee-kaffee/')).toBe(false);
    expect(isCategoryPathActive('/tee-kaffee/', '/')).toBe(false);
  });
});

describe('normalizePath', () => {
  it('should drop the query, the hash and trailing slashes', () => {
    expect(normalizePath('/tee-kaffee/teekannen/?page=2#top')).toBe('/tee-kaffee/teekannen');
    expect(normalizePath('/en/tea-coffee//')).toBe('/en/tea-coffee');
  });

  it('should keep the root path', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('/?q=1')).toBe('/');
  });
});

describe('hasSubcategories', () => {
  const category = (childCount: number, children?: unknown[]) => ({ childCount, children }) as CategoryTreeItem;

  it('should only count categories whose subcategories are in the tree', () => {
    expect(hasSubcategories(category(2, [{}, {}]))).toBe(true);
    expect(hasSubcategories(category(2, []))).toBe(false);
    expect(hasSubcategories(category(2))).toBe(false);
    expect(hasSubcategories(category(0, [{}]))).toBe(false);
  });
});
