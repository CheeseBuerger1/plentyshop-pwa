import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaAccountLayout from '../GlasJenaAccountLayout.vue';
import { ACCOUNT_MENU_PAGE_PATH } from '../../utils/accountMenu';

const { viewportState, routeState, navigateToMock } = vi.hoisted(() => ({
  viewportState: { isWide: false },
  routeState: { name: 'my-account', path: '/my-account' },
  navigateToMock: vi.fn(),
}));

mockNuxtImport('useViewport', () => () => ({
  isGreaterOrEquals: () => viewportState.isWide,
  isLessThan: () => !viewportState.isWide,
}));
mockNuxtImport('useRoute', () => () => ({ path: routeState.path, name: routeState.name, meta: {} }));
mockNuxtImport('useRouteBaseName', () => () => () => routeState.name);
mockNuxtImport('useLocalizedPath', () => () => (path: string) => path);
mockNuxtImport('useCustomer', () => () => ({ logout: vi.fn() }));
mockNuxtImport('navigateTo', () => navigateToMock);

const mountLayout = () =>
  mountSuspended(GlasJenaAccountLayout, {
    global: {
      stubs: {
        NuxtLayout: { template: '<div><slot /></div>' },
        NuxtPage: { template: '<p data-testid="account-page-content" />' },
        NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
      },
    },
  });

/* The menu and the content area are hidden with Tailwind's `hidden` (shown again from 768 px by `@md:block`) */
const isHiddenOnPhones = (classes: string[]) => classes.includes('hidden');

describe('GlasJenaAccountLayout', () => {
  afterEach(() => {
    viewportState.isWide = false;
    routeState.name = 'my-account';
    routeState.path = '/my-account';
    vi.clearAllMocks();
  });

  it('should show only the account menu on its own page on phones', async () => {
    const wrapper = await mountLayout();

    expect(isHiddenOnPhones(wrapper.get('[data-testid="gj-account-menu"]').classes())).toBe(false);
    expect(
      isHiddenOnPhones(wrapper.get('[data-testid="category-grid"]').element.parentElement!.classList.value.split(' ')),
    ).toBe(true);
    expect(wrapper.find('[data-testid="gj-account-back"]').exists()).toBe(false);
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('should hide the menu on an account page on phones and lead back to the menu page', async () => {
    routeState.name = 'my-account-personal-data';
    routeState.path = paths.accountPersonalData;

    const wrapper = await mountLayout();

    expect(isHiddenOnPhones(wrapper.get('[data-testid="gj-account-menu"]').classes())).toBe(true);
    const heading = wrapper.get('[data-testid="gj-account-subpage-heading"]');
    /* Top left before the page's name, named after its target ("Mein Konto") */
    expect(heading.element.firstElementChild).toBe(wrapper.get('[data-testid="gj-account-back"]').element);
    /* The English test texts: "Mein Konto" is "My Account" */
    expect(wrapper.get('[data-testid="gj-account-back"]').text()).toBe('My Account');
    expect(heading.get('h2').text()).not.toBe('');
    expect(wrapper.get('[data-testid="gj-account-back"]').attributes('href')).toBe(ACCOUNT_MENU_PAGE_PATH);
  });

  it('should keep the menu next to the content from 768 px and open the start page instead of the menu page', async () => {
    viewportState.isWide = true;

    const wrapper = await mountLayout();

    expect(wrapper.find('[data-testid="gj-account-back"]').exists()).toBe(false);
    expect(navigateToMock).toHaveBeenCalledWith(paths.account, { replace: true });
  });

  it('should size the menu and the gap by the window instead of a fixed 300 px and 40 px', async () => {
    viewportState.isWide = true;

    const wrapper = await mountLayout();
    const menu = wrapper.get('[data-testid="gj-account-menu"]');

    expect(menu.classes()).toContain('gj-account-menu');
    expect(menu.classes()).not.toContain('min-w-[300px]');
    expect(wrapper.get('[data-testid="account-page-sidebar"]').classes()).toContain('gj-account-columns');
  });

  it('should give each section of the menu a real heading that names its links', async () => {
    const wrapper = await mountLayout();

    const headings = wrapper.findAll('[data-testid="gj-account-menu-heading"]');

    expect(headings).toHaveLength(2);
    for (const heading of headings) {
      expect(heading.element.tagName).toBe('H2');
      expect(heading.element.closest('section')?.getAttribute('aria-labelledby')).toBe(heading.attributes('id'));
    }
  });

  it('should offer neither wishlist nor returns in the menu', async () => {
    const wrapper = await mountLayout();

    const links = wrapper.findAll('[data-testid="gj-account-menu"] a').map((link) => link.attributes('href'));

    expect(links).toEqual([
      paths.accountPersonalData,
      paths.accountBillingDetails,
      paths.accountShippingDetails,
      paths.accountMyOrders,
    ]);
  });
});
