import type { GlasJenaHeroImageSource, GlasJenaHeroImageSources } from '../components/blocks/GlasJenaHeroImage/types';

/** Editor blocks of the module for the home page (the name is also the component's file name). */
export const HERO_IMAGE_BLOCK_NAME = 'GlasJenaHeroImage';
export const TILE_BLOCK_NAME = 'GlasJenaTile';

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
