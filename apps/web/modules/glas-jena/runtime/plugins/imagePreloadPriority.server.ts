import { prioritizeFirstImagePreload } from '../utils/imagePreload';

/* The first picture preload with a high fetch priority, in the server HTML only (LCP), see utils/imagePreload.ts */
export default defineNuxtPlugin(() => {
  injectHead().hooks?.hook('tags:resolve', ({ tags }) => prioritizeFirstImagePreload(tags));
});
