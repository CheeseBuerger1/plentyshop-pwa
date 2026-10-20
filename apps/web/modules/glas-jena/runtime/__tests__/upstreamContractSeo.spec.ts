/**
 * Upstream contract of the head tags for search engines and shared links (see utils/seo.ts, plugins/seo.ts).
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readApp = (path: string) => readFileSync(join(process.cwd(), 'app', path), 'utf8');

describe('upstream contract of the glas-jena module: search engines', () => {
  it('should find the Product JSON-LD whose description useGlasJenaStructuredData replaces', () => {
    const structuredData = readApp('composables/useStructuredData/useStructuredData.ts');
    expect(structuredData).toContain('export const useStructuredData: useStructuredDataReturn = () => {');
    expect(structuredData).toContain('const setProductMetaData: SetProductMetaData = (product: Product) => {');
    /* The module hands over the item with its meta description in `texts.description` */
    expect(structuredData).toContain('description: product.texts.description,');
    expect(structuredData).toMatch(/return \{\s*setLogoMeta,\s*setProductMetaData,/);
  });

  it('should find the current item that the Open Graph tags of plugins/seo.ts read', () => {
    /* The product page puts the shown item (or the editor's dummy item) into `useProducts().currentProduct` */
    const productPage = readApp('pages/product/[slug].vue');
    expect(productPage).toContain('setCurrentProduct(productForEditor.value || ({} as Product));');
    expect(productPage).toMatch(/definePageMeta\(\{[\s\S]*?type: 'product',/);
    expect(readApp('composables/useProducts/useProducts.ts')).toContain('state.value.currentProduct = product;');
    /* The shop's og:type and og:title that the plugin outranks on item pages */
    expect(readApp('configuration/app.config.ts')).toContain("{ property: 'og:type', content: openGraph.type },");
    expect(readApp('app.vue')).toContain('ogTitle: () => ogTitle.value,');
  });

  it("should find the shop's breadcrumbs JSON-LD from the URL parts that GlasJenaBreadcrumbs replaces", () => {
    const breadcrumbs = readApp('components/ui/Breadcrumbs/Breadcrumbs.vue');
    /* Still built from the URL: once the shop takes the shown names, the module's copy can go */
    expect(breadcrumbs).toContain("const segments = route.path.split('/').filter(Boolean);");
    expect(breadcrumbs).toContain('name: segment,');
    expect(breadcrumbs).toContain("'@type': 'BreadcrumbList',");
    expect(breadcrumbs).toContain("type: 'application/ld+json',");
    /* The module passes the breadcrumbs on unchanged and builds the addresses like the links of the original */
    expect(breadcrumbs).toContain('defineProps<BreadcrumbsProps>();');
    expect(breadcrumbs).toContain(':to="localePath(item.link)"');
    expect(readApp('components/ui/Breadcrumbs/types.ts')).toMatch(/breadcrumbs: Breadcrumb\[\];/);
    expect(readApp('utils/productHelper.ts')).toContain('breadcrumbs.push({ name: productName, link: `#` });');
  });

  it('should find the default page title that GlasJenaPageBanner replaces with the page name', () => {
    /* All pages but categories get the shop's default title; the banner's title (high priority) outranks it */
    const app = readApp('app.vue');
    expect(app).toMatch(/const getCategoryMetaTitle = \(\) => \{[\s\S]*?return getMetaTitle\(\);\s*\};/);
    expect(app).toContain('title: () => title.value,');
    expect(app).toContain('usePageTitle();');
    /* The page name gets the shop name as suffix: "Warenkorb | OnlineMarket -GLAS in JENA-" */
    expect(readApp('composables/usePageTitle/usePageTitle.ts')).toContain(
      'return `${titleChunk} | ${titleSuffix.value}`;',
    );
  });

  it('should find the canonical and hreflang links whose query plugins/seo.ts removes', () => {
    /* The shop takes over the whole query string; the plugin keeps only `page` (from page 2 on) */
    const urlPageMeta = readApp('composables/useUrlPageMeta/useUrlPageMeta.ts');
    expect(urlPageMeta).toContain("rel: 'canonical',");
    expect(urlPageMeta).toContain("prevParams.delete('page');");
    expect(urlPageMeta).toContain("nextParams.set('page', String(facetsFromUrl.page + 1));");
  });
});
