import { productImageGetters, type ImagesData } from '@plentymarkets/shop-api';

/**
 * The item's pictures with `fallback` (its name) as alternative text where PlentyONE has none. The original's
 * gallery and lightbox fall back to the file name, e.g. "77166004-NOVA-S.jpg", which screen readers read out and
 * search engines take as the picture's description (found in an SEO check, 2026-11-11). Pictures with their own
 * alternative text keep it; without a fallback all stay as they are.
 */
export const withImageAlternate = (images: ImagesData[], fallback: string) => {
  if (!fallback) {
    return images;
  }
  return images.map((image) => {
    if (productImageGetters.getImageAlternate(image)) {
      return image;
    }
    const names = Array.isArray(image.names) ? { imageId: 0, lang: '', name: '' } : image.names;
    return { ...image, names: { ...names, alternate: fallback } };
  });
};
