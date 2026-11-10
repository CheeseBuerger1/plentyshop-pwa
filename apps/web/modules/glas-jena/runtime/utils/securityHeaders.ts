/** Header that tells browsers to open the shop only over https from now on (HTTP Strict Transport Security). */
export const HSTS_HEADER = 'Strict-Transport-Security';

/**
 * One year, like the original's (unused) nuxt-security setting in app/configuration/security.config.ts. Only for
 * www.glas-jena.de and its own subdomains; no `preload`, which would also need the header on glas-jena.de (answered by
 * the hosting with a redirect) and can hardly be undone.
 */
export const HSTS_VALUE = 'max-age=31536000; includeSubDomains';
