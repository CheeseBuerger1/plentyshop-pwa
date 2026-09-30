import { mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaHeroImage from '../GlasJenaHeroImage.vue';
import type { GlasJenaHeroImageContent } from '../types';

const mountHeroImage = (content: GlasJenaHeroImageContent) =>
  mountSuspended(GlasJenaHeroImage, {
    props: { name: 'GlasJenaHeroImage', type: 'content', meta: { uuid: 'hero' }, content },
  });

describe('GlasJenaHeroImage', () => {
  it('should show the large image with its alternative text', async () => {
    const wrapper = await mountHeroImage({ image: { wideScreen: 'large.jpg', alt: 'Tea pot' } });
    const image = wrapper.find('[data-testid="gj-hero-image-img"]');

    expect(image.attributes('src')).toBe('large.jpg');
    expect(image.attributes('alt')).toBe('Tea pot');
  });

  it('should offer the phone image for small windows', async () => {
    const wrapper = await mountHeroImage({ image: { wideScreen: 'large.jpg', mobile: 'small.jpg', alt: '' } });
    const sources = wrapper.findAll('[data-testid="gj-hero-image-source"]');

    expect(sources).toHaveLength(1);
    expect(sources[0]?.attributes('media')).toBe('(max-width: 767px)');
    expect(sources[0]?.attributes('srcset')).toBe('small.jpg');
  });

  it('should render no image without any image URL', async () => {
    const wrapper = await mountHeroImage({ image: { alt: 'Tea pot' } });

    expect(wrapper.find('[data-testid="gj-hero-image"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-hero-image-img"]').exists()).toBe(false);
  });
});
