import { ACCOUNT_TITLE_KEY, getCategoryKicker, getFixedPageBannerTitleKey, getTagName } from '../pageBanner';

describe('pageBanner', () => {
  describe('getFixedPageBannerTitleKey', () => {
    it('should return the page name of a page with a fixed title', () => {
      expect(getFixedPageBannerTitleKey('cart')).toBe('common.labels.cart');
      expect(getFixedPageBannerTitleKey('legal-disclosure')).toBe('legal.legalDisclosure');
    });

    it('should return "my account" for all account pages', () => {
      expect(getFixedPageBannerTitleKey('my-account')).toBe(ACCOUNT_TITLE_KEY);
      expect(getFixedPageBannerTitleKey('my-account-personal-data')).toBe(ACCOUNT_TITLE_KEY);
      expect(getFixedPageBannerTitleKey('my-account-my-orders-id')).toBe(ACCOUNT_TITLE_KEY);
    });

    it('should return nothing for the home page, product pages and unknown pages', () => {
      expect(getFixedPageBannerTitleKey('index')).toBeUndefined();
      expect(getFixedPageBannerTitleKey('product-slug')).toBeUndefined();
      expect(getFixedPageBannerTitleKey('my-accountant')).toBeUndefined();
      expect(getFixedPageBannerTitleKey('')).toBeUndefined();
    });
  });

  describe('getTagName', () => {
    it('should return the tag name of a tag page slug', () => {
      expect(getTagName('glas_12')).toBe('glas');
      expect(getTagName('glas')).toBe('glas');
    });
  });

  describe('getCategoryKicker', () => {
    const path = [{ name: 'Tee & Kaffee' }, { name: 'Teekannen' }, { name: 'mit Glasfilter' }, { name: 'kleiner 1 L' }];

    it('should return the categories above without the main category', () => {
      expect(getCategoryKicker(path)).toEqual(['Teekannen', 'mit Glasfilter']);
      expect(getCategoryKicker(path.slice(0, 3))).toEqual(['Teekannen']);
    });

    it('should return nothing for a main category, its direct subcategories or a missing path', () => {
      expect(getCategoryKicker(path.slice(0, 1))).toEqual([]);
      expect(getCategoryKicker(path.slice(0, 2))).toEqual([]);
      expect(getCategoryKicker([])).toEqual([]);
      expect(getCategoryKicker(undefined)).toEqual([]);
    });
  });
});
