import { NOINDEX_ROBOTS, getPageRobots } from '../noindexPages';

describe('noindexPages', () => {
  it('should keep the function pages out of search engines, in every language', () => {
    for (const name of [
      'cart',
      'cart___de',
      'guest-login___en',
      'reset-password',
      'newsletter-unsubscribe___de',
      'readonly-checkout',
    ]) {
      expect(getPageRobots(name)).toBe(NOINDEX_ROBOTS);
    }
  });

  it("should leave the shop's robots on all other pages", () => {
    for (const name of ['index___de', 'contact', 'search___en', 'login', 'slug___de', 'cart-items', undefined, null]) {
      expect(getPageRobots(name)).toBeUndefined();
    }
  });
});
