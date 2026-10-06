/**
 * Page of the account menu on phones (GlasJenaAccountLayout.vue); from 825 px it opens the start page of the account
 * (`paths.account`). Also the account URL of the LTS shop.
 */
export const ACCOUNT_MENU_PAGE_PATH = '/my-account';

/**
 * nuxt-viewport breakpoint of the account menu (wish of the shop owner): from a window width of 825 px the menu stands
 * next to the content, below that it has its own page like on phones. Then the orders table keeps its table layout
 * down to a window width of 560 px (528 px content width + 2 x 16 px page margin of the layout).
 * Registered by the module (index.ts).
 */
export const ACCOUNT_MENU_BREAKPOINT = 'gjAccountMenu';
export const ACCOUNT_MENU_MIN_WIDTH = 825;

/**
 * Link to the login page that leads into the account afterwards (wish of the shop owner): the login page opens the
 * page in `redirect`, without it the home page. For the links of the account tile and the mobile menu, which open
 * the login dialog on a plain click and the login page only in a new tab.
 *
 * @param loginPath Localised path of the login page.
 */
export const getAccountLoginPath = (loginPath: string) => `${loginPath}?redirect=${ACCOUNT_MENU_PAGE_PATH}`;

/**
 * Account pages for signed-in customers, the same in the account menu of the header and in the mobile menu, followed
 * by "log out" in both. No "Returns" like the original menu: the shop offers no returns through the web shop (see
 * index.ts). `pathKey` is the page in `paths`, `labelKey` the text in the shop's translations, `mobilePath` the page
 * the mobile menu links to instead ("Mein Konto" leads to the account menu there).
 */
export const ACCOUNT_MENU_LINKS: { pathKey: keyof typeof paths; labelKey: string; mobilePath?: string }[] = [
  { pathKey: 'account', labelKey: 'account.heading', mobilePath: ACCOUNT_MENU_PAGE_PATH },
  { pathKey: 'accountMyOrders', labelKey: 'account.ordersAndReturns.section.myOrders' },
];

/** Views of the login dialog of the header: login, or directly the registration (mobile menu "create an account"). */
export const AUTH_VIEW_LOGIN = 'login';
export const AUTH_VIEW_REGISTER = 'register';

/**
 * Logs the customer out and opens the home page (wish of the shop owner; the original reloads the current page). Like
 * the original, a full page load, so no customer data stays in the app.
 *
 * @param logout `logout` of useCustomer.
 * @param close Closes the menu the "log out" entry is in.
 * @param homePath Localised path of the home page.
 */
export const logOutToHomePage = async (logout: () => Promise<unknown>, close: () => void, homePath: string) => {
  close();
  await logout();
  globalThis.location.assign(homePath);
};
