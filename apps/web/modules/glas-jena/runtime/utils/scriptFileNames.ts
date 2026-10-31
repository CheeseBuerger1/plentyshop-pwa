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
