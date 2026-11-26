import { FIRST_IMAGE_PRELOAD_PRIORITY, prioritizeFirstImagePreload } from '../imagePreload';
import type { HeadTagLike } from '../types';

const imagePreload = (href: string, extra: Record<string, string> = {}): HeadTagLike => ({
  tag: 'link',
  props: { rel: 'preload', as: 'image', href, ...extra },
});

describe('imagePreload', () => {
  it('should give only the first picture preload a high fetch priority', () => {
    const tags: HeadTagLike[] = [
      { tag: 'link', props: { rel: 'modulepreload', href: '/_nuxt/entry.js' } },
      { tag: 'link', props: { rel: 'preload', as: 'font', href: '/font.woff2' } },
      imagePreload('/first.webp'),
      imagePreload('/second.webp'),
    ];

    prioritizeFirstImagePreload(tags);

    expect(tags[2]?.props.fetchpriority).toBe(FIRST_IMAGE_PRELOAD_PRIORITY);
    expect(tags[3]?.props.fetchpriority).toBeUndefined();
    expect(tags[0]?.props.fetchpriority).toBeUndefined();
    expect(tags[1]?.props.fetchpriority).toBeUndefined();
  });

  it('should keep a fetch priority that the preload already has', () => {
    const tags: HeadTagLike[] = [imagePreload('/first.webp', { fetchpriority: 'low' })];

    prioritizeFirstImagePreload(tags);

    expect(tags[0]?.props.fetchpriority).toBe('low');
  });

  it('should leave pages without picture preloads alone', () => {
    const tags: HeadTagLike[] = [{ tag: 'meta', props: { name: 'robots', content: 'all' } }];

    prioritizeFirstImagePreload(tags);

    expect(tags).toEqual([{ tag: 'meta', props: { name: 'robots', content: 'all' } }]);
  });
});
