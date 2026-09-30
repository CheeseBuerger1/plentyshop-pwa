import type { GlasJenaHeroImageSource, GlasJenaHeroImageSources } from '../components/blocks/GlasJenaHeroImage/types';

/** Editor blocks of the module for the home page (the name is also the component's file name). */
export const HERO_IMAGE_BLOCK_NAME = 'GlasJenaHeroImage';
export const TILE_BLOCK_NAME = 'GlasJenaTile';
export const PRODUCT_CAROUSEL_BLOCK_NAME = 'GlasJenaProductCarousel';

/**
 * Images of the LTS shop's home page, from the shop's webspace on the PlentyONE CDN (independent of the shop
 * domain, so they stay reachable after the switch to the PWA). Defaults of the new blocks.
 */
const LTS_LAYOUT_URL = 'https://cdn02.plentyone.com/atgu0g2nr01z/frontend/layout';
export const LTS_HERO_IMAGE_URLS = {
  mobile: `${LTS_LAYOUT_URL}/Grafiken/slider-01-501.jpg`,
  large: `${LTS_LAYOUT_URL}/Grafiken/slider-01-1001.jpg`,
};
export const LTS_FACTORY_OUTLET_IMAGE_URL = `${LTS_LAYOUT_URL}/werksverkauf.jpg`;

/**
 * Colours of the home page tiles. Text grey and green of the LTS shop (6.03:1). The blue tile has white text: the
 * LTS mid blue #6e9abb reaches only 3.00:1 with it (needed 4.5:1), so it is darkened to 4.57:1.
 */
export const TILE_DEFAULT_TEXT_COLOR = '#555555';
export const TILE_GREEN = '#dcedc8';
export const TILE_BLUE = '#4b7aa0';
export const TILE_BLUE_TEXT_COLOR = '#ffffff';

/**
 * Category tiles of the LTS shop: background colours as measured (the LTS pictures have them as background), titles
 * in the LTS hues darkened to at least 3:1 for large text (LTS: 2.24:1, 2.30:1 and 2.64:1).
 */
export const CATEGORY_TILES = {
  tea: { background: '#abcae4', title: '#4d6f89', image: `${LTS_LAYOUT_URL}/highlight-tee.jpg` },
  kitchen: { background: '#d6e3ed', title: '#5681ab', image: `${LTS_LAYOUT_URL}/highlight-kueche.jpg` },
  health: { background: '#d1c4e9', title: '#8a5c99', image: `${LTS_LAYOUT_URL}/highlight-gesundheit.jpg` },
};

/**
 * Upper window widths of the image sizes, like the shop's breakpoints: phones below 768 px, tablets below 1024 px,
 * desktops below 1440 px; the wide screen image is the picture's fallback.
 */
const SOURCE_MAX_WIDTHS: { size: keyof GlasJenaHeroImageSources; maxWidth: number }[] = [
  { size: 'mobile', maxWidth: 767 },
  { size: 'tablet', maxWidth: 1023 },
  { size: 'desktop', maxWidth: 1439 },
];

const SIZES_LARGEST_FIRST: (keyof GlasJenaHeroImageSources)[] = ['wideScreen', 'desktop', 'tablet', 'mobile'];

const clean = (url: string | undefined) => url?.trim() ?? '';

/**
 * Image for a size: the one set for it, otherwise the next larger size (a larger image still looks sharp),
 * otherwise the next smaller one. Empty if no image is set at all.
 */
export const resolveHeroImageUrl = (images: GlasJenaHeroImageSources, size: keyof GlasJenaHeroImageSources) => {
  const index = SIZES_LARGEST_FIRST.indexOf(size);
  const larger = SIZES_LARGEST_FIRST.slice(0, index + 1).reverse();
  const smaller = SIZES_LARGEST_FIRST.slice(index + 1);
  const found = [...larger, ...smaller].map((key) => clean(images[key])).find((url) => url.length > 0);
  return found ?? '';
};

/**
 * `<source>` entries of the picture (smallest window first, as the browser takes the first match). Sizes that
 * would repeat the image of the next larger size are left out.
 */
export const getHeroImageSources = (images: GlasJenaHeroImageSources): GlasJenaHeroImageSource[] => {
  const fallback = resolveHeroImageUrl(images, 'wideScreen');
  return SOURCE_MAX_WIDTHS.map(({ size, maxWidth }, index) => {
    const url = resolveHeroImageUrl(images, size);
    const next = SOURCE_MAX_WIDTHS[index + 1];
    const nextUrl = next ? resolveHeroImageUrl(images, next.size) : fallback;
    return url && url !== nextUrl ? { maxWidth, url } : undefined;
  }).filter((source): source is GlasJenaHeroImageSource => source !== undefined);
};

/**
 * Item carousel of the home page ("Unsere Topseller"): sort keys of the shop's item search. Random like the LTS
 * shop, whose top seller list comes in a different order on every page load. The labels are translation keys of the
 * editor form.
 */
export const PRODUCT_CAROUSEL_SORT_RANDOM = 'item.random';
export const PRODUCT_CAROUSEL_SORT_OPTIONS = [
  { value: PRODUCT_CAROUSEL_SORT_RANDOM, label: 'sort-random' },
  { value: 'default.recommended_sorting', label: 'sort-recommended' },
  { value: 'texts.name1_asc', label: 'sort-name' },
  { value: 'sorting.price.avg_asc', label: 'sort-price-asc' },
  { value: 'sorting.price.avg_desc', label: 'sort-price-desc' },
  { value: 'variation.createdAt_desc', label: 'sort-newest' },
];
export const PRODUCT_CAROUSEL_MAX_ITEMS = 50;
/** The hidden PlentyONE category "Topseller" / "Top sellers" (created for the home page). */
export const TOP_SELLER_CATEGORY_ID = '385';

/** Number of items to fetch: a whole number from 1 to the maximum, the maximum if unset or invalid. */
export const clampCarouselItems = (value: unknown) => {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 1) {
    return PRODUCT_CAROUSEL_MAX_ITEMS;
  }
  return Math.min(number, PRODUCT_CAROUSEL_MAX_ITEMS);
};
