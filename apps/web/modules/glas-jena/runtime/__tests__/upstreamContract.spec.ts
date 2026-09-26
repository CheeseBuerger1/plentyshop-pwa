/**
 * Upstream contract: what the GLAS IN JENA module relies on in the original plentyshop-pwa files.
 *
 * The module changes the shop without touching original files, so an update from plentymarkets/plentyshop-pwa
 * ("Sync fork") never conflicts – but it can silently break a customisation, e.g. when a `data-testid`, a route or
 * a translation key is renamed. These tests fail in that case and name what has to be adapted in the module.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { COMPONENT_OVERRIDES } from '../../index';
import {
  ACCOUNT_ROUTE_PREFIX,
  ACCOUNT_TITLE_KEY,
  CATEGORY_ROUTE,
  PAGE_BANNER_TITLE_KEYS,
  SEARCH_RESULTS_TITLE_KEY,
  SEARCH_ROUTE,
  TAG_ROUTE,
} from '../utils/pageBanner';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const WEB_DIR = process.cwd();
const APP_DIR = join(WEB_DIR, 'app');
const MODULE_CSS = join(WEB_DIR, 'modules/glas-jena/runtime/glas-jena.css');
/** Test ids of the module's own components; everything else in glas-jena.css belongs to original files. */
const OWN_TEST_ID_PREFIX = 'gj-';

const readApp = (path: string) => readFileSync(join(APP_DIR, path), 'utf8');

const listFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === '__tests__' || name === 'node_modules') {
      return [];
    }
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });

/** Where original test ids are set: the shop's Vue files and the Storefront UI icons (e.g. `favorite`). */
const STOREFRONT_ICONS_DIR = join(WEB_DIR, '../../node_modules/@storefront-ui/vue/dist/components/SfIcons');
const originalSources = [
  ...listFiles(APP_DIR).filter((file) => file.endsWith('.vue')),
  ...listFiles(STOREFRONT_ICONS_DIR).filter((file) => file.endsWith('.mjs')),
]
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

/** Static (`data-testid="x"`) or bound test id (`:data-testid="... 'x'"`, `'data-testid': 'x'` in the icons). */
const hasTestId = (id: string) =>
  originalSources.includes(`data-testid="${id}"`) ||
  originalSources.includes(`'${id}'`) ||
  originalSources.includes(`"${id}"`);

/** Route names like Nuxt builds them from the page files (without the i18n locale suffix). */
const routeNames = listFiles(join(APP_DIR, 'pages'))
  .filter((file) => file.endsWith('.vue'))
  .map((file) =>
    relative(join(APP_DIR, 'pages'), file)
      .replace(/\\/g, '/')
      .replace(/\.vue$/, '')
      .replace(/\[\.\.\.(\w+)\]/g, '$1')
      .replace(/\[(\w+)\]/g, '$1')
      .replace(/\/index$/, '')
      .replace(/\//g, '-'),
  );

const getTranslation = (locale: string, key: string) =>
  key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      JSON.parse(readApp(`lang/${locale}.json`)),
    );

describe('upstream contract of the glas-jena module', () => {
  it('should find every original data-testid that glas-jena.css styles', () => {
    const testIds = [...readFileSync(MODULE_CSS, 'utf8').matchAll(/data-testid='([\w-]+)'/g)]
      .map(([, id]) => id as string)
      .filter((id) => !id.startsWith(OWN_TEST_ID_PREFIX));

    const missing = [...new Set(testIds)].filter((id) => !hasTestId(id));

    expect(missing).toEqual([]);
  });

  it('should find every original component the module replaces', () => {
    const componentFile = (name: string) => {
      /* Nuxt names: `UiHeaderBlocks` → components/ui/HeaderBlocks…, `Cookiebar` → components/Cookiebar… */
      const path = name.startsWith('Ui') ? name.replace(/^Ui/, 'components/ui/') : `components/${name}`;
      const fileName = path.split('/').pop();
      return [`${path}.vue`, `${path}/${fileName}.vue`].find((file) => existsSync(join(APP_DIR, file)));
    };

    const missing = Object.keys(COMPONENT_OVERRIDES).filter((name) => !componentFile(name));

    expect(missing).toEqual([]);
  });

  it('should find every page the banner has a title for', () => {
    const bannerRoutes = [...Object.keys(PAGE_BANNER_TITLE_KEYS), CATEGORY_ROUTE, SEARCH_ROUTE, TAG_ROUTE];

    expect(bannerRoutes.filter((route) => !routeNames.includes(route))).toEqual([]);
    expect(routeNames).toContain(ACCOUNT_ROUTE_PREFIX);
  });

  it('should find the banner titles in German and English', () => {
    const keys = [...Object.values(PAGE_BANNER_TITLE_KEYS), ACCOUNT_TITLE_KEY, SEARCH_RESULTS_TITLE_KEY];

    for (const locale of ['de', 'en']) {
      expect(keys.filter((key) => typeof getTranslation(locale, key) !== 'string')).toEqual([]);
      expect(getTranslation(locale, SEARCH_RESULTS_TITLE_KEY)).toContain('{phrase}');
    }
  });

  it('should render the banner as a sibling right before main in the layouts with a header', () => {
    /* The banner rules in glas-jena.css use `.gj-page-banner ~ main` and `~ [data-testid='narrow-container']` */
    expect(readApp('layouts/default.vue')).toMatch(
      /<UiHeaderBlocks \/>\s*<NarrowContainer[^>]*>\s*<LazyUiBreadcrumbs[^>]*\/>\s*<\/NarrowContainer>\s*<main>/,
    );
    expect(readApp('layouts/auth.vue')).toMatch(/<UiHeaderBlocks \/>\s*<main[^>]*>\s*<h1/);
    expect(readApp('layouts/simplifiedHeaderAndFooter.vue')).toMatch(/<UiSimplifiedHeader \/>\s*<main>/);
  });

  it('should find the page headings that the banner replaces', () => {
    expect(readApp('layouts/checkout.vue')).toMatch(
      /data-testid="checkout-layout">\s*<NarrowContainer[^>]*>\s*<div[^>]*>\s*<h1/,
    );
    expect(readApp('components/CategoryPageContent/CategoryPageContent.vue')).toMatch(
      /data-testid="category-layout">\s*<h1/,
    );
    expect(readApp('pages/contact.vue')).toMatch(
      /<NuxtLayout name="default">\s*<div[^>]*>\s*<h1 class="[^"]*typography-headline-3/,
    );
  });
});
