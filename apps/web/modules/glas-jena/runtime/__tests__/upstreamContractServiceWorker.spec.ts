/**
 * Upstream contract of the service worker: the module gives every precached file a revision (hook
 * `pwa:beforeBuildServiceWorker` in index.ts, PRECACHE_WITHOUT_REVISION), and the script files get new names with every
 * build for the CDN (utils/scriptFileNames.ts). The precache holds only styles, fonts and icons, scripts are stored
 * once used (utils/servicePrecache.ts).
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { minimatch } from 'minimatch';
import { PRECACHE_WITHOUT_REVISION } from '../../index';
import { PRECACHE_GLOB_PATTERNS, SCRIPT_URL_PATTERN } from '../utils/servicePrecache';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readWeb = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const readPackage = (path: string) => readFileSync(join(process.cwd(), '../../node_modules', path), 'utf8');

describe('upstream contract of the glas-jena module: service worker', () => {
  it('should find the precache of the scripts and styles that the module gives revisions and makes smaller', () => {
    const config = readWeb('nuxt.config.ts');
    expect(config).toContain("registerType: 'prompt',");
    expect(config).toMatch(/globPatterns: \['\*\*\/\*\.\{js,json,css,/);
    /* The module puts its script cache in front of the shop's runtime caching (navigation, images) */
    expect(config).toContain('runtimeCaching: [');
    expect(config).toContain("fallbackURL: '/offline',");
  });

  it('should precache styles, fonts and icons but no scripts and no warranty notices (20 MB before)', () => {
    const precached = (file: string) => PRECACHE_GLOB_PATTERNS.some((pattern) => minimatch(file, pattern));

    for (const file of [
      '_nuxt/entry.BmUTSLgr.css',
      '_nuxt-plenty/fonts/x.woff2',
      '_nuxt-plenty/icons/icon-192x192.png',
    ]) {
      expect(precached(file)).toBe(true);
    }
    for (const file of [
      '_nuxt/7SPr6-en-8f57d717.js',
      '_nuxt/guarantee_notice_DE.C5KX7FAS.svg',
      '_nuxt/builds/x.json',
    ]) {
      expect(precached(file)).toBe(false);
    }
  });

  it('should store the scripts of the build once used, but not the styles', () => {
    expect(SCRIPT_URL_PATTERN.test('https://www.glas-jena.de/_nuxt/7SPr6-en-8f57d717.js')).toBe(true);
    expect(SCRIPT_URL_PATTERN.test('https://www.glas-jena.de/_nuxt/entry.BmUTSLgr.css')).toBe(false);
    expect(SCRIPT_URL_PATTERN.test('https://www.glas-jena.de/sw.js')).toBe(false);
  });

  it('should find the default of vite-plugin-pwa that stores the files of the assets folder without revision', () => {
    /* If this default goes, the module's setting is no longer needed */
    expect(readPackage('vite-plugin-pwa/dist/index.js')).toContain(
      'const dontCacheBustURLsMatching = new RegExp(`^${assetsDir.replace(/^\\.*\\//, "")}`);',
    );
  });

  it('should find the hook of @vite-pwa/nuxt before the service worker is built', () => {
    const nuxtPwa = readPackage('@vite-pwa/nuxt/dist/module.d.mts');
    expect(nuxtPwa).toContain("'pwa:beforeBuildServiceWorker': (options: ResolvedVitePWAOptions) => HookResult;");
  });

  it("should find Nuxt's script file names that the module marks with the build (utils/scriptFileNames.ts)", () => {
    /* Nuxt sets `<buildAssetsDir>[hash].js` for the client, but only where no other plugin or config has set names */
    const viteBuilder = readPackage('nuxt/node_modules/@nuxt/vite-builder/dist/index.mjs');
    expect(viteBuilder).toContain(
      'const fileNames = withoutLeadingSlash(join(nuxt.options.app.buildAssetsDir, "[hash].js"));',
    );
    expect(viteBuilder).toContain(
      'chunkFileNames: outputConfig?.chunkFileNames ?? (nuxt.options.dev ? void 0 : fileNames),',
    );
    expect(viteBuilder).toContain('output?.entryFileNames.includes("[hash]"));');
  });

  it('should let no file of the shop go without revision', () => {
    for (const url of ['_nuxt/7SPr6-en.js', '_nuxt/entry.BmUTSLgr.css', 'offline', '_nuxt-plenty/icons/icon.png']) {
      expect(PRECACHE_WITHOUT_REVISION.test(url)).toBe(false);
    }
  });

  it('should find the option dependencies of Nuxt modules that set the name of the service worker', () => {
    /* index.ts: `moduleDependencies` overrides `filename` of @vite-pwa/nuxt (config key `pwa`) before it starts */
    expect(readPackage('nuxt/node_modules/@nuxt/kit/dist/index.mjs')).toContain('getModuleDependencies');
    expect(JSON.parse(readPackage('@vite-pwa/nuxt/dist/module.json'))).toMatchObject({
      name: '@vite-pwa/nuxt',
      configKey: 'pwa',
    });
    /* The worker and its registration take `filename` from the options (vite-plugin-pwa) */
    expect(readPackage('vite-plugin-pwa/dist/index.js')).toContain('const sw = options.buildBase + options.filename;');
  });

  it("should find the shop's server serving the public files with the type of their extension (worker `.mjs`)", () => {
    /* The hosting passes `sw-<mark>.mjs` to Nitro, which serves it from the public folder as JavaScript */
    /* Workbox writes `<name>.js` (its bundler's default name), the module renames it in `nitro:build:public-assets`,
       which Nuxt calls before Nitro bundles the server with the list of public files */
    expect(readPackage('workbox-build/build/lib/bundle.js')).toContain("format: inlineWorkboxRuntime ? 'es' : 'amd',");
    expect(readPackage('workbox-build/build/lib/bundle.js')).not.toContain('entryFileNames');
    expect(readPackage('nuxt/node_modules/@nuxt/nitro-server/dist/index.mjs')).toContain(
      'nitro.hooks.hook("rollup:before", async (nitro) => {\n\t\tawait copyPublicAssets(nitro);\n\t\tawait nuxt.callHook("nitro:build:public-assets", nitro);',
    );
    const nitroRollup = readPackage('nitropack/dist/rollup/index.mjs');
    expect(nitroRollup).toContain('"#nitro-internal-virtual/public-assets-data": async () => {');
    expect(nitroRollup).toContain('let mimeType = mime.getType(id.replace(/\\.(gz|br)$/, "")) || "text/plain";');
  });
});
