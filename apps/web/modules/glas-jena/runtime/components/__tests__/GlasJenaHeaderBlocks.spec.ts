import { flushPromises } from '@vue/test-utils';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaHeaderBlocks from '../GlasJenaHeaderBlocks.vue';

const { viewportState, editorState, headerState, localeState, switchLocale, toggleLanguageSelect } = vi.hoisted(() => ({
  viewportState: { isDesktop: true },
  editorState: { isEditing: false },
  headerState: { sticky: false },
  localeState: { available: ['de', 'en'] },
  switchLocale: vi.fn(),
  toggleLanguageSelect: vi.fn(),
}));

mockNuxtImport('useViewport', () => () => ({
  isGreaterOrEquals: () => viewportState.isDesktop,
  isLessThan: () => !viewportState.isDesktop,
}));
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
        GlasJenaMobileNavigation: { template: '<div data-testid="gj-mobile-nav" />' },
        LanguageSelector: true,
        UiSearch: true,
      },
    },
  });

describe('GlasJenaHeaderBlocks', () => {
  afterEach(() => {
    viewportState.isDesktop = true;
    editorState.isEditing = false;
    headerState.sticky = false;
    localeState.available = ['de', 'en'];
    useMegaMenu().close();
    vi.clearAllMocks();
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
