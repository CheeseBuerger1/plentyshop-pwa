import type { ActiveShippingCountry, CartItem, ShippingMethod } from '@plentymarkets/shop-api';
import type { ShippingMethodLogo } from './types';

/*
 * Country of delivery in the cart, like the LTS shop (wish of the shop owner, 2026-10-18). The PWA sets the country
 * only through the address in the checkout; before that the cart is calculated for the default country of the
 * language (Germany, Great Britain for English). The Storefront REST API of PlentyONE has no call to change it, but
 * the shop's IO plugin has (the call the LTS cart uses): it changes the country of the same session, and the cart
 * then has the shipping costs of that country. The browser cannot call it itself (the session cookie belongs to the
 * middleware's requests), so the module's server route does it, see server/shippingCountry.post.ts. It has to call
 * exactly like the middleware (tested on 2026-10-18): without the security token PlentyONE gives the session an empty
 * cart, with another user agent a new session id (the country is lost), without the language (`locale`) it switches
 * the session to the default language and the next call back, which resets the country; and the new cookies have to
 * reach the browser.
 * The language switch sets the default country of the language again (PlentyONE).
 */

/** Route of the module's server handler that changes the country of delivery of the visitor's session. */
export const SHIPPING_COUNTRY_ROUTE = '/api/glas-jena/shipping-country';

/**
 * Address the cart calls the route with: with the trailing slash of the shop's URL setting. The hosting redirects
 * addresses without it (tested on 2026-10-19), which turns the POST into a GET that ends in a 404.
 */
export const SHIPPING_COUNTRY_URL = `${SHIPPING_COUNTRY_ROUTE}/`;

/** Call of the IO plugin that sets the country of delivery of the session (body `{ shippingCountryId }`). */
export const IO_SHIPPING_COUNTRY_PATH = '/rest/io/shipping/country';

/** Session cookie of PlentyONE, and the name under which the middleware may keep it in the browser. */
export const PLENTY_SESSION_COOKIE = 'plentyID';
export const PWA_SESSION_COOKIE = 'pwa-session-id';

/**
 * The browser's cookies as PlentyONE expects them: like the middleware (`handleSessionCookie` of the shop API), the
 * session cookie `pwa-session-id` becomes `plentyID`, unless there is a `plentyID` already, which then wins.
 * Returns an empty string if there is no session cookie at all, i.e. no session that could be changed.
 */
export const toPlentySessionCookie = (cookieHeader: string | undefined) => {
  const cookies = (cookieHeader ?? '')
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.length > 0);
  const nameOf = (cookie: string) => cookie.split('=')[0];
  const hasPlentyId = cookies.some((cookie) => nameOf(cookie) === PLENTY_SESSION_COOKIE);
  const renamed = cookies
    .filter((cookie) => !(hasPlentyId && nameOf(cookie) === PWA_SESSION_COOKIE))
    .map((cookie) =>
      nameOf(cookie) === PWA_SESSION_COOKIE
        ? `${PLENTY_SESSION_COOKIE}${cookie.slice(PWA_SESSION_COOKIE.length)}`
        : cookie,
    );
  return renamed.some((cookie) => nameOf(cookie) === PLENTY_SESSION_COOKIE) ? renamed.join('; ') : '';
};

/** Cookies of PlentyONE that the middleware does not pass on to the browser. */
export const BLOCKED_SET_COOKIES = ['XSRF-TOKEN'];

/**
 * The cookies that PlentyONE sets in its answer, as the browser gets them, like the middleware does (`handleSetCookie`
 * of the shop API): without `XSRF-TOKEN`, and without their `domain` (PlentyONE's own host), so they belong to the
 * shop's host – except with `keepDomain` (the middleware's `x-skip-modify-domain`: on a deployed shop with the feature
 * flag `shopMigrateLtsSession`, where the session is shared with the LTS shop). PlentyONE may give the session a new
 * id, and the cart moves there.
 */
export const toBrowserSetCookies = (setCookies: string[], keepDomain = false) =>
  setCookies
    .filter((setCookie) => !BLOCKED_SET_COOKIES.some((blocked) => setCookie.includes(blocked)))
    .map((setCookie) => (keepDomain ? setCookie : setCookie.replace(/;\s*domain=[^;]+/i, '')));

/** Feature flag of the shop under which the middleware passes on the browser's user agent (`x-forward-user-agent`). */
export const MIGRATE_LTS_SESSION_FLAG = 'shopMigrateLtsSession';

/**
 * The user agent of the middleware's calls: PlentyONE ties the session to it, and a call with another one gets a new
 * session id, which loses the country again. The middleware sends the browser's user agent if the shop's feature
 * flag `shopMigrateLtsSession` is on, otherwise the default of its HTTP client axios (`axios/<version>`).
 */
export const getMiddlewareUserAgent = (
  forwardUserAgent: boolean,
  browserUserAgent: string | undefined,
  axiosVersion: string,
) => (forwardUserAgent && browserUserAgent ? browserUserAgent : `axios/${axiosVersion}`);

/**
 * The shop language of a request body for the `locale` header, like the middleware sends it with every call (two
 * letters, see `getI18nLocale` of shop-core), or `null`.
 */
export const parseLocale = (value: unknown) => (typeof value === 'string' && /^[a-z]{2}$/.test(value) ? value : null);

/** The country id of a request body, or `null` if it is not a positive whole number. */
export const parseShippingCountryId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/** The countries of delivery by their name in the shop language, like the selection of the LTS cart. */
export const sortShippingCountries = (countries: ActiveShippingCountry[], locale: string) =>
  [...countries].sort((first, second) => first.currLangName.localeCompare(second.currLangName, locale));

/**
 * What the shipping methods depend on in the cart: its articles and their quantities (e.g. `12:1|15:3`, by cart item
 * id). Changes when articles are added, removed or their quantity changes, not when only the country changes.
 */
export const getCartContentKey = (items: Pick<CartItem, 'id' | 'quantity'>[] | null | undefined) =>
  (items ?? [])
    .map(({ id, quantity }) => `${id}:${quantity}`)
    .sort()
    .join('|');

/**
 * Logo of a shipping method, like the LTS shop shows it next to the name (wish of the shop owner, 2026-10-20).
 *
 * `ownLogos`: the shop's own logos by shipping profile (see SHIPPING_METHOD_LOGOS), the ones of the LTS plugin "Ceres
 * Beautifier Shipping Icons" (`own: true`). Otherwise the icon PlentyONE gives the shipping profile, an address of an
 * image (e.g. the DHL logo of the DHL Shipping plugin, which PlentyONE gives "Warenpost International" of the Deutsche
 * Post as well). `null` without either. `label`: the parcel service the logo shows, its alternative text.
 */
export const getShippingMethodLogo = (
  method: Pick<ShippingMethod, 'parcelServicePresetId' | 'parcelServiceName' | 'icon'>,
  ownLogos: Record<number, ShippingMethodLogo>,
) => {
  const own = ownLogos[method.parcelServicePresetId];
  if (own) {
    return { ...own, own: true };
  }
  return typeof method.icon === 'string' && /^https?:\/\//.test(method.icon)
    ? { src: method.icon, label: method.parcelServiceName, own: false }
    : null;
};

/**
 * The countries of delivery of the whole shop in the order of the cart's selection (sortShippingCountries), or `null`
 * if they already are in it. PlentyONE sorts them by bytes ("Österreich" and "Ägypten" last, "Dänemark" after
 * "Dominikanische Republik"); the checkout, the registration and the account showed that order, the cart its own
 * (found by the shop owner, 2026-10-20). See plugins/shippingCountriesOrder.ts.
 */
export const resortShippingCountries = (countries: ActiveShippingCountry[], locale: string) => {
  const sorted = sortShippingCountries(countries, locale);
  return sorted.every((country, index) => country === countries[index]) ? null : sorted;
};
