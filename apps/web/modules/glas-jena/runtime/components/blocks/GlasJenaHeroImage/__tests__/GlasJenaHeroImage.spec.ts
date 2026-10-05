import { mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaHeroImage from '../GlasJenaHeroImage.vue';
import type { GlasJenaHeroImageContent } from '../types';

/* Each mount its own block id: the random start is kept per block in the app state */
let mountCount = 0;
const mountHeroImage = (content: GlasJenaHeroImageContent) =>
  mountSuspended(GlasJenaHeroImage, {
    props: { name: 'GlasJenaHeroImage', type: 'content', meta: { uuid: `hero-${mountCount++}` }, content },
  });

const SEQUENCE: GlasJenaHeroImageContent = {
  slides: [
    { large: 'a-1000.jpg', medium: 'a-800.jpg', small: 'a-500.jpg', alt: 'Tea pot' },
    { large: 'b-1000.jpg', alt: 'Tea cup' },
    { large: 'c-1000.jpg', alt: 'Salad' },
  ],
  interval: 30,
};

const setReducedMotion = (reduce: boolean) => {
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: reduce } as MediaQueryList);
};

const getCurrent = (wrapper: Awaited<ReturnType<typeof mountHeroImage>>) =>
  wrapper.find('.gj-hero-image__img--current');

describe('GlasJenaHeroImage', () => {
  beforeEach(() => {
    /* Only the slideshow's timer; Nuxt's own timers keep running for the mount */
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    setReducedMotion(false);
    /* Start with the first image unless a test chooses otherwise */
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should show the first image with all sizes and its alternative text', async () => {
    const wrapper = await mountHeroImage(SEQUENCE);
    const image = getCurrent(wrapper);

    expect(image.attributes('src')).toBe('a-1000.jpg');
    expect(image.attributes('srcset')).toBe('a-500.jpg 500w, a-800.jpg 800w, a-1000.jpg 1000w');
    expect(image.attributes('alt')).toBe('Tea pot');
  });

  it('should load the next image hidden and change to it after the set time, round in a loop', async () => {
    const wrapper = await mountHeroImage(SEQUENCE);
    const images = () => wrapper.findAll('[data-testid="gj-hero-image-img"]');

    expect(images()).toHaveLength(2);
    expect(images()[1]?.attributes('aria-hidden')).toBe('true');
    expect(images()[1]?.attributes('alt')).toBe('');

    await vi.advanceTimersByTimeAsync(30_000);
    expect(getCurrent(wrapper).attributes('alt')).toBe('Tea cup');
    expect(wrapper.find('.gj-hero-image__img--previous').attributes('src')).toBe('a-1000.jpg');

    await vi.advanceTimersByTimeAsync(60_000);
    expect(getCurrent(wrapper).attributes('alt')).toBe('Tea pot');
  });

  it('should start with a random image and continue from there', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const wrapper = await mountHeroImage(SEQUENCE);

    expect(getCurrent(wrapper).attributes('alt')).toBe('Salad');
    expect(getCurrent(wrapper).attributes('fetchpriority')).toBe('high');

    await vi.advanceTimersByTimeAsync(30_000);
    expect(getCurrent(wrapper).attributes('alt')).toBe('Tea pot');
  });

  it('should not change the image with "reduce motion"', async () => {
    setReducedMotion(true);
    const wrapper = await mountHeroImage(SEQUENCE);

    await vi.advanceTimersByTimeAsync(90_000);

    expect(getCurrent(wrapper).attributes('alt')).toBe('Tea pot');
    expect(wrapper.findAll('[data-testid="gj-hero-image-img"]')).toHaveLength(1);
  });

  it('should show the single image of the first block version', async () => {
    const wrapper = await mountHeroImage({ image: { wideScreen: 'large.jpg', mobile: 'small.jpg', alt: 'Tea pot' } });
    const image = getCurrent(wrapper);

    expect(image.attributes('src')).toBe('large.jpg');
    expect(image.attributes('srcset')).toBe('small.jpg 500w, large.jpg 1000w');
    expect(image.attributes('alt')).toBe('Tea pot');
  });

  it('should render no image without any image URL', async () => {
    const wrapper = await mountHeroImage({ image: { alt: 'Tea pot' } });

    expect(wrapper.find('[data-testid="gj-hero-image"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-hero-image-img"]').exists()).toBe(false);
  });
});
