import { flushPromises, type VueWrapper } from '@vue/test-utils';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaMobileNavigation from '../GlasJenaMobileNavigation.vue';
import { navigationCategoriesFixture } from './navigation.fixture';

mockNuxtImport('useCategoryTree', () => () => ({ data: ref([]), getCategoryTree: vi.fn() }));
mockNuxtImport('useLocalizedPath', () => () => (path: string) => path);
mockNuxtImport('useLocalization', () => () => ({
  buildCategoryMenuLink: (category: { id: number }) => `/category/${category.id}`,
  getAvailableLocales: () => ['de', 'en'],
  switchLocale: vi.fn(),
}));

/*
 * Every instance follows the shared useMegaMenu() state and traps the focus while open, so instances
 * left over from earlier tests would open along and pull the focus. Unmount them after each test.
 */
const mounted: VueWrapper[] = [];

const mountClosedMenu = async (attachTo?: HTMLElement) => {
  const wrapper = await mountSuspended(GlasJenaMobileNavigation, {
    props: { categories: navigationCategoriesFixture },
    attachTo,
    global: { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  });
  mounted.push(wrapper);
  return wrapper;
};

const mountMenu = async () => {
  const wrapper = await mountClosedMenu();
  useMegaMenu().open();
  await nextTick();
  return wrapper;
};

/* v-show hides via inline `display: none`; isVisible() cannot see that on a detached element */
const isShown = (wrapper: VueWrapper, testId: string) => {
  const element = wrapper.find(`[data-testid="${testId}"]`);
  return element.exists() && (element.element as HTMLElement).style.display !== 'none';
};

const visibleLinkTexts = (wrapper: VueWrapper, level: string) =>
  wrapper
    .findAll(`[data-testid="gj-mobile-nav-level-${level}"] [data-testid="gj-mobile-nav-link"]`)
    .map((link) => link.text());

const clickNext = async (wrapper: VueWrapper, name: string) => {
  const button = wrapper
    .findAll('[data-testid="gj-mobile-nav-next"]')
    .find((candidate) => candidate.attributes('aria-label')?.endsWith(`- ${name}`));
  await button?.trigger('click');
};

describe('GlasJenaMobileNavigation', () => {
  afterEach(() => {
    useMegaMenu().close();
    mounted.splice(0).forEach((wrapper) => wrapper.unmount());
  });

  it('should render the links of all levels while the menu is closed', async () => {
    const wrapper = await mountClosedMenu();

    const hrefs = wrapper.findAll('[data-testid="gj-mobile-nav-link"]').map((link) => link.attributes('href'));

    expect(hrefs).toEqual(expect.arrayContaining(['/category/1', '/category/12', '/category/121', '/category/1212']));
    expect(isShown(wrapper, 'gj-mobile-nav')).toBe(false);
  });

  it('should open at the main categories when no category is active', async () => {
    const wrapper = await mountMenu();

    expect(isShown(wrapper, 'gj-mobile-nav')).toBe(true);
    expect(isShown(wrapper, 'gj-mobile-nav-level-root')).toBe(true);
    expect(visibleLinkTexts(wrapper, 'root')).toEqual(['Tee & Kaffee', 'Diverses']);
  });

  it('should show the subcategories and the breadcrumbs when moving down a level', async () => {
    const wrapper = await mountMenu();

    await clickNext(wrapper, 'Tee & Kaffee');
    await clickNext(wrapper, 'Teekannen');

    expect(isShown(wrapper, 'gj-mobile-nav-level-root')).toBe(false);
    expect(isShown(wrapper, 'gj-mobile-nav-level-12')).toBe(true);
    expect(visibleLinkTexts(wrapper, '12')).toEqual(['mit Glasfilter', 'Leuchtkannen']);
    expect(wrapper.find('[data-testid="gj-mobile-nav-crumbs"]').text()).toContain('Tee & Kaffee');
    expect(wrapper.find('[data-testid="gj-mobile-nav-crumbs"]').text()).toContain('Teekannen');
  });

  it('should go back one level with the level-up button', async () => {
    const wrapper = await mountMenu();
    await clickNext(wrapper, 'Tee & Kaffee');
    await clickNext(wrapper, 'Teekannen');

    await wrapper.find('[data-testid="gj-mobile-nav-level-12"] .gj-mnav__up').trigger('click');

    expect(isShown(wrapper, 'gj-mobile-nav-level-1')).toBe(true);
    expect(isShown(wrapper, 'gj-mobile-nav-level-12')).toBe(false);
  });

  it('should list login and registration in the account view for guests', async () => {
    const wrapper = await mountMenu();

    await wrapper.find('[data-testid="gj-mobile-nav-account"]').trigger('click');

    const entries = wrapper
      .findAll('[data-testid="gj-mobile-nav-account-list"] .gj-mnav__item')
      .map((item) => item.text());
    expect(entries).toHaveLength(3);
    expect(isShown(wrapper, 'gj-mobile-nav-level-root')).toBe(false);
  });

  it('should list every shop language in its own name', async () => {
    const wrapper = await mountMenu();

    await wrapper.find('[data-testid="gj-mobile-nav-language"]').trigger('click');

    const languages = wrapper
      .findAll('[data-testid="gj-mobile-nav-language-list"] .gj-mnav__item')
      .map((item) => item.text());
    expect(languages).toEqual(['Deutsch', 'English']);
  });

  it('should add a history entry while open and close on the back button', async () => {
    await mountMenu();

    expect(window.history.state?.gjMobileMenu).toBe(true);

    window.history.replaceState({}, '');
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    await nextTick();

    expect(useMegaMenu().isOpen.value).toBe(false);
  });

  it('should move the focus to the close button when opening', async () => {
    await mountClosedMenu(document.body);

    useMegaMenu().open();
    await flushPromises();

    expect(document.activeElement?.getAttribute('data-testid')).toBe('gj-mobile-nav-close');
  });

  it('should close the menu and navigate when a category link is tapped', async () => {
    const wrapper = await mountMenu();
    const push = vi.spyOn(useRouter(), 'push').mockResolvedValue(undefined);
    window.history.replaceState({}, '');

    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    wrapper.find('[data-testid="gj-mobile-nav-link"]').element.dispatchEvent(click);
    await flushPromises();

    expect(click.defaultPrevented).toBe(true);
    expect(useMegaMenu().isOpen.value).toBe(false);
    expect(push).toHaveBeenCalledWith('/category/1');
    push.mockRestore();
  });

  it('should close the menu with the close button', async () => {
    const wrapper = await mountMenu();

    await wrapper.find('[data-testid="gj-mobile-nav-close"]').trigger('click');

    expect(useMegaMenu().isOpen.value).toBe(false);
  });
});
