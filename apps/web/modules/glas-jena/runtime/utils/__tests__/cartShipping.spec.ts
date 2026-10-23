import type { ActiveShippingCountry } from '@plentymarkets/shop-api';
import {
  SHIPPING_CHOICE_STORAGE_KEY,
  SHIPPING_COUNTRY_ROUTE,
  SHIPPING_COUNTRY_URL,
  getCartContentKey,
  getCheapestShippingMethodId,
  getMiddlewareUserAgent,
  getShippingChoiceKey,
  getShippingMethodLogo,
  getShippingPreselection,
  isShippingCountryLocked,
  parseLocale,
  parseShippingCountryId,
  readShippingChoiceKey,
  resortShippingCountries,
  sortShippingCountries,
  toBrowserSetCookies,
  toPlentySessionCookie,
  writeShippingChoiceKey,
} from '../cartShipping';

const country = (id: number, currLangName: string) => ({ id, currLangName }) as ActiveShippingCountry;
const offer = (parcelServicePresetId: number, shippingAmount: number) => ({ parcelServicePresetId, shippingAmount });

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

  it("should use the middleware's user agent: the browser's, or axios' default without one", () => {
    expect(getMiddlewareUserAgent('Mozilla/5.0', '1.20.0')).toBe('Mozilla/5.0');
    expect(getMiddlewareUserAgent(undefined, '1.20.0')).toBe('axios/1.20.0');
    expect(getMiddlewareUserAgent('', '1.20.0')).toBe('axios/1.20.0');
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

  it('should give the shop its own logo of a shipping profile first', () => {
    const ownLogos = { 26: { src: '/_nuxt/warenpost.svg', label: 'Deutsche Post' } };
    const method = { parcelServicePresetId: 26, parcelServiceName: 'POST', icon: 'https://cdn.example/dhl.png' };

    expect(getShippingMethodLogo(method, ownLogos)).toEqual({
      src: '/_nuxt/warenpost.svg',
      label: 'Deutsche Post',
      own: true,
    });
  });

  it('should give the icon of PlentyONE otherwise, only as the address of an image', () => {
    const logo = 'https://cdn.example/webspace/DHLShipping/logo.png';
    const method = (icon: unknown) => ({ parcelServicePresetId: 25, parcelServiceName: 'DHL', icon });

    expect(getShippingMethodLogo(method(logo), {})).toEqual({ src: logo, label: 'DHL', own: false });
    expect(getShippingMethodLogo(method(''), {})).toBeNull();
    expect(getShippingMethodLogo(method(null), {})).toBeNull();
    expect(getShippingMethodLogo(method('javascript:alert(1)'), {})).toBeNull();
  });

  it('should sort the countries of the shop like the cart, with umlauts in their place', () => {
    const countries = [country(1, 'Deutschland'), country(115, 'Dominikanische Republik'), country(7, 'Dänemark')];
    const resorted = resortShippingCountries([...countries, country(2, 'Österreich'), country(4, 'Schweiz')], 'de');

    expect(resorted?.map(({ currLangName }) => currLangName)).toEqual([
      'Dänemark',
      'Deutschland',
      'Dominikanische Republik',
      'Österreich',
      'Schweiz',
    ]);
  });

  it('should leave countries alone that are already in order', () => {
    expect(resortShippingCountries([country(7, 'Dänemark'), country(1, 'Deutschland')], 'de')).toBeNull();
  });

  it('should fix the country of delivery as soon as the cart has a delivery or invoice address, like Ceres', () => {
    expect(isShippingCountryLocked({ customerShippingAddressId: null, customerInvoiceAddressId: null })).toBe(false);
    expect(isShippingCountryLocked({ customerShippingAddressId: 0, customerInvoiceAddressId: 0 })).toBe(false);
    expect(isShippingCountryLocked(undefined)).toBe(false);
    expect(isShippingCountryLocked({ customerShippingAddressId: 72282, customerInvoiceAddressId: null })).toBe(true);
    expect(isShippingCountryLocked({ customerShippingAddressId: null, customerInvoiceAddressId: 15 })).toBe(true);
  });

  it('should tell the methods on offer by the country and the ids, in any order', () => {
    expect(getShippingChoiceKey(12, [offer(26, 10.8), offer(25, 28.1)])).toBe('12:25,26');
    expect(getShippingChoiceKey(12, [offer(25, 28.1), offer(26, 10.8)])).toBe('12:25,26');
    expect(getShippingChoiceKey(1, [offer(25, 7.8)])).toBe('1:25');
    expect(getShippingChoiceKey(null, [])).toBe(':');
  });

  it('should find the cheapest method, the first by priority if several cost the same', () => {
    expect(getCheapestShippingMethodId([offer(25, 28.1), offer(26, 10.8)])).toBe('26');
    expect(getCheapestShippingMethodId([offer(26, 10.8), offer(27, 10.8)])).toBe('26');
    /* Free shipping is the cheapest; a method without costs is left out */
    expect(getCheapestShippingMethodId([offer(25, 7.8), offer(30, 0)])).toBe('30');
    expect(getCheapestShippingMethodId([offer(25, Number.NaN), offer(26, 10.8)])).toBe('26');
    expect(getCheapestShippingMethodId([])).toBeNull();
  });

  it('should choose the cheapest method when the methods on offer change, e.g. from Germany to Great Britain', () => {
    const methods = [offer(26, 10.8), offer(25, 28.1)];

    expect(getShippingPreselection('12:25,26', '1:25', methods, '25')).toBe('26');
    /* A new cart in the English shop: PlentyONE already chose it */
    expect(getShippingPreselection('12:25,26', null, methods, '26')).toBeNull();
  });

  it("should keep the customer's choice while the methods on offer stay the same", () => {
    expect(getShippingPreselection('12:25,26', '12:25,26', [offer(26, 10.8), offer(25, 28.1)], '25')).toBeNull();
  });

  it('should choose nothing without a choice of methods', () => {
    expect(getShippingPreselection('1:25', '12:25,26', [offer(25, 7.8)], '25')).toBeNull();
  });

  it('should keep the methods last seen and do without a blocked storage', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: values.set.bind(values) };
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };

    expect(readShippingChoiceKey(storage)).toBeNull();
    writeShippingChoiceKey(storage, '12:25,26');
    expect(values.get(SHIPPING_CHOICE_STORAGE_KEY)).toBe('12:25,26');
    expect(readShippingChoiceKey(storage)).toBe('12:25,26');
    expect(() => writeShippingChoiceKey(blocked, '1:25')).not.toThrow();
    expect(readShippingChoiceKey(blocked)).toBeNull();
    expect(readShippingChoiceKey(undefined)).toBeNull();
  });
});
