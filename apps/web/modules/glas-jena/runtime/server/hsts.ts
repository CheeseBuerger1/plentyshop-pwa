import { defineEventHandler, setResponseHeader } from 'h3';
import { HSTS_HEADER, HSTS_VALUE } from '../utils/securityHeaders';

/**
 * HSTS on every answer of the shop's server. The original sets it via nuxt-security, which the shop does not load, so
 * no answer had it (2026-11-10). Without it CloudFront hands out a cached page over http without redirecting to https
 * (cache key without protocol, e.g. `http://www.glas-jena.de/`); with it a browser that has seen the shop over https
 * once asks for https itself. Browsers ignore the header on answers over http.
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, HSTS_HEADER, HSTS_VALUE);
});
