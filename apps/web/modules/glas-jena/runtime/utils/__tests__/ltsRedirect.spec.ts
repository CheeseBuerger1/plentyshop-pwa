import { findLtsRedirect, splitLocalePrefix } from '../ltsRedirect';

const LOCALE_CODES = ['de', 'en'];

describe('ltsRedirect', () => {
  describe('splitLocalePrefix', () => {
    it('should split off the language prefix and the trailing slash', () => {
      expect(splitLocalePrefix('/en/sbc5/gtc/', LOCALE_CODES)).toEqual({ locale: 'en', path: '/sbc5/gtc' });
      expect(splitLocalePrefix('/sbc5/gtc/', LOCALE_CODES)).toEqual({ locale: undefined, path: '/sbc5/gtc' });
      expect(splitLocalePrefix('/basket', LOCALE_CODES)).toEqual({ locale: undefined, path: '/basket' });
    });

    it('should keep the home page and a bare language prefix', () => {
      expect(splitLocalePrefix('/', LOCALE_CODES)).toEqual({ locale: undefined, path: '/' });
      expect(splitLocalePrefix('/en/', LOCALE_CODES)).toEqual({ locale: 'en', path: '/' });
    });

    it('should not take a first path segment for a language that is none of the shop', () => {
      expect(splitLocalePrefix('/es/sbc5/gtc/', LOCALE_CODES)).toEqual({ locale: undefined, path: '/es/sbc5/gtc' });
    });
  });

  describe('findLtsRedirect', () => {
    it('should send the LTS system pages to their PWA pages and keep the query', () => {
      expect(findLtsRedirect('/sbc5/basket', {})).toEqual({ pathKey: 'cart', query: {} });
      expect(findLtsRedirect('/gtc', {})).toEqual({ pathKey: 'termsAndConditions', query: {} });
      expect(findLtsRedirect('/sbc5/login', { backlink: '/checkout' })).toEqual({
        pathKey: 'authLogin',
        query: { backlink: '/checkout' },
      });
      expect(findLtsRedirect('/sbc5/my-account', {})).toEqual({ pathKey: 'account', query: {} });
    });

    it('should move the LTS search phrase from "query" to "term"', () => {
      expect(findLtsRedirect('/search', { query: 'tasse', page: '2' })).toEqual({
        pathKey: 'search',
        query: { term: 'tasse', page: '2' },
      });
    });

    it('should send a search without any phrase to the home page', () => {
      expect(findLtsRedirect('/search', {})).toEqual({ pathKey: 'home', query: {} });
    });

    it('should leave PWA searches, categories, items and content pages alone', () => {
      expect(findLtsRedirect('/search', { term: 'tasse' })).toBeUndefined();
      expect(findLtsRedirect('/tee-kaffee', {})).toBeUndefined();
      expect(findLtsRedirect('/tee-kaffee/teekannen/teekanne-miko-0-8l-g_101008_1002', {})).toBeUndefined();
      expect(findLtsRedirect('/sbc5/our-glass', {})).toBeUndefined();
      expect(findLtsRedirect('/wish-list', {})).toBeUndefined();
    });
  });
});
