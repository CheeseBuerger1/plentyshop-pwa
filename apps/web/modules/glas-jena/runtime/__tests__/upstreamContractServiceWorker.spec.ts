/**
 * Upstream contract of the service worker: the module gives every precached file a revision (hook
 * `pwa:beforeBuildServiceWorker` in index.ts, PRECACHE_WITHOUT_REVISION), and the script files get new names with every
 * build for the CDN (utils/scriptFileNames.ts).
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PRECACHE_WITHOUT_REVISION } from '../../index';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readWeb = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const readPackage = (path: string) => readFileSync(join(process.cwd(), '../../node_modules', path), 'utf8');

describe('upstream contract of the glas-jena module: service worker', () => {
  it('should find the precache of the scripts and styles that the module gives revisions', () => {
    const config = readWeb('nuxt.config.ts');
    expect(config).toContain("registerType: 'prompt',");
    expect(config).toMatch(/globPatterns: \['\*\*\/\*\.\{js,json,css,/);
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
});
