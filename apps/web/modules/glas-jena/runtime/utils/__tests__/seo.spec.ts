import type { Product } from '@plentymarkets/shop-api';
import {
  GLAS_JENA_BREADCRUMBS_KEY,
  correctSeoTags,
  getBreadcrumbListJsonLd,
  getOrganizationJsonLd,
  getProductOpenGraph,
  toCanonicalUrl,
  withGtin13,
  withMetaDescription,
} from '../seo';
import type { SeoHeadTag } from '../types';

const PAGE = 'https://www.glas-jena.de/kueche-helfer/';

const product = (texts: Record<string, string>, image = 'https://cdn/item.jpg') =>
  ({
    texts: { name1: 'Teekanne MIKO 1.2l', description: '<p>Lange Beschreibung</p>', ...texts },
    images: { all: image ? [{ url: image, urlMiddle: image, position: 0 }] : [], variation: [] },
    prices: { default: { currency: 'EUR' } },
    variation: { id: 1004 },
  }) as unknown as Product;

/** The Bonbonniere LUNA (variation 1322): an EAN of type GTIN_13, PlentyONE's `seoSettings.gtin13` empty. */
const withBarcodes = (gtin13 = '') =>
  ({
    seoSettings: { sku: '1322', gtin13 },
    barcodes: [
      { id: 4, name: 'UPC', type: 'UPC', code: '012345678905' },
      { id: 1, name: 'EAN_13 1', type: 'GTIN_13', code: '5996427401900' },
      { id: 7, name: 'EAN_13 2', type: 'GTIN_13', code: '4006381333931' },
    ],
  }) as unknown as Product;

const breadcrumbScript = (innerHTML: string, key?: string): SeoHeadTag => ({
  tag: 'script',
  key,
  props: { type: 'application/ld+json' },
  innerHTML,
});

describe('seo', () => {
  it('should remove tracking and filter parameters but keep the page of an item list from page 2 on', () => {
    expect(toCanonicalUrl(`${PAGE}?check=4`)).toBe(PAGE);
    expect(toCanonicalUrl(`${PAGE}?check=4&page=2`)).toBe(`${PAGE}?page=2`);
    expect(toCanonicalUrl(`${PAGE}?page=1&utm_source=x`)).toBe(PAGE);
    expect(toCanonicalUrl(`${PAGE}?page=abc`)).toBe(PAGE);
    expect(toCanonicalUrl(PAGE)).toBe(PAGE);
  });

  it('should take the Open Graph tags of an item page from the item data', () => {
    expect(getProductOpenGraph(product({ metaDescription: 'Kurz und gut.' }), 19.9)).toEqual({
      type: 'product',
      title: 'Teekanne MIKO 1.2l',
      description: 'Kurz und gut.',
      image: 'https://cdn/item.jpg',
      priceAmount: '19.90',
      priceCurrency: 'EUR',
    });
    expect(getProductOpenGraph(product({ title: 'Teekanne MIKO – Glas aus Jena' }), 19.9).title).toBe(
      'Teekanne MIKO – Glas aus Jena',
    );
  });

  it('should leave empty Open Graph values to the shop defaults', () => {
    const openGraph = getProductOpenGraph(product({ name1: '' }, ''), 0);

    expect(openGraph.type).toBe('product');
    expect(openGraph.title).toBeUndefined();
    expect(openGraph.description).toBeUndefined();
    expect(openGraph.image).toBeUndefined();
    expect(openGraph.priceAmount).toBeUndefined();
    expect(openGraph.priceCurrency).toBeUndefined();
  });

  it('should give the Product JSON-LD the meta description and keep the item without one', () => {
    const item = product({ metaDescription: 'Kurz und gut.' });
    const withoutMeta = product({});

    expect(withMetaDescription(item).texts.description).toBe('Kurz und gut.');
    expect(item.texts.description).toBe('<p>Lange Beschreibung</p>');
    expect(withMetaDescription(withoutMeta)).toBe(withoutMeta);
  });

  it('should build breadcrumbs for search engines with names and absolute addresses', () => {
    expect(
      getBreadcrumbListJsonLd([
        { name: 'Startseite', url: 'https://www.glas-jena.de/' },
        { name: 'Küche & Helfer', url: PAGE },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: 'https://www.glas-jena.de/' },
        { '@type': 'ListItem', position: 2, name: 'Küche & Helfer', item: PAGE },
      ],
    });
  });

  it('should clean the addresses of canonical, hreflang, prev/next and og:url', () => {
    const tags: SeoHeadTag[] = [
      { tag: 'link', props: { rel: 'canonical', href: `${PAGE}?check=4` } },
      { tag: 'link', props: { rel: 'alternate', hreflang: 'en', href: `${PAGE}?check=4` } },
      { tag: 'link', props: { rel: 'next', href: `${PAGE}?check=4&page=2` } },
      { tag: 'meta', props: { property: 'og:url', content: `${PAGE}?check=4` } },
      { tag: 'link', props: { rel: 'stylesheet', href: '/style.css?v=4' } },
    ];

    correctSeoTags(tags);

    expect(tags.map((tag) => tag.props.href ?? tag.props.content)).toEqual([
      PAGE,
      PAGE,
      `${PAGE}?page=2`,
      PAGE,
      '/style.css?v=4',
    ]);
  });

  it("should replace the shop's breadcrumbs for search engines only when the module's own ones are there", () => {
    const shop = breadcrumbScript('{"@type":"BreadcrumbList","itemListElement":[]}');
    const own = breadcrumbScript('{"@type":"BreadcrumbList","itemListElement":[]}', GLAS_JENA_BREADCRUMBS_KEY);
    const productJsonLd = breadcrumbScript('{"@type":"Product"}');

    const withOwn = [shop, productJsonLd, own];
    correctSeoTags(withOwn);
    expect(withOwn).toEqual([productJsonLd, own]);

    const withoutOwn = [shop, productJsonLd];
    correctSeoTags(withoutOwn);
    expect(withoutOwn).toEqual([shop, productJsonLd]);
  });

  it('should describe the shop with its name, home page and logo', () => {
    expect(
      getOrganizationJsonLd({
        name: '-GLAS in JENA-',
        url: 'https://www.glas-jena.de',
        logo: 'https://cdn02.plentyone.com/x/frontend/layout/jenaglas_logo-header.png',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: '-GLAS in JENA-',
      url: 'https://www.glas-jena.de',
      logo: 'https://cdn02.plentyone.com/x/frontend/layout/jenaglas_logo-header.png',
    });
  });

  it('should take the first GTIN-13 barcode of the variation when PlentyONE delivers no GTIN-13', () => {
    const item = withGtin13(withBarcodes(), 2);

    expect(item.seoSettings).toEqual({ sku: '1322', gtin13: '5996427401900' });
    expect(withGtin13(withBarcodes(), '2').seoSettings?.gtin13).toBe('5996427401900');
  });

  it('should take the barcode with the given ID', () => {
    expect(withGtin13(withBarcodes(), '3', '7').seoSettings?.gtin13).toBe('4006381333931');
    expect(withGtin13(withBarcodes(), '3', 99).seoSettings?.gtin13).toBe('');
  });

  it('should keep a GTIN-13 from PlentyONE, "Do not display" and items without barcodes as they are', () => {
    const delivered = withBarcodes('4006381333931');
    expect(withGtin13(delivered, '2')).toBe(delivered);

    const hidden = withBarcodes();
    expect(withGtin13(hidden, '1')).toBe(hidden);

    const noBarcodes = { seoSettings: { gtin13: '' } } as unknown as Product;
    expect(withGtin13(noBarcodes, '2')).toBe(noBarcodes);
  });

  it('should make a relative logo absolute and leave out a missing one', () => {
    expect(getOrganizationJsonLd({ name: 'Shop', url: 'https://www.glas-jena.de/', logo: '/logo.svg' })).toMatchObject({
      logo: 'https://www.glas-jena.de/logo.svg',
    });
    expect(getOrganizationJsonLd({ name: 'Shop', url: 'https://www.glas-jena.de' })).not.toHaveProperty('logo');
  });
});
