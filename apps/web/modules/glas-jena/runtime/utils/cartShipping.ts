import type { ActiveShippingCountry, Cart, CartItem, ShippingMethod } from '@plentymarkets/shop-api';
import type { FlagStorage, ShippingMethodLogo } from './types';

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
 * shop's host – except with `keepDomain` (the middleware's `skipModifyDomain`: on a deployed shop, i.e. with
 * `API_URL`, where the session is shared with the LTS shop). PlentyONE may give the session a new id, and the cart
 * moves there.
 */
export const toBrowserSetCookies = (setCookies: string[], keepDomain = false) =>
  setCookies
    .filter((setCookie) => !BLOCKED_SET_COOKIES.some((blocked) => setCookie.includes(blocked)))
    .map((setCookie) => (keepDomain ? setCookie : setCookie.replace(/;\s*domain=[^;]+/i, '')));

/**
 * The user agent of the middleware's calls: PlentyONE ties the session to it, and a call with another one gets a new
 * session id, which loses the country again. The middleware passes the browser's user agent on (shop-api 0.188, before
 * only with the feature flag `shopMigrateLtsSession`); without one its HTTP client axios sends its default
 * (`axios/<version>`).
 */
export const getMiddlewareUserAgent = (browserUserAgent: string | undefined, axiosVersion: string) =>
  browserUserAgent || `axios/${axiosVersion}`;

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

/*
 * The cheapest shipping method chosen beforehand (wish of the shop owner, 2026-10-23). PlentyONE chooses the shipping
 * profile of the highest priority ("Warenpost International") only for a new cart; when the country changes later (the
 * language switch to English, the country of the cart, an address abroad in the checkout) it keeps the one of before
 * as long as the new country has it, e.g. DHL from Germany, where it is the only one (tested on 2026-10-23). So the
 * module chooses the cheapest method whenever the methods on offer change (other country or other methods); a method
 * the customer chose stays until then, also after a reload: the methods last seen are kept in the sessionStorage.
 */

/** Key of the sessionStorage with the shipping methods last seen (getShippingChoiceKey). */
export const SHIPPING_CHOICE_STORAGE_KEY = 'gj-shipping-methods';

/** What the shipping methods on offer are: the country and the ids of the methods, e.g. `12:25,26`. */
export const getShippingChoiceKey = (
  countryId: number | null | undefined,
  methods: Pick<ShippingMethod, 'parcelServicePresetId'>[],
) =>
  `${countryId ?? ''}:${methods
    .map((method) => method.parcelServicePresetId)
    .sort((first, second) => first - second)
    .join(',')}`;

/**
 * The id of the cheapest shipping method, the first of them if several cost the same (PlentyONE lists them by their
 * priority); `null` without a method with costs.
 */
export const getCheapestShippingMethodId = (
  methods: Pick<ShippingMethod, 'parcelServicePresetId' | 'shippingAmount'>[],
) => {
  let cheapest: Pick<ShippingMethod, 'parcelServicePresetId' | 'shippingAmount'> | null = null;
  for (const method of methods) {
    const amount = Number(method.shippingAmount);
    if (Number.isFinite(amount) && (cheapest === null || amount < Number(cheapest.shippingAmount))) {
      cheapest = method;
    }
  }
  return cheapest === null ? null : String(cheapest.parcelServicePresetId);
};

/**
 * The shipping method to choose instead of the cart's (`selectedId`): the cheapest, if the methods on offer (`key`,
 * getShippingChoiceKey) are not the ones last seen (`lastKey`) and there is a choice at all; otherwise `null`.
 */
export const getShippingPreselection = (
  key: string,
  lastKey: string | null,
  methods: Pick<ShippingMethod, 'parcelServicePresetId' | 'shippingAmount'>[],
  selectedId: string,
) => {
  if (key === lastKey || methods.length < 2) {
    return null;
  }
  const cheapestId = getCheapestShippingMethodId(methods);
  return cheapestId === selectedId ? null : cheapestId;
};

/** The shipping methods last seen, or `null` (none yet, or the storage is blocked). */
export const readShippingChoiceKey = (storage: FlagStorage | undefined) => {
  try {
    return storage?.getItem(SHIPPING_CHOICE_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
};

export const writeShippingChoiceKey = (storage: FlagStorage | undefined, key: string) => {
  try {
    storage?.setItem(SHIPPING_CHOICE_STORAGE_KEY, key);
  } catch {
    /* storage blocked: the cheapest method is chosen again after a reload */
  }
};

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

/**
 * Whether the country of delivery of the cart is fixed by an address, like in the LTS shop (Ceres,
 * ShippingCountrySelect: disabled as soon as the cart has a delivery or invoice address). PlentyONE then calculates
 * the shipping costs and taxes for the country of that address; a country chosen in the cart only changed the shown
 * country, so the cart said "Österreich" with the German shipping costs and VAT (found by the shop owner,
 * 2026-10-20). The country then changes with the address in the checkout.
 */
export const isShippingCountryLocked = (
  cart: Pick<Cart, 'customerShippingAddressId' | 'customerInvoiceAddressId'> | null | undefined,
) => Boolean(cart?.customerShippingAddressId || cart?.customerInvoiceAddressId);
