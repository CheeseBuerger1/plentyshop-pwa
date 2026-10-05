import type {
  GlasJenaHeroImageContent,
  GlasJenaHeroSlide,
  GlasJenaHeroSlideImage,
} from '../components/blocks/GlasJenaHeroImage/types';

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

/** Image sequence of the home page: pictures in the webspace folder `Grafiken/slider`, each 500, 800 and 1000 px wide. */
const HERO_SLIDER_URL = `${LTS_LAYOUT_URL}/Grafiken/slider`;
export const getHeroSliderImageUrls = (number: number) => {
  const name = `${HERO_SLIDER_URL}/slider-${String(number).padStart(2, '0')}`;
  return { small: `${name}-501.jpg`, medium: `${name}-801.jpg`, large: `${name}-1001.jpg` };
};

/** Seconds each image of the sequence stays (as requested by the shop owner), and the shortest time allowed. */
export const HERO_SLIDER_DEFAULT_INTERVAL = 20;
export const HERO_SLIDER_MIN_INTERVAL = 3;

/** Width of each image size in pixels, for the `srcset` (the browser picks by window width and pixel density). */
const HERO_SLIDE_WIDTHS: { size: keyof Omit<GlasJenaHeroSlide, 'alt'>; width: number }[] = [
  { size: 'small', width: 500 },
  { size: 'medium', width: 800 },
  { size: 'large', width: 1000 },
];

/**
 * Display width of the image for the browser's choice: the whole window below 992 px (stacked), next to the
 * "Did you know" box two thirds of the window, at most 800 px (8 of 12 columns of the 1200 px box).
 */
export const HERO_SLIDE_SIZES = '(min-width: 992px) min(66.67vw, 800px), 100vw';

const clean = (url: string | undefined) => url?.trim() ?? '';

/**
 * The images of the block: the sequence, or the single image of the block's first version (its sizes read as large,
 * medium and small image).
 */
export const getHeroSlides = (content: GlasJenaHeroImageContent | undefined): GlasJenaHeroSlide[] => {
  if (content?.slides?.length) {
    return content.slides;
  }
  const image = content?.image;
  if (!image) {
    return [];
  }
  const large = clean(image.wideScreen) || clean(image.desktop) || clean(image.tablet) || clean(image.mobile);
  const medium = clean(image.tablet) !== large ? clean(image.tablet) : '';
  return [{ large, medium, small: clean(image.mobile), alt: image.alt }];
};

/**
 * A slide ready to render, or `undefined` without any image: the largest image as `src`, all sizes with their widths
 * as `srcset` (each URL once).
 */
export const getHeroSlideImage = (slide: GlasJenaHeroSlide): GlasJenaHeroSlideImage | undefined => {
  const sizes = HERO_SLIDE_WIDTHS.map(({ size, width }) => ({ url: clean(slide[size]), width })).filter(
    ({ url }, index, all) => url && all.findIndex((other) => other.url === url) === index,
  );
  const largest = sizes.at(-1);
  if (!largest) {
    return undefined;
  }
  return {
    src: largest.url,
    srcset: sizes.length > 1 ? sizes.map(({ url, width }) => `${url} ${width}w`).join(', ') : '',
    alt: slide.alt?.trim() ?? '',
  };
};

/** Seconds per image: a whole number of at least the minimum, the default if unset or invalid. */
export const clampHeroSliderInterval = (value: unknown) => {
  const seconds = Math.round(Number(value));
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return HERO_SLIDER_DEFAULT_INTERVAL;
  }
  return Math.max(seconds, HERO_SLIDER_MIN_INTERVAL);
};

/**
 * Index of the image the sequence starts with: a random one of those that have a picture (as requested by the shop
 * owner), 0 if there is none.
 */
export const pickHeroStartIndex = (images: unknown[], random = Math.random) => {
  const available = images.flatMap((image, index) => (image ? [index] : []));
  return available[Math.floor(random() * available.length)] ?? 0;
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

/*
 * Search engine title and description of the home page per language. The editor's SEO defaults (title, meta
 * description) apply to all languages alike, so the home page would show the German texts in English as well. These
 * texts replace them on the home page only; languages without an entry (German) keep the editor's defaults. The
 * title is shown with the shop name behind it ("… | OnlineMarket -GLAS in JENA-").
 */
export const HOME_SEO_TEXTS = {
  en: {
    title: 'Heat resistant glass from Jena',
    description:
      'Heat resistant borosilicate glass made in Germany: teapots, cups, storage jars and kitchen helpers from the manufacturer in Jena – with factory outlet.',
  },
} as const;

/** Home page title and description for a language, `undefined` if the editor's SEO defaults apply. */
export const getHomeSeoTexts = (locale: string) =>
  Object.hasOwn(HOME_SEO_TEXTS, locale) ? HOME_SEO_TEXTS[locale as keyof typeof HOME_SEO_TEXTS] : undefined;
