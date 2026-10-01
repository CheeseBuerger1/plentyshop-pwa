import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import GlasJenaProductCarousel from '../GlasJenaProductCarousel.vue';
import type { GlasJenaProductCarouselContent } from '../types';

const { getFacet } = vi.hoisted(() => ({ getFacet: vi.fn() }));

mockNuxtImport('useSdk', () => () => ({ plentysystems: { getFacet } }));

const mountCarousel = async (content: GlasJenaProductCarouselContent, uuid: string) => {
  const wrapper = await mountSuspended(GlasJenaProductCarousel, {
    props: { name: 'GlasJenaProductCarousel', type: 'content', meta: { uuid }, content },
    global: {
      stubs: {
        ProductSlider: {
          props: ['items'],
          template: '<div data-testid="slider-stub"><div data-testid="product-slider">{{ items.length }}</div></div>',
        },
      },
    },
  });
  await flushPromises();
  return wrapper;
};

describe('GlasJenaProductCarousel', () => {
  beforeEach(() => {
    getFacet.mockReset();
    getFacet.mockResolvedValue({ data: { products: [{ id: 1 }, { id: 2 }, { id: 3 }] } });
  });

  it('should show the heading as a level 2 heading and the items of the category', async () => {
    const wrapper = await mountCarousel({ text: { title: 'Unsere Topseller' }, source: { categoryId: '385' } }, 'a');
    const title = wrapper.find('[data-testid="gj-product-carousel-title"]');

    expect(title.element.tagName).toBe('H2');
    expect(title.text()).toBe('Unsere Topseller');
    expect(wrapper.find('[data-testid="slider-stub"]').text()).toBe('3');
  });

  it('should fetch the category in random order with up to 50 items by default', async () => {
    await mountCarousel({ text: { title: '' }, source: { categoryId: '385' } }, 'b');

    expect(getFacet).toHaveBeenCalledWith({
      type: 'category',
      categoryId: '385',
      itemsPerPage: 50,
      sort: 'item.random',
    });
  });

  it('should use the chosen order and limit the number of items to 50', async () => {
    await mountCarousel({ text: {}, source: { categoryId: '12', sort: 'texts.name1_asc', itemsPerPage: 80 } }, 'c');

    expect(getFacet).toHaveBeenCalledWith({
      type: 'category',
      categoryId: '12',
      itemsPerPage: 50,
      sort: 'texts.name1_asc',
    });
  });

  it('should show no slider without a category or without items', async () => {
    const withoutCategory = await mountCarousel({ text: { title: 'Topseller' }, source: {} }, 'd');
    expect(getFacet).not.toHaveBeenCalled();
    expect(withoutCategory.find('[data-testid="slider-stub"]').exists()).toBe(false);

    getFacet.mockResolvedValue({ data: { products: [] } });
    const empty = await mountCarousel({ text: { title: 'Topseller' }, source: { categoryId: '7' } }, 'e');
    expect(empty.find('[data-testid="slider-stub"]').exists()).toBe(false);
  });

  it('should page round in a loop with its own arrows', async () => {
    const wrapper = await mountCarousel({ text: { title: 'Topseller' }, source: { categoryId: '385' } }, 'f');
    const area = wrapper.find('[data-testid="product-slider"]').element as HTMLElement;
    Object.defineProperty(area, 'scrollWidth', { configurable: true, value: 1000 });
    Object.defineProperty(area, 'clientWidth', { configurable: true, value: 250 });
    area.scrollTo = vi.fn();
    area.scrollBy = vi.fn();

    area.scrollLeft = 0;
    await wrapper.find('[data-testid="gj-product-carousel-previous"]').trigger('click');
    expect(area.scrollTo).toHaveBeenCalledWith({ left: 750 });

    await wrapper.find('[data-testid="gj-product-carousel-next"]').trigger('click');
    expect(area.scrollBy).toHaveBeenCalledWith({ left: 250 });

    area.scrollLeft = 750;
    await wrapper.find('[data-testid="gj-product-carousel-next"]').trigger('click');
    expect(area.scrollTo).toHaveBeenLastCalledWith({ left: 0 });
  });
});
