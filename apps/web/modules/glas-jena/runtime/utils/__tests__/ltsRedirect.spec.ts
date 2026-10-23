import { findLtsRedirect, getLtsRedirectPath } from '../ltsRedirect';

describe('ltsRedirect', () => {
  describe('findLtsRedirect', () => {
    it('should send the LTS system pages to their PWA pages and keep the query', () => {
      expect(findLtsRedirect('/sbc5/basket', {})).toEqual({ path: '/cart', query: {} });
      expect(findLtsRedirect('/gtc/', {})).toEqual({ path: '/terms-and-conditions', query: {} });
      expect(findLtsRedirect('/sbc5/login', { backlink: '/checkout' })).toEqual({
        path: '/login',
        query: { backlink: '/checkout' },
      });
      expect(findLtsRedirect('/sbc5/my-account/', {})).toEqual({ path: '/my-account/personal-data', query: {} });
    });

    it('should keep the language prefix of the old address', () => {
      expect(findLtsRedirect('/en/sbc5/gtc/', {})).toEqual({ locale: 'en', path: '/terms-and-conditions', query: {} });
      expect(findLtsRedirect('/en/basket', {})).toEqual({ locale: 'en', path: '/cart', query: {} });
    });

    it('should move the LTS search phrase from "query" to "term"', () => {
      expect(findLtsRedirect('/search', { query: 'tasse', page: '2' })).toEqual({
        path: '/search',
        query: { term: 'tasse', page: '2' },
      });
      expect(findLtsRedirect('/en/search/', { query: 'cup' })).toEqual({
        locale: 'en',
        path: '/search',
        query: { term: 'cup' },
      });
    });

    it('should send a search without any phrase to the home page', () => {
      expect(findLtsRedirect('/search', {})).toEqual({ path: '/', query: {} });
    });

    it('should drop a doubled language prefix', () => {
      expect(findLtsRedirect('/en/en/teapot-miko-1-2l-la_101010_1010/', { a: '1' })).toEqual({
        locale: 'en',
        path: '/teapot-miko-1-2l-la_101010_1010',
        query: { a: '1' },
      });
      expect(findLtsRedirect('/en/en/', {})).toEqual({ locale: 'en', path: '/', query: {} });
    });

    it('should drop a doubled language prefix and redirect the LTS page behind it at once', () => {
      expect(findLtsRedirect('/en/en/sbc5/gtc', {})).toEqual({
        locale: 'en',
        path: '/terms-and-conditions',
        query: {},
      });
    });

    it('should send the moved content pages to their new address in the language of the old one', () => {
      expect(findLtsRedirect('/sbc5/our-glass/', { a: '1' })).toEqual({
        path: '/hitzebestaendiges-glas',
        query: { a: '1' },
      });
      expect(findLtsRedirect('/en/sbc5/our-glass/', {})).toEqual({ locale: 'en', path: '/our-glass', query: {} });
      expect(findLtsRedirect('/sbc5/bank-details', {})).toEqual({ path: '/bank-details', query: {} });
      expect(findLtsRedirect('/en/sbc5/bank-details/', {})).toEqual({ locale: 'en', path: '/bank-details', query: {} });
      expect(findLtsRedirect('/en/en/sbc5/our-glass', {})).toEqual({ locale: 'en', path: '/our-glass', query: {} });
    });

    it('should leave PWA pages, categories, items and content pages alone', () => {
      expect(findLtsRedirect('/', {})).toBeUndefined();
      expect(findLtsRedirect('/en/', {})).toBeUndefined();
      expect(findLtsRedirect('/search', { term: 'tasse' })).toBeUndefined();
      expect(findLtsRedirect('/cart/', {})).toBeUndefined();
      expect(findLtsRedirect('/en/cart/', {})).toBeUndefined();
      expect(findLtsRedirect('/tee-kaffee', {})).toBeUndefined();
      expect(findLtsRedirect('/tee-kaffee/teekannen/teekanne-miko-0-8l-g_101008_1002', {})).toBeUndefined();
      expect(findLtsRedirect('/hitzebestaendiges-glas/', {})).toBeUndefined();
      expect(findLtsRedirect('/en/our-glass/', {})).toBeUndefined();
      expect(findLtsRedirect('/bank-details/', {})).toBeUndefined();
      expect(findLtsRedirect('/wish-list', {})).toBeUndefined();
    });
  });

  describe('getLtsRedirectPath', () => {
    it('should put the language prefix of the old address in front of the target', () => {
      expect(getLtsRedirectPath({ path: '/cart' })).toBe('/cart');
      expect(getLtsRedirectPath({ locale: 'en', path: '/cart' })).toBe('/en/cart');
      expect(getLtsRedirectPath({ locale: 'en', path: '/' })).toBe('/en');
      expect(getLtsRedirectPath({ path: '/' })).toBe('/');
    });
  });
});
