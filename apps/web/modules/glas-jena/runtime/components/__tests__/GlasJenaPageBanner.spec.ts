import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaPageBanner from '../GlasJenaPageBanner.vue';

const { routeState, catalogState, errorState } = vi.hoisted(() => ({
  routeState: { baseName: 'cart', query: {} as Record<string, string>, params: {} as Record<string, string> },
  catalogState: { category: undefined as object | undefined },
  errorState: { error: undefined as object | undefined },
}));

mockNuxtImport('useRoute', () => () => ({ query: routeState.query, params: routeState.params, meta: {} }));
mockNuxtImport('useRouteBaseName', () => () => () => routeState.baseName);
mockNuxtImport('useProducts', () => () => ({ data: ref({ category: catalogState.category }) }));
/* The test i18n instance has no messages: returns the key and the parameters, so the tests can check both */
mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) => (params ? `${key}: ${Object.values(params).join(', ')}` : key),
}));
mockNuxtImport('useError', () => () => ref(errorState.error));

const categoryFixture = { details: [{ name: 'Tee & Kaffee' }] };

const findBanner = async () => (await mountSuspended(GlasJenaPageBanner)).find('[data-testid="gj-page-banner"]');

const findTitle = async () => (await mountSuspended(GlasJenaPageBanner)).find('[data-testid="gj-page-banner-title"]');

describe('GlasJenaPageBanner', () => {
  afterEach(() => {
    routeState.baseName = 'cart';
    routeState.query = {};
    routeState.params = {};
    catalogState.category = undefined;
    errorState.error = undefined;
  });

  it('should show the page name as heading on a page with a fixed title', async () => {
    const title = await findTitle();

    expect(title.element.tagName).toBe('H1');
    expect(title.text()).toBe('common.labels.cart');
  });

  it('should show the category name on a category page', async () => {
    routeState.baseName = 'slug';
    catalogState.category = categoryFixture;

    expect((await findTitle()).text()).toBe('Tee & Kaffee');
  });

  it('should mark the banner of a category page only', async () => {
    expect((await findBanner()).classes()).not.toContain('gj-page-banner--category');

    routeState.baseName = 'slug';
    catalogState.category = categoryFixture;

    expect((await findBanner()).classes()).toContain('gj-page-banner--category');
  });

  it('should show the search phrase on the search page', async () => {
    routeState.baseName = 'search';
    routeState.query = { term: 'tasse' };

    expect((await findTitle()).text()).toBe('search.searchResults: tasse');
  });

  it('should show the tag name on a tag page', async () => {
    routeState.baseName = 'tag-slug';
    routeState.params = { slug: 'glas_12' };

    expect((await findTitle()).text()).toBe('search.searchResults: glas');
  });

  it('should show no banner on the home page and on product pages', async () => {
    routeState.baseName = 'index';
    expect((await findTitle()).exists()).toBe(false);

    routeState.baseName = 'product-slug';
    expect((await findTitle()).exists()).toBe(false);
  });

  it('should show the status code on an error page', async () => {
    errorState.error = { statusCode: 404 };

    expect((await findTitle()).text()).toBe('errorTitle: 404');
  });
});
