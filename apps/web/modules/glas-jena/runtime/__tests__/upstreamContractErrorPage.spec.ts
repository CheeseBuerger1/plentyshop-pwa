/**
 * Upstream contract of the error page (GlasJenaError.vue wraps the original error.vue in the shop's formatting).
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ERROR_COMPONENT_OVERRIDE } from '../../index';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readApp = (path: string) => readFileSync(join(process.cwd(), 'app', path), 'utf8');

describe('upstream contract of the glas-jena module: error page', () => {
  it('should find the formatting that app.vue sets on <body> and the wrapper copies', () => {
    /* GlasJenaError.vue: `<Body class="font-body …" :style="currentFont" />` with useSiteConfiguration().currentFont */
    const appVue = readApp('app.vue');
    expect(appVue).toMatch(/<Body\s+class="font-body bg-editor-body-bg"[\s\S]*?:style="currentFont"/);
    expect(appVue).toContain('currentFont } = useSiteConfiguration();');
    expect(existsSync(join(process.cwd(), 'modules/glas-jena', ERROR_COMPONENT_OVERRIDE))).toBe(true);
  });

  it('should find the original error page that the wrapper renders', () => {
    /* `import OriginalError from '~/error.vue'` with the prop `error` */
    const errorVue = readApp('error.vue');
    expect(errorVue).toContain('const props = defineProps<{ error: ErrorProp }>();');
    expect(errorVue).toContain('<Error404Content v-if="error && error.statusCode == 404" />');
  });

  it('should find the search field and category buttons of the 404 page that glas-jena.css frames', () => {
    /* `main div:has(> div > div > form[role='search']) > div > .ring-inset` and `form[role='search'] [data-testid='input']` */
    const content = readApp('components/Error404Content/Error404Content.vue');
    expect(content).toMatch(
      /<div class="flex justify-center my-8">\s*<UiSearch[^>]*\/>\s*<\/div>\s*<div[^>]*>\s*<UiButton/,
    );
    expect(content).toContain('variant="secondary"');
    const search = readApp('components/ui/Search.vue');
    expect(search).toMatch(/<div[^>]*>\s*<form[^>]*role="search"/);
    expect(search).toContain('<SfInput');
  });
});
