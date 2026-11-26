import type { HeadTagLike } from './types';

/** Fetch priority of the first picture preload, see prioritizeFirstImagePreload. */
export const FIRST_IMAGE_PRELOAD_PRIORITY = 'high';

const isImagePreload = ({ tag, props }: HeadTagLike) =>
  tag === 'link' && props.rel === 'preload' && props.as === 'image';

/**
 * Gives the first picture preload of the page `fetchpriority="high"` (LCP). The shop's item card has NuxtImg preload
 * its first pictures (`:preload="priority"` in ProductCard.vue), but without a fetch priority, so the browser loads
 * them with low priority behind the many script preloads of the page. The first one is the picture that shows largest
 * at the top of a category page (mobile: one card per row). A preload that already has a fetch priority stays as it is.
 */
export const prioritizeFirstImagePreload = (tags: HeadTagLike[]) => {
  const first = tags.find(isImagePreload);
  if (first && !first.props.fetchpriority) {
    first.props.fetchpriority = FIRST_IMAGE_PRELOAD_PRIORITY;
  }
};
