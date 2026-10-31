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

/* Stand-in for the lightbox: only its `open` and the `close` event matter here */
const openLightbox = vi.fn();
const LightboxStub = { template: '<div data-testid="lightbox-stub" />', methods: { open: openLightbox } };

const mountGallery = (count: number) =>
  mountSuspended(GlasJenaGallery, {
    props: { images: Array.from({ length: count }, () => ({}) as ImagesData) },
    global: { stubs: { Gallery: GalleryStub, GlasJenaLightbox: LightboxStub } },
  });

describe('GlasJenaGallery', () => {
  beforeEach(() => {
    swiper.activeIndex = 0;
    swiper.slideTo.mockReset();
    openLightbox.mockReset();
  });

  it('should open the lightbox at the current picture on a click on the big picture or the keyboard button', async () => {
    const wrapper = await mountGallery(4);
    swiper.activeIndex = 2;

    await wrapper.find('[data-testid="gallery-images"]').trigger('click');
    expect(openLightbox).toHaveBeenLastCalledWith(2);

    await wrapper.find('[data-testid="gj-gallery-enlarge"]').trigger('click');
    expect(openLightbox).toHaveBeenCalledTimes(2);
  });

  it('should not open the lightbox on the arrows or after a drag (click marked as handled)', async () => {
    const wrapper = await mountGallery(4);

    await wrapper.find('[data-testid="gj-gallery-next"]').trigger('click');
    const dragEnd = new MouseEvent('click', { bubbles: true, cancelable: true });
    dragEnd.preventDefault();
    wrapper.find('[data-testid="gallery-images"]').element.dispatchEvent(dragEnd);

    expect(openLightbox).not.toHaveBeenCalled();
  });

  it('should show the picture last seen in the lightbox when it closes', async () => {
    const wrapper = await mountGallery(4);

    wrapper.findComponent(LightboxStub).vm.$emit('close', 3);

    expect(swiper.slideTo).toHaveBeenLastCalledWith(3);
  });

  it('should offer the lightbox for a single picture too', async () => {
    const wrapper = await mountGallery(1);

    expect(wrapper.find('[data-testid="gj-gallery-enlarge"]').exists()).toBe(true);
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
  it('should show the arrows only once their area is measured over the big picture (no layout shift)', async () => {
    const wrapper = await mountGallery(4);

    expect(wrapper.find('[data-testid="gj-gallery-nav"]').attributes('style')).not.toContain('display: none');

    const unmeasured = await mountSuspended(GlasJenaGallery, {
      props: { images: [{} as ImagesData] },
      global: { stubs: { Gallery: { template: '<div data-testid="gallery" />' }, GlasJenaLightbox: LightboxStub } },
    });

    expect(unmeasured.find('[data-testid="gj-gallery-nav"]').attributes('style')).toContain('display: none');
  });
});
