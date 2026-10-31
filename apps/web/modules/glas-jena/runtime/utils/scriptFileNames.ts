/** Number of characters of the build id that mark the script files of a build */
export const BUILD_MARK_LENGTH = 8;

/**
 * Short mark of a build for the names of its script files: the first characters of Nuxt's build id (a random UUID per
 * production build), letters and digits only.
 */
export const getBuildMark = (buildId: string) =>
  buildId
    .replace(/[^\da-z]/gi, '')
    .slice(0, BUILD_MARK_LENGTH)
    .toLowerCase();

/**
 * Names of the browser's script files (chunks and entry): Nuxt's `<buildAssetsDir>[hash].js` with the build mark added.
 *
 * Some chunks keep their name from one build to the next although their content changes (the name of the CSS file
 * they load is written into them after the hash is computed). The CDN in front of the shop (CloudFront) keeps files
 * of `/_nuxt/` for a year, so it went on serving the old content of such a chunk, which loaded an old CSS file after
 * the new one (2026-10-26). With the mark, every build has new names.
 */
export const getScriptFileNames = (buildAssetsDir: string, buildId: string) =>
  `${buildAssetsDir.replace(/^\/+/, '').replace(/\/*$/, '/')}[hash]-${getBuildMark(buildId)}.js`;

/**
 * Name of the service worker with the build mark (`sw-<mark>.mjs` instead of `sw.js`). The CDN keeps `/sw.js` for a
 * year like the scripts: after the deployment of a smaller precache the shop pages had the new build for hours, but
 * CloudFront still served the old `sw.js` (2026-10-31), so the browsers never saw a new worker. With a new name per
 * build the pages register the new worker, the browser replaces the old one (same scope).
 *
 * `.mjs`, not `.js`: the hosting answers `.js` files in the root folder only from the files PlentyONE uploads with a
 * deployment, and it left out `sw-<mark>.js` (nginx 404, 2026-10-31). Paths ending in `.mjs` reach the shop's server,
 * which serves the worker from its public folder as JavaScript. The extension does not matter to the browser (a
 * classic worker, as before).
 */
export const getServiceWorkerFileName = (buildId: string) => `sw-${getBuildMark(buildId)}.mjs`;

/**
 * Name of the file Workbox writes for the service worker: always `<name>.js` whatever the extension of its name (its
 * bundler's `[name].js`), so `sw-<mark>.mjs` comes out as `sw-<mark>.js`. The module renames it, see index.ts.
 */
export const getWrittenServiceWorkerFileName = (fileName: string) => fileName.replace(/\.mjs$/, '.js');

/**
 * Address the pages register the service worker under: its name with a slash at the end. The hosting passes only such
 * paths unchanged to the shop's server, which serves a public file also with the slash (2026-10-31: `/sw-<mark>.mjs`
 * gave the shop's 404 page, `/sw-<mark>.mjs/` the worker). The worker is then in the folder `/sw-<mark>.mjs/`, so it
 * needs the header `Service-Worker-Allowed: /` for the whole shop, its Workbox runtime inline and precache addresses
 * from the root (see index.ts and servicePrecache.ts).
 */
export const getServiceWorkerUrl = (fileName: string) => `/${fileName}/`;

/**
 * The registration code of vite-plugin-pwa with the worker's address of `getServiceWorkerUrl`: it registers
 * `"<base><filename>"` (`new Workbox("/sw-<mark>.mjs", …)`), with no option for another address.
 */
export const replaceServiceWorkerUrl = (code: string, fileName: string) =>
  code.replaceAll(`"/${fileName}"`, `"${getServiceWorkerUrl(fileName)}"`);
