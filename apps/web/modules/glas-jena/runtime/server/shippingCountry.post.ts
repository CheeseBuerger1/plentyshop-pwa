import axios from 'axios';
import { appendResponseHeader, createError, defineEventHandler, getRequestHeader, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import {
  IO_SHIPPING_COUNTRY_PATH,
  getMiddlewareUserAgent,
  parseLocale,
  parseShippingCountryId,
  toBrowserSetCookies,
  toPlentySessionCookie,
} from '../utils/cartShipping';

/**
 * Changes the country of delivery of the visitor's session (cart page, see utils/cartShipping.ts): passes the session
 * cookie, the security token, the user agent and the language on to the call of the IO plugin, and its new cookies
 * back to the browser, as the middleware does for its own calls.
 * Body: `{ shippingCountryId, locale }`.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ shippingCountryId?: unknown; locale?: unknown }>(event);
  const shippingCountryId = parseShippingCountryId(body?.shippingCountryId);
  if (!shippingCountryId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid shippingCountryId' });
  }
  const locale = parseLocale(body?.locale);

  const cookie = toPlentySessionCookie(getRequestHeader(event, 'cookie'));
  if (!cookie) {
    throw createError({ statusCode: 400, statusMessage: 'No session' });
  }

  /*
   * The security token of the middleware (same environment variable, read at runtime, never part of the build): without
   * it PlentyONE takes the call for one of the LTS shop and gives the session an empty cart instead of changing it.
   */
  const securityToken = process.env.API_SECURITY_TOKEN;
  if (!securityToken) {
    throw createError({ statusCode: 500, statusMessage: 'API_SECURITY_TOKEN is not set' });
  }

  const apiEndpoint = String(useRuntimeConfig().public.apiEndpoint ?? '').replace(/\/+$/, '');
  try {
    const response = await $fetch.raw(`${apiEndpoint}${IO_SHIPPING_COUNTRY_PATH}`, {
      method: 'POST',
      body: { shippingCountryId },
      headers: {
        cookie,
        'x-security-token': securityToken,
        'user-agent': getMiddlewareUserAgent(getRequestHeader(event, 'user-agent'), axios.VERSION),
        /* Without the language PlentyONE switches the session to the default one, which resets the country again */
        ...(locale && { locale }),
      },
    });
    /*
     * PlentyONE may give the session a new id and move the cart there: the browser has to get the new cookie. The
     * domain stays like the middleware keeps it: on a deployed shop (API_URL is set there only).
     */
    const keepDomain = Boolean(process.env.API_URL);
    for (const setCookie of toBrowserSetCookies(response.headers.getSetCookie(), keepDomain)) {
      appendResponseHeader(event, 'set-cookie', setCookie);
    }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Shipping country not changed' });
  }

  return { shippingCountryId };
});
