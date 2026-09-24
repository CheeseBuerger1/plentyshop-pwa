import { isCategoryPathActive } from '../navigation';

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
