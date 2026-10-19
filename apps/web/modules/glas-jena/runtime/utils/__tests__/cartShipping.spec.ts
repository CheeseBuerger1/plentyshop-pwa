import type { ActiveShippingCountry } from '@plentymarkets/shop-api';
import {
  SHIPPING_COUNTRY_ROUTE,
  SHIPPING_COUNTRY_URL,
  getCartContentKey,
  getMiddlewareUserAgent,
  parseLocale,
  parseShippingCountryId,
  sortShippingCountries,
  toBrowserSetCookies,
  toPlentySessionCookie,
} from '../cartShipping';

const country = (id: number, currLangName: string) => ({ id, currLangName }) as ActiveShippingCountry;

describe('cartShipping', () => {
  it('should call the route with the trailing slash of the shop, which the hosting would redirect otherwise', () => {
    expect(SHIPPING_COUNTRY_URL).toBe(`${SHIPPING_COUNTRY_ROUTE}/`);
  });

  it('should pass the session cookie on as plentyID, like the middleware', () => {
    expect(toPlentySessionCookie('consent=1; plentyID=abc')).toBe('consent=1; plentyID=abc');
    expect(toPlentySessionCookie('consent=1; pwa-session-id=abc')).toBe('consent=1; plentyID=abc');
  });

  it('should keep an existing plentyID and drop pwa-session-id then', () => {
    expect(toPlentySessionCookie('pwa-session-id=old; plentyID=abc')).toBe('plentyID=abc');
  });

  it('should return nothing without a session cookie', () => {
    expect(toPlentySessionCookie('consent=1')).toBe('');
    expect(toPlentySessionCookie(undefined)).toBe('');
  });

  it('should give the browser the new cookies without domain and without XSRF-TOKEN', () => {
    const setCookies = [
      'plentyID=new; expires=Mon, 19 Oct 2026 10:00:00 GMT; Max-Age=7200; path=/; domain=www.glas-jena.de; secure; httponly',
      'XSRF-TOKEN=token; path=/; domain=www.glas-jena.de',
    ];

    expect(toBrowserSetCookies(setCookies)).toEqual([
      'plentyID=new; expires=Mon, 19 Oct 2026 10:00:00 GMT; Max-Age=7200; path=/; secure; httponly',
    ]);
    expect(toBrowserSetCookies(setCookies, true)).toEqual([setCookies[0]]);
  });

  it("should use the middleware's user agent: axios, or the browser's with the feature flag", () => {
    expect(getMiddlewareUserAgent(false, 'Mozilla/5.0', '1.20.0')).toBe('axios/1.20.0');
    expect(getMiddlewareUserAgent(true, 'Mozilla/5.0', '1.20.0')).toBe('Mozilla/5.0');
    expect(getMiddlewareUserAgent(true, undefined, '1.20.0')).toBe('axios/1.20.0');
  });

  it('should pass the language on only as two letters, like the middleware', () => {
    expect(parseLocale('en')).toBe('en');
    for (const invalid of ['de-DE', 'EN', '', 1, undefined]) {
      expect(parseLocale(invalid)).toBeNull();
    }
  });

  it('should accept only positive whole numbers as country id', () => {
    expect(parseShippingCountryId(2)).toBe(2);
    expect(parseShippingCountryId('12')).toBe(12);
    for (const invalid of [0, -1, 1.5, 'de', null, undefined]) {
      expect(parseShippingCountryId(invalid)).toBeNull();
    }
  });

  it('should describe the cart content by its articles and quantities, in any order', () => {
    const items = [
      { id: 15, quantity: 3 },
      { id: 12, quantity: 1 },
    ];

    expect(getCartContentKey(items)).toBe('12:1|15:3');
    expect(getCartContentKey([...items].reverse())).toBe('12:1|15:3');
    expect(getCartContentKey([{ id: 12, quantity: 1 }])).not.toBe(getCartContentKey(items));
    expect(getCartContentKey([{ id: 12, quantity: 2 }])).not.toBe(getCartContentKey([{ id: 12, quantity: 1 }]));
    expect(getCartContentKey(undefined)).toBe('');
  });

  it('should sort the countries by their name in the shop language', () => {
    const countries = [country(2, 'Österreich'), country(1, 'Deutschland'), country(52, 'Albanien')];

    expect(sortShippingCountries(countries, 'de').map(({ id }) => id)).toEqual([52, 1, 2]);
    expect(countries.map(({ id }) => id)).toEqual([2, 1, 52]);
  });
});
