import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { Product } from '@plentymarkets/shop-api';
import { useGlasJenaLanguagePath } from '../useGlasJenaLanguagePath';

const { routeState, catalogState } = vi.hoisted(() => ({
  routeState: { meta: {} as Record<string, unknown>, query: {} as Record<string, string> },
  catalogState: {
    languageUrls: undefined as Record<string, string> | undefined,
    currentProduct: {} as Partial<Product>,
  },
}));

mockNuxtImport('useRoute', () => () => routeState);
mockNuxtImport('useProducts', () => () => ({
  data: ref({ languageUrls: catalogState.languageUrls }),
  currentProduct: ref(catalogState.currentProduct),
}));
/* The original's result: the other language prefix before the current (German) path, without trailing slash */
mockNuxtImport('useSwitchLocalePath', () => () => (locale: string) => `/${locale}/kueche-helfer/schuesseln`);
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

const storageJar = {
  seoSettings: {
    canonical: {
      href: 'https://www.glas-jena.de/kueche-helfer/vorratsdosen/kleine-vorratsdose-0-6l-buche_527263_1314/',
      alternate: [
        {
          hreflang: 'x-default',
          href: 'https://www.glas-jena.de/kueche-helfer/vorratsdosen/kleine-vorratsdose-0-6l-buche_527263_1314/',
        },
        {
          hreflang: 'de',
          href: 'https://www.glas-jena.de/kueche-helfer/vorratsdosen/kleine-vorratsdose-0-6l-buche_527263_1314/',
        },
        {
          hreflang: 'en',
          href: 'https://www.glas-jena.de/en/kitchen-helpers/storage-jars/small-storage-jar-0-6l-beech_527263_1314/',
        },
      ],
    },
  },
} as unknown as Product;

describe('useGlasJenaLanguagePath', () => {
  afterEach(() => {
    routeState.meta = {};
    routeState.query = {};
    catalogState.languageUrls = undefined;
    catalogState.currentProduct = {};
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

  it('should link an item to its own address in the other language (as in its hreflang links)', () => {
    routeState.meta = { type: 'product' };
    catalogState.currentProduct = storageJar;

    expect(useGlasJenaLanguagePath()('en')).toBe(
      '/en/kitchen-helpers/storage-jars/small-storage-jar-0-6l-beech_527263_1314/',
    );
    expect(useGlasJenaLanguagePath()('de')).toBe(
      '/kueche-helfer/vorratsdosen/kleine-vorratsdose-0-6l-buche_527263_1314/',
    );
  });

  it('should keep the original link with trailing slash for an item without hreflang addresses', () => {
    routeState.meta = { type: 'product' };
    catalogState.currentProduct = { seoSettings: [] } as unknown as Product;

    expect(useGlasJenaLanguagePath()('en')).toBe('/en/kueche-helfer/schuesseln/');
  });

  it('should not use the data of the last item or category on other pages', () => {
    routeState.meta = { type: 'content' };
    catalogState.languageUrls = bowlsLanguageUrls;
    catalogState.currentProduct = storageJar;

    expect(useGlasJenaLanguagePath()('en')).toBe('/en/kueche-helfer/schuesseln/');
  });

  it('should keep the original link with trailing slash for a category without an address in that language', () => {
    routeState.meta = { type: 'category' };
    catalogState.languageUrls = { 'x-default': '' };

    expect(useGlasJenaLanguagePath()('en')).toBe('/en/kueche-helfer/schuesseln/');
  });
});
