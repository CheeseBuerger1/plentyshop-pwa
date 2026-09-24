import { flushPromises, type VueWrapper } from '@vue/test-utils';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaNavigation from '../GlasJenaNavigation.vue';
import { NAVIGATION_HOVER_DELAY_MS } from '../../utils/navigation';
import { navigationCategoriesFixture } from './navigation.fixture';

mockNuxtImport('useCategoryTree', () => () => ({ data: ref([]), getCategoryTree: vi.fn() }));
mockNuxtImport('useLocalizedPath', () => () => (path: string) => path);
mockNuxtImport('useLocalization', () => () => ({
  buildCategoryMenuLink: (category: { id: number }) => `/category/${category.id}`,
}));

const mountNavigation = () =>
  mountSuspended(GlasJenaNavigation, {
    props: { categories: navigationCategoriesFixture },
    global: { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  });

const menu = (wrapper: VueWrapper, level: number) => wrapper.find(`[data-testid="gj-nav-menu-${level}"]`);

/* v-show hides via inline `display: none`; isVisible() cannot see that on a detached element */
const isMenuShown = (wrapper: VueWrapper, level: number) =>
  menu(wrapper, level).exists() && (menu(wrapper, level).element as HTMLElement).style.display !== 'none';

const menuTexts = (wrapper: VueWrapper, level: number) =>
  Array.from(menu(wrapper, level).element.children).map((item) => item.querySelector('a')?.textContent?.trim());

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

const waitForHoverDelay = async () => {
  vi.advanceTimersByTime(NAVIGATION_HOVER_DELAY_MS);
  await nextTick();
};

describe('GlasJenaNavigation', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render all main categories with their links', async () => {
    const wrapper = await mountNavigation();

    const categories = wrapper.findAll('[data-testid="gj-nav-category"]');

    expect(categories.map((link) => link.text())).toEqual(['Tee & Kaffee', 'Diverses']);
    expect(categories[0]?.attributes('href')).toBe('/category/1');
  });

  it('should render the links of all levels while the menus are closed', async () => {
    const wrapper = await mountNavigation();

    const hrefs = wrapper.findAll('a').map((link) => link.attributes('href'));

    expect(hrefs).toEqual(expect.arrayContaining(['/category/12', '/category/121', '/category/1212']));
    expect(isMenuShown(wrapper, 2)).toBe(false);
  });

  it('should open the dropdown when hovering a main category', async () => {
    const wrapper = await mountNavigation();

    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseenter');

    expect(isMenuShown(wrapper, 2)).toBe(true);
    expect(menuTexts(wrapper, 2)).toEqual(['Kaffee & mehr', 'Teekannen']);
  });

  it('should cascade flyouts down to the fourth level on hover', async () => {
    const wrapper = await mountNavigation();

    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseenter');
    await dispatchOnItem(wrapper, 'Teekannen', 'mouseenter');
    await dispatchOnItem(wrapper, 'mit Glasfilter', 'mouseenter');

    expect(isMenuShown(wrapper, 3)).toBe(true);
    expect(isMenuShown(wrapper, 4)).toBe(true);
    expect(menuTexts(wrapper, 3)).toEqual(['mit Glasfilter', 'Leuchtkannen']);
    expect(menuTexts(wrapper, 4)).toEqual(['kleiner 1 L', 'größer 1 L']);
  });

  it('should keep a flyout open while the pointer briefly crosses a sibling item', async () => {
    const wrapper = await mountNavigation();
    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseenter');
    await dispatchOnItem(wrapper, 'Teekannen', 'mouseenter');
    vi.useFakeTimers();

    await dispatchOnItem(wrapper, 'Teekannen', 'mouseleave');
    await dispatchOnItem(wrapper, 'Kaffee & mehr', 'mouseenter');
    await dispatchOnItem(wrapper, 'Kaffee & mehr', 'mouseleave');
    await dispatchOnItem(wrapper, 'Teekannen', 'mouseenter');
    await waitForHoverDelay();

    expect(isMenuShown(wrapper, 3)).toBe(true);
  });

  it('should switch to a sibling item after the hover delay', async () => {
    const wrapper = await mountNavigation();
    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseenter');
    await dispatchOnItem(wrapper, 'Teekannen', 'mouseenter');
    vi.useFakeTimers();

    await dispatchOnItem(wrapper, 'Teekannen', 'mouseleave');
    await dispatchOnItem(wrapper, 'Kaffee & mehr', 'mouseenter');

    expect(isMenuShown(wrapper, 3)).toBe(true);

    await waitForHoverDelay();

    expect(isMenuShown(wrapper, 3)).toBe(false);
  });

  it('should close the dropdown shortly after the mouse leaves the category', async () => {
    const wrapper = await mountNavigation();
    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseenter');
    vi.useFakeTimers();

    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseleave');

    expect(isMenuShown(wrapper, 2)).toBe(true);

    await waitForHoverDelay();

    expect(isMenuShown(wrapper, 2)).toBe(false);
  });

  it('should open the dropdown on the first tap on touch devices instead of following the link', async () => {
    const wrapper = await mountNavigation();

    const touch = new MouseEvent('pointerdown', { bubbles: true });
    Object.defineProperty(touch, 'pointerType', { value: 'touch' });
    wrapper.find('[data-testid="gj-nav"]').element.dispatchEvent(touch);
    const click = new MouseEvent('click', { cancelable: true, bubbles: true });
    linkByText(wrapper, 'Tee & Kaffee').dispatchEvent(click);
    await nextTick();

    expect(click.defaultPrevented).toBe(true);
    expect(isMenuShown(wrapper, 2)).toBe(true);
  });

  describe('keyboard', () => {
    const mountAttached = () =>
      mountSuspended(GlasJenaNavigation, {
        props: { categories: navigationCategoriesFixture },
        attachTo: document.body,
        global: { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
      });

    const press = async (key: string) => {
      document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await flushPromises();
    };

    const focusedText = () => document.activeElement?.textContent?.trim();

    it('should move along the main bar with the left and right arrow keys', async () => {
      const wrapper = await mountAttached();
      linkByText(wrapper, 'Tee & Kaffee').focus();

      await press('ArrowRight');

      expect(focusedText()).toBe('Diverses');

      await press('ArrowRight');

      expect(focusedText()).toBe('Tee & Kaffee');
      wrapper.unmount();
    });

    it('should open flyouts with the arrow keys and return with ArrowLeft', async () => {
      const wrapper = await mountAttached();
      linkByText(wrapper, 'Tee & Kaffee').focus();

      await press('ArrowDown');
      expect(focusedText()).toBe('Kaffee & mehr');

      await press('ArrowDown');
      await press('ArrowRight');
      expect(focusedText()).toBe('mit Glasfilter');
      expect(isMenuShown(wrapper, 3)).toBe(true);

      await press('ArrowLeft');
      expect(focusedText()).toBe('Teekannen');
      expect(isMenuShown(wrapper, 3)).toBe(false);
      wrapper.unmount();
    });

    it('should keep the dropdown closed when Escape returns the focus to the main category', async () => {
      const wrapper = await mountAttached();
      linkByText(wrapper, 'Tee & Kaffee').focus();
      await press('ArrowDown');

      await press('Escape');

      expect(focusedText()).toBe('Tee & Kaffee');
      expect(isMenuShown(wrapper, 2)).toBe(false);
      wrapper.unmount();
    });
  });

  it('should close the dropdown when Escape is pressed', async () => {
    const wrapper = await mountNavigation();

    await dispatchOnItem(wrapper, 'Tee & Kaffee', 'mouseenter');
    await wrapper.find('[data-testid="gj-nav"]').trigger('keydown', { key: 'Escape' });

    expect(isMenuShown(wrapper, 2)).toBe(false);
  });
});
