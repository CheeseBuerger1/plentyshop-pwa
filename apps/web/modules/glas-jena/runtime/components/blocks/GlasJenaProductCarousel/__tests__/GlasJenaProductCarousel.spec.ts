import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import GlasJenaProductCarousel from '../GlasJenaProductCarousel.vue';
import type { GlasJenaProductCarouselContent } from '../types';

const { getFacet, pageState } = vi.hoisted(() => ({
  getFacet: vi.fn(),
  pageState: { product: {} as object, isEditMode: false },
}));

mockNuxtImport('useSdk', () => () => ({ plentysystems: { getFacet } }));
mockNuxtImport('useProducts', () => () => ({ currentProduct: ref(pageState.product) }));
mockNuxtImport('useEditorState', () => () => ({ isEditMode: ref(pageState.isEditMode) }));

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
    pageState.product = {};
    pageState.isEditMode = false;
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

  it('should show the spare parts of the product page item', async () => {
    pageState.product = { item: { id: 105075 } };
    const wrapper = await mountCarousel(
      { text: { title: 'Ersatzteile' }, source: { type: 'cross_selling', crossSellingRelation: 'ReplacementPart' } },
      'g',
    );

    expect(getFacet).toHaveBeenCalledWith({
      type: 'cross_selling',
      itemId: '105075',
      crossSellingRelation: 'ReplacementPart',
      itemsPerPage: 50,
      sort: 'default.recommended_sorting',
    });
    expect(wrapper.find('[data-testid="gj-product-carousel-title"]').text()).toBe('Ersatzteile');
    expect(wrapper.find('[data-testid="slider-stub"]').text()).toBe('3');
  });

  it('should leave out a cross-selling bar without items, except in the editor', async () => {
    pageState.product = { item: { id: 400408 } };
    getFacet.mockResolvedValue({ data: { products: [] } });
    const content: GlasJenaProductCarouselContent = {
      text: { title: 'Zubehör' },
      source: { type: 'cross_selling', crossSellingRelation: 'Accessory' },
    };

    const shop = await mountCarousel(content, 'h');
    expect(shop.find('[data-testid="gj-product-carousel"]').exists()).toBe(false);

    pageState.isEditMode = true;
    const editor = await mountCarousel(content, 'i');
    expect(editor.find('[data-testid="gj-product-carousel-title"]').text()).toBe('Zubehör');
  });

  it('should not fetch cross-selling items outside a product page', async () => {
    const wrapper = await mountCarousel({ text: { title: 'Zubehör' }, source: { type: 'cross_selling' } }, 'j');

    expect(getFacet).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="gj-product-carousel"]').exists()).toBe(false);
  });

  it('should count the items up to five for the arrows', async () => {
    const few = await mountCarousel({ text: {}, source: { categoryId: '385' } }, 'k');
    expect(few.find('.gj-product-carousel__slider').attributes('data-gj-items')).toBe('3');

    getFacet.mockResolvedValue({ data: { products: Array.from({ length: 7 }, (_, id) => ({ id })) } });
    const many = await mountCarousel({ text: {}, source: { categoryId: '12' } }, 'l');
    expect(many.find('.gj-product-carousel__slider').attributes('data-gj-items')).toBe('5');
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
