import { mount, type VueWrapper } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import GlasJenaNavigation from '../GlasJenaNavigation.vue';
import { navigationCategoriesFixture } from './navigation.fixture';

mockNuxtImport('useRouter', () => () => ({ afterEach: vi.fn(() => () => {}) }));
mockNuxtImport('useCategoryTree', () => () => ({ data: ref([]), getCategoryTree: vi.fn() }));
mockNuxtImport('useLocalizedPath', () => () => (path: string) => path);
mockNuxtImport('useLocalization', () => () => ({
  buildCategoryMenuLink: (category: { id: number }) => `/category/${category.id}`,
}));

const mountNavigation = () =>
  mount(GlasJenaNavigation, {
    props: { categories: navigationCategoriesFixture },
    global: { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  });

const menuTexts = (wrapper: VueWrapper, level: number) =>
  wrapper.findAll(`[data-testid="gj-nav-menu-${level}"] > li > a`).map((link) => link.text());

const linkByText = (wrapper: VueWrapper, text: string) => {
  const link = wrapper.findAll('a').find((candidate) => candidate.text() === text);
  if (!link) {
    throw new Error(`No navigation link "${text}"`);
  }
  return link.element;
};

const dispatchOnItem = async (wrapper: VueWrapper, text: string, type: 'mouseenter' | 'mouseleave') => {
  linkByText(wrapper, text).parentElement?.dispatchEvent(new MouseEvent(type));
  await nextTick();
};

describe('GlasJenaNavigation', () => {
  it('should render all main categories with their links', () => {
    const wrapper = mountNavigation();

    const categories = wrapper.findAll('[data-testid="gj-nav-category"]');

    expect(categories.map((link) => link.text())).toEqual(['Tee & Kaffee', 'Diverses']);
    expect(categories[0]?.attributes('href')).toBe('/category/1');
  });

  it('should open the dropdown when hovering a main category', async () => {
    const wrapper = mountNavigation();

    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseenter');

    expect(menuTexts(wrapper, 2)).toEqual(['Kaffee & mehr', 'Teekannen']);
  });

  it('should cascade flyouts down to the fourth level on hover', async () => {
    const wrapper = mountNavigation();

    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseenter');
    await dispatchOnItem(wrapper, 'Teekannen', 'mouseenter');
    await dispatchOnItem(wrapper, 'mit Glasfilter', 'mouseenter');

    expect(menuTexts(wrapper, 3)).toEqual(['mit Glasfilter', 'Leuchtkannen']);
    expect(menuTexts(wrapper, 4)).toEqual(['kleiner 1 L', 'größer 1 L']);
  });

  it('should close the dropdown when the mouse leaves the category', async () => {
    const wrapper = mountNavigation();

    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseenter');
    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseleave');

    expect(wrapper.find('[data-testid="gj-nav-menu-2"]').exists()).toBe(false);
  });

  it('should open the dropdown on the first tap on touch devices instead of following the link', async () => {
    const wrapper = mountNavigation();

    await wrapper.find('[data-testid="gj-nav"]').trigger('pointerdown', { pointerType: 'touch' });
    const click = new MouseEvent('click', { cancelable: true, bubbles: true });
    linkByText(wrapper, 'Tee & Kaffee').dispatchEvent(click);
    await nextTick();

    expect(click.defaultPrevented).toBe(true);
    expect(menuTexts(wrapper, 2)).toEqual(['Kaffee & mehr', 'Teekannen']);
  });

  it('should close the dropdown when Escape is pressed', async () => {
    const wrapper = mountNavigation();

    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseenter');
    await wrapper.find('[data-testid="gj-nav"]').trigger('keydown', { key: 'Escape' });

    expect(wrapper.find('[data-testid="gj-nav-menu-2"]').exists()).toBe(false);
  });
});
