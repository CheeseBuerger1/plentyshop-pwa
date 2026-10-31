import { existsSync } from 'node:fs';
import { rename } from 'node:fs/promises';
import { join } from 'node:path';
import { addVitePlugin } from 'nuxt/kit';
import type { Nuxt } from 'nuxt/schema';
import {
  getServiceWorkerFileName,
  getWrittenServiceWorkerFileName,
  replaceServiceWorkerUrl,
} from './runtime/utils/scriptFileNames';

/**
 * The service worker `sw-<mark>.mjs` under the address `/sw-<mark>.mjs/`, which the hosting passes to the shop's server
 * (see utils/scriptFileNames.ts). Only for builds; the dev server keeps `sw.js`.
 */
export const setupServiceWorkerAddress = (nuxt: Nuxt) => {
  const serviceWorkerFileName = getServiceWorkerFileName(nuxt.options.buildId);

  /*
   * Workbox writes the worker as `sw-<mark>.js`: renamed after @vite-pwa/nuxt has written it (its hook is registered
   * before `modules:done`) and before Nitro lists the public files for the server, so the server serves it under the
   * name the pages register.
   */
  nuxt.hook('modules:done', () => {
    nuxt.hook('nitro:build:public-assets', async (nitro) => {
      const publicDir = nitro.options.output.publicDir;
      const written = join(publicDir, getWrittenServiceWorkerFileName(serviceWorkerFileName));
      if (!existsSync(written)) {
        console.warn(`[glas-jena] Service worker ${written} not found; the pages register a missing file.`);
        return;
      }
      await rename(written, join(publicDir, serviceWorkerFileName));
    });
  });

  /*
   * From the folder `/sw-<mark>.mjs/` the worker may control the whole shop only with this header. Nitro matches its
   * route rules without the slash at the end, and @vite-pwa/nuxt sets its own rule for `/sw-<mark>.mjs` (Cache-Control)
   * in `nitro:config`, replacing any other: so the header is added to that rule afterwards.
   */
  nuxt.hook('modules:done', () => {
    nuxt.hook('nitro:config', (nitroConfig) => {
      const ruleKey = `/${serviceWorkerFileName}`;
      const rule = nitroConfig.routeRules?.[ruleKey] ?? {};
      nitroConfig.routeRules = {
        ...nitroConfig.routeRules,
        [ruleKey]: { ...rule, headers: { ...rule.headers, 'Service-Worker-Allowed': '/' } },
      };
    });
  });

  /* The pages register `/sw-<mark>.mjs/` instead of the `<base><filename>` of vite-plugin-pwa */
  addVitePlugin(
    {
      name: 'glas-jena:service-worker-url',
      enforce: 'post',
      transform(code) {
        if (!code.includes(`"/${serviceWorkerFileName}"`)) {
          return;
        }
        return { code: replaceServiceWorkerUrl(code, serviceWorkerFileName), map: null };
      },
    },
    { server: false },
  );
};
