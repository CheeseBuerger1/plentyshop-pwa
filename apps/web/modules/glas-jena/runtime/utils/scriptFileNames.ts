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
