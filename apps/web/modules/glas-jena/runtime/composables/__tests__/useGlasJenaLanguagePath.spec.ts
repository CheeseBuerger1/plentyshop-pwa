import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useGlasJenaLanguagePath } from '../useGlasJenaLanguagePath';

const { routeState, catalogState } = vi.hoisted(() => ({
  routeState: { meta: {} as Record<string, unknown>, query: {} as Record<string, string> },
  catalogState: { languageUrls: undefined as Record<string, string> | undefined },
}));

mockNuxtImport('useRoute', () => () => routeState);
mockNuxtImport('useProducts', () => () => ({ data: ref({ languageUrls: catalogState.languageUrls }) }));
/* The original's result: the other language prefix before the current (German) path */
mockNuxtImport('useSwitchLocalePath', () => () => (locale: string) => `/${locale}/kueche-helfer/schuesseln/`);
mockNuxtImport('useLocalePath', () => () => (path: string, locale: string) => `/${locale}${path}`);
/* The shop's setting "always with trailing slash" */
mockNuxtImport('useUrlTrailingSlash', () => () => ({
  resolvePathTrailingSlash: (path: string) => path.replace(/^([^?]*?)\/?(\?|$)/, '$1/$2'),
}));

const bowlsLanguageUrls = {
  'x-default': '/kueche-helfer/schuesseln',
  de: '/kueche-helfer/schuesseln',
  en: '/kitchen-helpers/bowls',
};

describe('useGlasJenaLanguagePath', () => {
  afterEach(() => {
    routeState.meta = {};
    routeState.query = {};
    catalogState.languageUrls = undefined;
  });

  it('should link a category to its own address in the other language (as in its hreflang links)', () => {
    routeState.meta = { type: 'category' };
    catalogState.languageUrls = bowlsLanguageUrls;

    expect(useGlasJenaLanguagePath()('en')).toBe('/en/kitchen-helpers/bowls/');
  });

  it('should keep the filters and the page of a category in the link', () => {
    routeState.meta = { type: 'category' };
    routeState.query = { page: '2', sort: 'price_asc' };
    catalogState.languageUrls = bowlsLanguageUrls;

    expect(useGlasJenaLanguagePath()('en')).toBe('/en/kitchen-helpers/bowls/?page=2&sort=price_asc');
  });

  it('should keep the original link on other pages, even with the data of the last category still loaded', () => {
    routeState.meta = { type: 'product' };
    catalogState.languageUrls = bowlsLanguageUrls;

    expect(useGlasJenaLanguagePath()('en')).toBe('/en/kueche-helfer/schuesseln/');
  });

  it('should keep the original link for a category without an address in that language', () => {
    routeState.meta = { type: 'category' };
    catalogState.languageUrls = { 'x-default': '' };

    expect(useGlasJenaLanguagePath()('en')).toBe('/en/kueche-helfer/schuesseln/');
  });
});
