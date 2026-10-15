import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { ImagesData } from '@plentymarkets/shop-api';
import GlasJenaGallery from '../GlasJenaGallery.vue';

/* Stand-in for the shop's gallery: the big picture with a Swiper element that carries its instance like Swiper */
const swiper = { activeIndex: 0, slides: [{}, {}, {}, {}], slideTo: vi.fn() };
const GalleryStub = {
  props: ['images', 'configuration'],
  template:
    '<div data-testid="gallery"><div data-testid="gallery-images"><div class="swiper" ref="swiperEl" /></div></div>',
  mounted(this: { $refs: { swiperEl: HTMLElement & { swiper?: typeof swiper } } }) {
    this.$refs.swiperEl.swiper = swiper;
  },
};

const mountGallery = (count: number) =>
  mountSuspended(GlasJenaGallery, {
    props: { images: Array.from({ length: count }, () => ({}) as ImagesData) },
    global: { stubs: { Gallery: GalleryStub } },
  });

describe('GlasJenaGallery', () => {
  beforeEach(() => {
    swiper.activeIndex = 0;
    swiper.slideTo.mockReset();
  });

  it('should show labelled arrows on the big picture for more than one picture', async () => {
    const wrapper = await mountGallery(4);

    expect(wrapper.find('[data-testid="gj-gallery-previous"]').attributes('aria-label')).toBeTruthy();
    expect(wrapper.find('[data-testid="gj-gallery-next"]').attributes('aria-label')).toBeTruthy();
  });

  it('should show no arrows for a single picture', async () => {
    const wrapper = await mountGallery(1);

    expect(wrapper.find('[data-testid="gj-gallery-next"]').exists()).toBe(false);
  });

  it('should page round in a loop', async () => {
    const wrapper = await mountGallery(4);

    await wrapper.find('[data-testid="gj-gallery-previous"]').trigger('click');
    expect(swiper.slideTo).toHaveBeenLastCalledWith(3);

    swiper.activeIndex = 3;
    await wrapper.find('[data-testid="gj-gallery-next"]').trigger('click');
    expect(swiper.slideTo).toHaveBeenLastCalledWith(0);

    swiper.activeIndex = 1;
    await wrapper.find('[data-testid="gj-gallery-next"]').trigger('click');
    expect(swiper.slideTo).toHaveBeenLastCalledWith(2);
  });
});
