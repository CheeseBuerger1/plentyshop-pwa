import { ACCOUNT_TITLE_KEY, getFixedPageBannerTitleKey, getTagName } from '../pageBanner';

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
});
