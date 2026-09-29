/**
 * Account pages for signed-in customers, shared by the account menu of the header and the mobile menu, followed by
 * "log out" in both. No "Returns" like the original menu: the shop offers no returns through the web shop (see
 * index.ts). `pathKey` is the page in `paths`, `labelKey` the text in the shop's translations.
 */
export const ACCOUNT_MENU_LINKS: { pathKey: keyof typeof paths; labelKey: string }[] = [
  { pathKey: 'account', labelKey: 'account.heading' },
  { pathKey: 'accountMyOrders', labelKey: 'account.ordersAndReturns.section.myOrders' },
];

/** Views of the login dialog of the header: login, or directly the registration (mobile menu "create an account"). */
export const AUTH_VIEW_LOGIN = 'login';
export const AUTH_VIEW_REGISTER = 'register';
