import type { ManifestEntry, ManifestTransform, RuntimeCaching } from 'workbox-build';

/**
 * Files the service worker stores when it is installed (precache): styles, fonts, the app icons and small images, about
 * 1.3 MB. The shop's own patterns (nuxt.config.ts) took every file of the build, 669 files and 20 MB, downloaded by
 * every new visitor and again after every deployment (2026-10-31): 13.4 MB the warranty notice in all 24 EU languages
 * (`guarantee_notice_*.svg`, about 0.6 MB each, the shop shows one), 5.5 MB all scripts with the editor. Those are now
 * loaded when a page needs them; the browser's own cache and `SCRIPT_RUNTIME_CACHING` keep them.
 */
export const PRECACHE_GLOB_PATTERNS = ['**/*.{css,ico,png,webp,woff,woff2,ttf,otf}', '_nuxt-plenty/icons/*'];

/**
 * A precache address from the root of the shop (`/_nuxt-plenty/…` instead of `_nuxt-plenty/…`). Workbox resolves
 * relative ones against the worker's address, which is a folder of its own (`/sw-<mark>.mjs/`, see scriptFileNames.ts).
 */
const toRootUrl = (url: string) => (/^(\/|[a-z]+:)/i.test(url) ? url : `/${url}`);

/** The files of the build in the precache with addresses from the root (`toRootUrl`). */
export const toRootPrecacheUrls: ManifestTransform = (entries) => ({
  manifest: entries.map((entry) => ({ ...entry, url: toRootUrl(entry.url) })),
  warnings: [],
});

/**
 * The extra precache entries with addresses from the root (`toRootUrl`): Workbox adds them after the manifest
 * transforms, and vite-plugin-pwa puts the web manifest there (`manifest.webmanifest`, 2026-10-31: the worker did not
 * install because `/sw-<mark>.mjs/manifest.webmanifest` was not found).
 */
export const toRootManifestEntries = (entries: Array<string | ManifestEntry>) =>
  entries.map((entry) => (typeof entry === 'string' ? toRootUrl(entry) : { ...entry, url: toRootUrl(entry.url) }));

/** Name of the service worker's cache for the scripts the visitor has loaded. */
export const SCRIPT_CACHE_NAME = 'glas-jena-scripts';

/** Scripts of the build: unique names per build (see scriptFileNames.ts), so a stored one never changes. */
export const SCRIPT_URL_PATTERN = /\/_nuxt\/[^/]+\.js$/;

/**
 * The scripts a visitor has loaded, from the service worker's cache (cache first): later pages and the offline page
 * start without the network, like with the precache before, but only for what was used. Old builds drop out by count
 * and age.
 */
export const SCRIPT_RUNTIME_CACHING: RuntimeCaching = {
  urlPattern: SCRIPT_URL_PATTERN,
  handler: 'CacheFirst',
  options: {
    cacheName: SCRIPT_CACHE_NAME,
    expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
    cacheableResponse: { statuses: [0, 200] },
  },
};
