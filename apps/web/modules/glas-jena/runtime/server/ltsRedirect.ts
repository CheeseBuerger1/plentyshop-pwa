import { defineEventHandler, getQuery, getRequestURL, sendRedirect } from 'h3';
import { withQuery, type QueryObject } from 'ufo';
import { useRuntimeConfig } from '#imports';
import { findLtsRedirect, getLtsRedirectPath, LTS_REDIRECT_STATUS } from '../utils/ltsRedirect';

/**
 * Old addresses of the LTS shop (see `findLtsRedirect`) redirected by the server before the page is built. The route
 * middleware (middleware/ltsRedirect.ts) did it only after the shop had loaded its settings, categories and session
 * from PlentyONE: 0.6–1.1 s per redirect without cache, which the Search Console counted into the LCP of the old
 * addresses (2.7 s on phones, 2026-10-31). The route middleware stays for links within the shop.
 *
 * The trailing slash follows the old address (`/sbc5/gtc/` → `/terms-and-conditions/`); the shop's setting is only
 * known once the page is built, and the hosting adds the slash to addresses without one before they get here.
 */
export default defineEventHandler((event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') {
    return;
  }

  const { pathname } = getRequestURL(event);
  const redirect = findLtsRedirect(pathname, getQuery(event));
  if (!redirect) {
    return;
  }

  const languages = String(useRuntimeConfig().public.activeLanguages ?? '').split(',');
  if (redirect.locale && !languages.includes(redirect.locale)) {
    return;
  }

  const path = getLtsRedirectPath(redirect);
  const target = pathname.endsWith('/') && !path.endsWith('/') ? `${path}/` : path;
  return sendRedirect(event, withQuery(target, redirect.query as QueryObject), LTS_REDIRECT_STATUS);
});
