import { productGetters, type Product } from '@plentymarkets/shop-api';
import type {
  BreadcrumbList as SchemaBreadcrumbList,
  Organization as SchemaOrganization,
  WithContext,
} from 'schema-dts';
import { getMerchantReturnPolicyJsonLd, getShippingServiceJsonLd, completeProductJsonLd } from './merchantPolicies';
import type { BreadcrumbListEntry, OrganizationEntry, ProductOpenGraph, SeoHeadTag } from './types';

/** `og:type` of item pages; home page and categories keep the shop's `website`. */
export const PRODUCT_OG_TYPE = 'product';

/**
 * The only query parameter that stays in the addresses for search engines: the page of an item list from page 2 on
 * (every page of a list is its own page). Tracking or filter parameters (`?check=4`, `?utm_source=…`) are removed.
 */
export const CANONICAL_PAGE_PARAM = 'page';

/** Key of the module's breadcrumbs for search engines, see GlasJenaBreadcrumbs.vue. */
export const GLAS_JENA_BREADCRUMBS_KEY = 'glas-jena-breadcrumbs';

/** Key of the module's Organization JSON-LD, see useGlasJenaStructuredData.ts. */
export const GLAS_JENA_ORGANIZATION_KEY = 'glas-jena-organization';

export const JSON_LD_TYPE = 'application/ld+json';
/** Links whose address is a page of the shop for search engines (hreflang alternates are checked separately) */
const SEO_LINK_RELS = ['canonical', 'prev', 'next'];
const BREADCRUMB_LIST_RE = /"@type"\s*:\s*"BreadcrumbList"/;

/**
 * The address without its query parameters, except the page of an item list from page 2 on.
 * @example toCanonicalUrl('https://www.glas-jena.de/kueche-helfer/?check=4&page=2') // '…/kueche-helfer/?page=2'
 */
export const toCanonicalUrl = (url: string) => {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) {
    return url;
  }

  const page = Number(new URLSearchParams(url.slice(queryStart + 1)).get(CANONICAL_PAGE_PARAM));
  const base = url.slice(0, queryStart);
  return Number.isInteger(page) && page > 1 ? `${base}?${CANONICAL_PAGE_PARAM}=${page}` : base;
};

/**
 * Open Graph tags of an item page from the item data: its meta title (or name), meta description, cover image and
 * price. Empty values stay `undefined`, so the shop's defaults apply.
 */
export const getProductOpenGraph = (product: Product, price: number): ProductOpenGraph => ({
  type: PRODUCT_OG_TYPE,
  title: productGetters.getTitle(product) || productGetters.getName(product) || undefined,
  description: productGetters.getMetaDescription(product) || undefined,
  image: productGetters.getCoverImage(product) || undefined,
  priceAmount: price > 0 ? price.toFixed(2) : undefined,
  priceCurrency: price > 0 ? productGetters.getSpecialPriceCurrency(product) || undefined : undefined,
});

/**
 * The item for the shop's Product JSON-LD: with its meta description as `description` instead of the long HTML
 * description of the item page. Without a meta description the item stays as it is.
 */
export const withMetaDescription = (product: Product): Product => {
  const metaDescription = productGetters.getMetaDescription(product);
  return metaDescription ? { ...product, texts: { ...product.texts, description: metaDescription } } : product;
};

/** Barcode type of the EAN in PlentyONE. */
export const GTIN13_BARCODE_TYPE = 'GTIN_13';

/** Options of the editor setting "GTIN-13 barcode" that show a barcode (1 is "Do not display"). */
export const GTIN13_SOURCE = { first: '2', byId: '3' } as const;

/**
 * The item for the shop's Product JSON-LD with its GTIN-13 from the variation's barcodes, chosen like the editor
 * setting "GTIN-13 barcode" (first GTIN-13 barcode, or the barcode with the given ID). PlentyONE leaves
 * `seoSettings.gtin13` empty although the setting is on and the item has an EAN (found 2026-10-25, also after a shop
 * update); a GTIN that PlentyONE does deliver is kept.
 *
 * @param source Value of the setting `seoRichSnippetBarcodeGtin13` (saved as string or number).
 * @param barcodeId Value of `seoRichSnippetBarcodeGtin13Id`, used with `GTIN13_SOURCE.byId`.
 */
export const withGtin13 = (product: Product, source: unknown, barcodeId?: unknown): Product => {
  if (product.seoSettings?.gtin13) {
    return product;
  }

  const barcodes = product.barcodes ?? [];
  const barcode =
    String(source) === GTIN13_SOURCE.first
      ? barcodes.find(({ type }) => type === GTIN13_BARCODE_TYPE)
      : String(source) === GTIN13_SOURCE.byId
        ? barcodes.find(({ id }) => String(id) === String(barcodeId))
        : undefined;

  return barcode?.code
    ? { ...product, seoSettings: { ...product.seoSettings, gtin13: barcode.code } as Product['seoSettings'] }
    : product;
};

/** Prefix of the editor settings `seoAvailability1` … `seoAvailability10` (schema.org value of availability 1 … 10). */
export const SEO_AVAILABILITY_SETTING_PREFIX = 'seoAvailability';

/** The editor settings of the availabilities, one for each of PlentyONE's availabilities 1 … 10. */
export const SEO_AVAILABILITY_SETTINGS = Array.from(
  { length: 10 },
  (_, index) => `${SEO_AVAILABILITY_SETTING_PREFIX}${index + 1}`,
);

/** The editor settings of the item conditions, in the order of PlentyONE's condition IDs (0 new … 4 B-stock). */
export const ITEM_CONDITION_SETTINGS = [
  'itemConditionNew',
  'itemConditionUsed',
  'itemConditionNewBox',
  'itemConditionNewLabel',
  'itemConditionBStock',
];

const settingValue = (value: unknown) => (typeof value === 'string' && value ? value : undefined);

/**
 * The item for the shop's Product JSON-LD with availability and condition of its offer from the editor settings
 * (SEO » Search engines) when PlentyONE delivers none. For single items PlentyONE delivers `seoSettings: []` for
 * minutes at a time (about one item page in 20, a second request gets the same; found 2026-10-28), so the offer had
 * no `availability` ("missing field" in the Search Console) and no `itemCondition`. PlentyONE maps the same settings
 * itself: the variation's availability ID to `seoAvailability<ID>`, the item's condition ID to `ITEM_CONDITION_SETTINGS`.
 * Values that PlentyONE does deliver are kept; without a setting the field stays empty as before.
 *
 * @param getSetting Value of an editor setting by its key.
 */
export const withSeoFallback = (product: Product, getSetting: (key: string) => unknown): Product => {
  const seoSettings: Partial<NonNullable<Product['seoSettings']>> = Array.isArray(product.seoSettings)
    ? {}
    : (product.seoSettings ?? {});

  const availabilityId = product.variation?.availabilityId;
  const mappedAvailability =
    !seoSettings.mappedAvailability && availabilityId
      ? settingValue(getSetting(`${SEO_AVAILABILITY_SETTING_PREFIX}${availabilityId}`))
      : undefined;

  const conditionSetting = ITEM_CONDITION_SETTINGS[Number(product.item?.condition?.id)];
  const conditionOfItem =
    !seoSettings.conditionOfItem && conditionSetting ? settingValue(getSetting(conditionSetting)) : undefined;

  if (!mappedAvailability && !conditionOfItem) {
    return product;
  }
  return {
    ...product,
    seoSettings: {
      ...seoSettings,
      ...(mappedAvailability && { mappedAvailability }),
      ...(conditionOfItem && { conditionOfItem }),
    } as Product['seoSettings'],
  };
};

/** Breadcrumbs for search engines with the names that the page shows and absolute addresses. */
export const getBreadcrumbListJsonLd = (entries: BreadcrumbListEntry[]): WithContext<SchemaBreadcrumbList> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: entries.map((entry, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: entry.name,
    item: entry.url,
  })),
});

/**
 * The shop for search engines with its name and logo, its shipping and its returns (see merchantPolicies.ts). The
 * shop's own Organization JSON-LD has neither name nor a working logo (`/_nuxt-plenty/images/logo.png` is a 404 in
 * this shop, found 2026-10-25). A relative logo address gets the home page in front; without a logo the field is left
 * out.
 */
export const getOrganizationJsonLd = ({ name, url, logo }: OrganizationEntry): WithContext<SchemaOrganization> => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name,
  url,
  ...(logo ? { logo: logo.startsWith('/') ? `${url.replace(/\/$/, '')}${logo}` : logo } : {}),
  hasShippingService: getShippingServiceJsonLd(),
  hasMerchantReturnPolicy: getMerchantReturnPolicyJsonLd(),
});

const isJsonLd = (tag: SeoHeadTag) => tag.tag === 'script' && tag.props.type === JSON_LD_TYPE;

/** The shop's breadcrumbs for search engines (names and addresses from the URL parts, see Breadcrumbs.vue). */
const isShopBreadcrumbList = (tag: SeoHeadTag) =>
  isJsonLd(tag) && tag.key !== GLAS_JENA_BREADCRUMBS_KEY && BREADCRUMB_LIST_RE.test(tag.innerHTML ?? '');

/** canonical, hreflang alternates, prev/next of item lists */
const isSeoLink = (tag: SeoHeadTag) =>
  tag.tag === 'link' &&
  typeof tag.props.href === 'string' &&
  (SEO_LINK_RELS.includes(tag.props.rel as string) ||
    (tag.props.rel === 'alternate' && tag.props.hreflang !== undefined));

const isOgUrl = (tag: SeoHeadTag) =>
  tag.tag === 'meta' && tag.props.property === 'og:url' && typeof tag.props.content === 'string';

/**
 * Corrects the resolved head tags in place (unhead hook `tags:resolve`):
 * - canonical, hreflang, prev/next and og:url without tracking or filter parameters (see `toCanonicalUrl`); the shop
 *   takes over the whole query string on categories and static pages
 * - the shop's breadcrumbs for search engines are removed when the module's own ones are there
 * - the offer of the shop's Product JSON-LD gets shipping and returns (see `completeProductJsonLd`)
 */
export const correctSeoTags = (tags: SeoHeadTag[]) => {
  const hasOwnBreadcrumbs = tags.some((tag) => isJsonLd(tag) && tag.key === GLAS_JENA_BREADCRUMBS_KEY);

  for (let index = tags.length - 1; index >= 0; index--) {
    const tag = tags[index];
    if (!tag) {
      continue;
    }
    if (hasOwnBreadcrumbs && isShopBreadcrumbList(tag)) {
      tags.splice(index, 1);
    } else if (isSeoLink(tag)) {
      tag.props.href = toCanonicalUrl(tag.props.href as string);
    } else if (isOgUrl(tag)) {
      tag.props.content = toCanonicalUrl(tag.props.content as string);
    } else if (isJsonLd(tag) && tag.innerHTML) {
      tag.innerHTML = completeProductJsonLd(tag.innerHTML);
    }
  }
};
