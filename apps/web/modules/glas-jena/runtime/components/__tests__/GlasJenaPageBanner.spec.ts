import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaPageBanner from '../GlasJenaPageBanner.vue';

const { routeState, catalogState, errorState } = vi.hoisted(() => ({
  routeState: { baseName: 'cart', query: {} as Record<string, string>, params: {} as Record<string, string> },
  catalogState: { category: undefined as object | undefined, breadcrumbs: [] as { name: string }[] },
  errorState: { error: undefined as object | undefined },
}));

mockNuxtImport('useRoute', () => () => ({ query: routeState.query, params: routeState.params, meta: {} }));
mockNuxtImport('useRouteBaseName', () => () => () => routeState.baseName);
mockNuxtImport('useProducts', () => () => ({
  data: ref({ category: catalogState.category, breadcrumbs: catalogState.breadcrumbs }),
}));
/* The test i18n instance has no messages: returns the key and the parameters, so the tests can check both */
const { translate } = vi.hoisted(() => ({
  translate: (key: string, params?: Record<string, unknown>) =>
    params ? `${key}: ${Object.values(params).join(', ')}` : key,
}));
/* Global `t` for the shop's texts (usePageBanner), `useI18n` only for the component's local error text (marked) */
mockNuxtImport('t', () => translate);
mockNuxtImport('useI18n', () => () => ({
  t: (key: string, params?: Record<string, unknown>) => `local ${translate(key, params)}`,
}));
mockNuxtImport('useError', () => () => ref(errorState.error));
const { useHeadMock } = vi.hoisted(() => ({ useHeadMock: vi.fn() }));
mockNuxtImport('useHead', () => useHeadMock);

const categoryFixture = { type: 'item', details: [{ name: 'Tee & Kaffee' }] };
const contentPageFixture = { type: 'content', details: [{ name: 'Unser hitzebeständiges Glas' }] };

const findBanner = async () => (await mountSuspended(GlasJenaPageBanner)).find('[data-testid="gj-page-banner"]');

const findTitle = async () => (await mountSuspended(GlasJenaPageBanner)).find('[data-testid="gj-page-banner-title"]');

/** Page title the banner sets (useHead), `undefined` where the page keeps its own */
const getPageTitle = async () => {
  useHeadMock.mockClear();
  await mountSuspended(GlasJenaPageBanner);
  const [input, options] = useHeadMock.mock.calls.at(-1) ?? [];
  expect(options).toEqual({ tagPriority: 'high' });
  return input.title();
};

describe('GlasJenaPageBanner', () => {
  afterEach(() => {
    routeState.baseName = 'cart';
    routeState.query = {};
    routeState.params = {};
    catalogState.category = undefined;
    catalogState.breadcrumbs = [];
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

  it('should mark the banner of a product category only', async () => {
    expect((await findBanner()).classes()).not.toContain('gj-page-banner--category');

    routeState.baseName = 'slug';
    catalogState.category = categoryFixture;

    expect((await findBanner()).classes()).toContain('gj-page-banner--category');
  });

  it('should show the page name but not mark the banner on a content page', async () => {
    routeState.baseName = 'slug';
    catalogState.category = contentPageFixture;

    const banner = await findBanner();

    expect(banner.text()).toBe('Unser hitzebeständiges Glas');
    expect(banner.classes()).not.toContain('gj-page-banner--category');
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

  it('should name the page route on the banner, so glas-jena.css can style single pages', async () => {
    routeState.baseName = 'shipping';

    expect((await findBanner()).attributes('data-gj-route')).toBe('shipping');
  });

  it('should show the own title of the LTS shop on the cancellation page', async () => {
    routeState.baseName = 'cancellation-rights';

    expect((await findTitle()).text()).toBe('local cancellationRightsTitle');
  });

  it('should show the status code on an error page', async () => {
    errorState.error = { statusCode: 404 };

    expect((await findTitle()).text()).toBe('local errorTitle: 404');
  });

  it('should show the categories above a deeper category as a line inside the heading', async () => {
    routeState.baseName = 'slug';
    catalogState.category = { type: 'item', details: [{ name: 'kleiner 1 L' }] };
    catalogState.breadcrumbs = ['Tee & Kaffee', 'Teekannen', 'mit Glasfilter', 'kleiner 1 L'].map((name) => ({ name }));

    const title = await findTitle();
    const kicker = title.find('[data-testid="gj-page-banner-kicker"]');

    expect(kicker.text().replace(/\s+/g, ' ')).toBe('Teekannen › mit Glasfilter:');
    expect(title.text().replace(/\s+/g, ' ')).toBe('Teekannen › mit Glasfilter: kleiner 1 L');
  });

  it('should show no line above the title of a main category or its direct subcategories', async () => {
    routeState.baseName = 'slug';
    catalogState.category = categoryFixture;
    catalogState.breadcrumbs = [{ name: 'Tee & Kaffee' }];

    expect((await findTitle()).find('[data-testid="gj-page-banner-kicker"]').exists()).toBe(false);
  });

  it('should use the page name as page title on pages without a title of their own', async () => {
    expect(await getPageTitle()).toBe('common.labels.cart');

    routeState.baseName = 'cancellation-rights';
    expect(await getPageTitle()).toBe('local cancellationRightsTitle');

    routeState.baseName = 'search';
    routeState.query = { term: 'tasse' };
    expect(await getPageTitle()).toBe('search.searchResults: tasse');

    routeState.baseName = 'my-account-my-orders';
    expect(await getPageTitle()).toBe('account.heading');
  });

  it('should keep the own page title of categories, content pages, error pages, the home page and product pages', async () => {
    routeState.baseName = 'slug';
    catalogState.category = categoryFixture;
    expect(await getPageTitle()).toBeUndefined();

    catalogState.category = contentPageFixture;
    expect(await getPageTitle()).toBeUndefined();

    routeState.baseName = 'cart';
    catalogState.category = undefined;
    errorState.error = { statusCode: 404 };
    expect(await getPageTitle()).toBeUndefined();

    errorState.error = undefined;
    routeState.baseName = 'index';
    expect(await getPageTitle()).toBeUndefined();

    routeState.baseName = 'product-slug';
    expect(await getPageTitle()).toBeUndefined();
  });

  it('should show no line above the title of a content page', async () => {
    routeState.baseName = 'slug';
    catalogState.category = contentPageFixture;
    catalogState.breadcrumbs = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];

    expect((await findTitle()).find('[data-testid="gj-page-banner-kicker"]').exists()).toBe(false);
  });
});
