import { flushPromises } from '@vue/test-utils';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaHeaderBlocks from '../GlasJenaHeaderBlocks.vue';
import { AUTH_VIEW_REGISTER } from '../../utils/accountMenu';

const { viewportState, editorState, headerState, localeState, customerState, switchLocale, toggleLanguageSelect } =
  vi.hoisted(() => ({
    /* current: the header's viewport state, so a test can change the window width after mounting */
    viewportState: { isDesktop: true, current: undefined as { value: boolean } | undefined },
    editorState: { isEditing: false },
    headerState: { sticky: false },
    localeState: { available: ['de', 'en'] },
    customerState: { isAuthorized: false },
    switchLocale: vi.fn(),
    toggleLanguageSelect: vi.fn(),
  }));

mockNuxtImport('useCustomer', () => () => ({ isAuthorized: ref(customerState.isAuthorized), logout: vi.fn() }));

mockNuxtImport('useViewport', () => () => {
  const isDesktop = ref(viewportState.isDesktop);
  viewportState.current = isDesktop;
  return {
    isGreaterOrEquals: () => isDesktop.value,
    isLessThan: () => !isDesktop.value,
  };
});
mockNuxtImport('useEditor', () => () => ({ isEditing: ref(editorState.isEditing) }));
mockNuxtImport('useBlocks', () => () => ({
  headerContainer: computed(() => ({ content: [], configuration: { layout: { sticky: headerState.sticky } } })),
}));
mockNuxtImport('useCategoryTree', () => () => ({ data: ref([]), getCategoryTree: vi.fn() }));
mockNuxtImport('useLocalization', () => () => ({
  getAvailableLocales: () => localeState.available,
  switchLocale,
  toggle: toggleLanguageSelect,
}));

/** vue-i18n's default locale; the test i18n instance in vitest.config.setup.ts sets none. */
const TEST_LOCALE = 'en-US';

const mountHeader = () =>
  mountSuspended(GlasJenaHeaderBlocks, {
    global: {
      stubs: {
        teleport: true,
        HeaderBlocks: { template: '<div data-testid="original-header" />' },
        GlasJenaNavigation: { template: '<nav data-testid="gj-nav" />' },
        /* Its "create an account" entry, see GlasJenaMobileNavigation.spec.ts */
        GlasJenaMobileNavigation: {
          emits: ['openLogin'],
          template: `<button data-testid="gj-mobile-nav" @click="$emit('openLogin', '${AUTH_VIEW_REGISTER}')" />`,
        },
        LanguageSelector: true,
        UiSearch: true,
        UiModal: { template: '<section><slot /></section>' },
        LoginComponent: {
          emits: ['loggedIn'],
          template: `<form data-testid="login-form" @submit.prevent="$emit('loggedIn')" />`,
        },
        Register: { template: '<form data-testid="register-form" />' },
      },
    },
  });

describe('GlasJenaHeaderBlocks', () => {
  afterEach(() => {
    viewportState.isDesktop = true;
    editorState.isEditing = false;
    headerState.sticky = false;
    localeState.available = ['de', 'en'];
    customerState.isAuthorized = false;
    useMegaMenu().close();
    vi.clearAllMocks();
  });

  it('should open the login dialog instead of the login page on a plain click on the account tile', async () => {
    const wrapper = await mountHeader();
    const tile = wrapper.get('[data-testid="gj-header-account"]');

    await tile.trigger('click', { button: 0 });

    expect(wrapper.find('[data-testid="gj-header-login-dialog"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true);
  });

  it('should open the account after logging in through the dialog', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    const wrapper = await mountHeader();
    await wrapper.get('[data-testid="gj-header-account"]').trigger('click', { button: 0 });

    await wrapper.get('[data-testid="login-form"]').trigger('submit');

    expect(assign).toHaveBeenCalledWith(expect.stringMatching(/\/my-account\/?$/));
    vi.unstubAllGlobals();
  });

  it('should open the dialog with the registration when a guest chooses it in the mobile menu', async () => {
    viewportState.isDesktop = false;
    const wrapper = await mountHeader();

    await wrapper.get('[data-testid="gj-mobile-nav"]').trigger('click');

    expect(wrapper.find('[data-testid="gj-header-login-dialog"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="register-form"]').exists()).toBe(true);
  });

  it('should keep the account tile a normal link for clicks with a modifier key', async () => {
    const wrapper = await mountHeader();

    await wrapper.get('[data-testid="gj-header-account"]').trigger('click', { button: 0, ctrlKey: true });

    expect(wrapper.find('[data-testid="gj-header-login-dialog"]').exists()).toBe(false);
  });

  it('should open the account menu with the account pages and log out when signed in', async () => {
    customerState.isAuthorized = true;
    const wrapper = await mountHeader();
    const tile = wrapper.get('[data-testid="gj-header-account"]');

    expect(tile.attributes('aria-expanded')).toBe('false');

    await tile.trigger('click');

    expect(tile.attributes('aria-expanded')).toBe('true');
    const menu = wrapper.get('[data-testid="gj-header-account-menu"]');
    /* Account, orders and "log out" – no returns in this shop */
    expect(menu.findAll('.gj-header__account-item')).toHaveLength(3);
    expect(menu.find('[data-testid="gj-header-account-logout"]').exists()).toBe(true);
  });

  it('should close the account menu when the window becomes narrower than the desktop navigation', async () => {
    customerState.isAuthorized = true;
    const wrapper = await mountHeader();
    const tile = wrapper.get('[data-testid="gj-header-account"]');
    await tile.trigger('click');

    viewportState.current!.value = false;
    await nextTick();

    expect(tile.attributes('aria-expanded')).toBe('false');
  });

  it('should switch to the only other language directly without opening the language selector', async () => {
    localeState.available = [TEST_LOCALE, 'de'];
    const wrapper = await mountHeader();

    await wrapper.find('[data-testid="gj-header-language"]').trigger('click');

    expect(switchLocale).toHaveBeenCalledWith('de', false);
    expect(toggleLanguageSelect).not.toHaveBeenCalled();
  });

  it('should open the language selector when there are several other languages', async () => {
    localeState.available = [TEST_LOCALE, 'de', 'fr'];
    const wrapper = await mountHeader();

    await wrapper.find('[data-testid="gj-header-language"]').trigger('click');

    expect(toggleLanguageSelect).toHaveBeenCalled();
    expect(switchLocale).not.toHaveBeenCalled();
  });

  it('should stay at the top while scrolling when the header is set to sticky in the editor', async () => {
    headerState.sticky = true;

    const wrapper = await mountHeader();

    expect(wrapper.find('[data-testid="gj-header"]').classes()).toContain('gj-header-wrapper--sticky');
  });

  it('should scroll away with the page when the header is not set to sticky', async () => {
    const wrapper = await mountHeader();

    expect(wrapper.find('[data-testid="gj-header"]').classes()).not.toContain('gj-header-wrapper--sticky');
  });

  it('should render the GLAS IN JENA header with logo and cart outside the editor', async () => {
    const wrapper = await mountHeader();

    expect(wrapper.find('[data-testid="gj-header"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-header-logo"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-header-cart"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="original-header"]').exists()).toBe(false);
  });

  it('should keep the original, configurable header in the block editor', async () => {
    editorState.isEditing = true;

    const wrapper = await mountHeader();

    expect(wrapper.find('[data-testid="original-header"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-header"]').exists()).toBe(false);
  });

  it('should show the desktop navigation and no menu button on large screens', async () => {
    const wrapper = await mountHeader();

    expect(wrapper.find('[data-testid="gj-nav"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-header-menu"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="gj-mobile-nav"]').exists()).toBe(false);
  });

  it('should use the menu button and the mobile menu below the desktop breakpoint', async () => {
    viewportState.isDesktop = false;

    const wrapper = await mountHeader();

    expect(wrapper.find('[data-testid="gj-nav"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="gj-mobile-nav"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-header-menu"]').exists()).toBe(true);
  });

  it('should open the mobile menu with the menu button', async () => {
    viewportState.isDesktop = false;
    const wrapper = await mountHeader();

    await wrapper.find('[data-testid="gj-header-menu"]').trigger('click');

    expect(useMegaMenu().isOpen.value).toBe(true);
  });

  it('should toggle the search panel with the search tile', async () => {
    const wrapper = await mountHeader();

    await wrapper.find('[data-testid="gj-header-search"]').trigger('click');

    expect(wrapper.find('[data-testid="gj-header-search-panel"]').exists()).toBe(true);

    await wrapper.find('[data-testid="gj-header-search"]').trigger('click');

    expect(wrapper.find('[data-testid="gj-header-search-panel"]').exists()).toBe(false);
  });

  it('should close the search panel when moving to another page', async () => {
    const wrapper = await mountHeader();
    await wrapper.find('[data-testid="gj-header-search"]').trigger('click');

    await useRouter().push('/gj-other-page');
    await flushPromises();

    expect(wrapper.find('[data-testid="gj-header-search-panel"]').exists()).toBe(false);
  });

  it('should keep the search panel open when only the query of the page changes', async () => {
    const wrapper = await mountHeader();
    await wrapper.find('[data-testid="gj-header-search"]').trigger('click');

    await useRouter().push({ query: { page: '2' } });
    await flushPromises();

    expect(wrapper.find('[data-testid="gj-header-search-panel"]').exists()).toBe(true);
  });
});
