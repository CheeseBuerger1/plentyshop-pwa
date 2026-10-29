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

  it('should find the GTIN-13 of the Product JSON-LD and the editor setting that withGtin13 follows', () => {
    /* The shop takes the GTIN-13 from `seoSettings`, where the module puts the barcode */
    expect(readApp('composables/useStructuredData/useStructuredData.ts')).toContain(
      'const gtin13 = productSeoSettingsGetters.getGtin13(product);',
    );
    const settings = readApp('configuration/settings.config.ts');
    expect(settings).toContain('seoRichSnippetBarcodeGtin13:');
    expect(settings).toContain('seoRichSnippetBarcodeGtin13Id:');
    /* The options of the editor: 1 "Do not display", 2 first GTIN-13 barcode, 3 barcode by ID */
    const editor = readApp('components/settings/seo/search-engines/rich-snippet-mapping/05.BarcodeGtin13.vue');
    expect(editor).toContain("ref(['1', '2', '3'])");
    expect(editor).toContain('"seoRichSnippetBarcodeGtin13-2": "Use first GTIN-13 barcode from variation"');
    expect(editor).toContain('"seoRichSnippetBarcodeGtin13-3": "Use specific GTIN-13 barcode by ID"');
  });

  it('should find the offer fields and the editor settings that withSeoFallback completes', () => {
    /* The shop takes availability and condition of the offer from `seoSettings`, where the module puts the fallback */
    const structuredData = readApp('composables/useStructuredData/useStructuredData.ts');
    expect(structuredData).toContain('availability: productSeoSettingsGetters.getMappedAvailability(product)');
    expect(structuredData).toContain('itemCondition: productSeoSettingsGetters.getConditionOfItem(product)');
    /* SEO_AVAILABILITY_SETTINGS (availability 1 … 10) and ITEM_CONDITION_SETTINGS (condition IDs 0 … 4) */
    const settings = readApp('configuration/settings.config.ts');
    for (let availability = 1; availability <= 10; availability++) {
      expect(settings).toContain(`seoAvailability${availability}:`);
    }
    for (const condition of ['New', 'Used', 'NewBox', 'NewLabel', 'BStock']) {
      expect(settings).toContain(`itemCondition${condition}:`);
    }
  });

  it('should find the Product JSON-LD with one offer, its price and the weight that completeProductJsonLd reads', () => {
    /* plugins/seo.ts completes the resolved head tag: one Offer object with a number price, weight in grams */
    const structuredData = readApp('composables/useStructuredData/useStructuredData.ts');
    expect(structuredData).toMatch(/const offers: SchemaOffer = \{\s*'@type': 'Offer',/);
    expect(structuredData).toContain('price: Number(price.value),');
    expect(structuredData).toMatch(
      /weight: \{\s*'@type': 'QuantitativeValue',\s*value: productGetters\.getWeightG\(product\),/,
    );
    expect(structuredData).toContain("type: 'application/ld+json',");
  });

  it('should find the Organization JSON-LD of the layouts and the sources of name and logo that the module uses', () => {
    /* The layouts call setLogoMeta, which the module replaces; the original has no name and a fixed logo path */
    const structuredData = readApp('composables/useStructuredData/useStructuredData.ts');
    expect(structuredData).toContain("logo: runtimeConfig.public.domain + '/_nuxt-plenty/images/logo.png',");
    expect(readApp('layouts/default.vue')).toContain('setLogoMeta();');
    expect(readApp('layouts/simplifiedHeaderAndFooter.vue')).toContain('useStructuredData().setLogoMeta();');
    /* Name like the suffix of the page titles, logo like the header */
    expect(readApp('composables/usePageTitle/usePageTitle.ts')).toContain(
      'const titleSuffix = computed(() => getOgTitle() || runtimeConfig.ogTitle || openGraph.title);',
    );
    expect(readApp('components/ui/Logo.vue')).toContain("useSiteSettings('headerLogo');");
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
    /* The page name gets the shop name as suffix: "Warenkorb | -GLAS in JENA-" */
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

  it('should find the function pages and the robots handling that plugins/noindexPages.ts builds on', () => {
    /* The pages of NOINDEX_PAGE_NAMES exist and set no robots of their own (login and registration do) */
    for (const page of ['cart', 'guest/login', 'reset-password', 'newsletter/unsubscribe', 'readonly-checkout']) {
      expect(readApp(`pages/${page}.vue`)).not.toContain("name: 'robots'");
    }
    expect(readApp('pages/login.vue')).toContain("meta: [{ name: 'robots', content: 'noindex, nofollow' }],");
    /* The shop's robots default comes from app.vue; the unsubscription asks for a setting the original does not know */
    expect(readApp('app.vue')).toContain('robots: () => robots.value,');
    expect(readApp('pages/newsletter/unsubscribe.vue')).toContain(
      "setRobotForStaticPage('NewsletterUnsubscribePage');",
    );
    expect(readApp('composables/useRobots/useRobot.ts')).not.toContain("case 'NewsletterUnsubscribePage':");
    /* The sitemap module skips pages with `meta.sitemap === false` (SITEMAP_EXCLUDED_PAGE_PATHS) */
    expect(readFileSync(join(process.cwd(), 'modules/sitemap/index.ts'), 'utf8')).toContain(
      'if (page.meta?.sitemap === false) return;',
    );
  });
});
