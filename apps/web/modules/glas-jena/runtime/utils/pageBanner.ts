/** Route base names (without the i18n locale suffix) that get their banner title from the page data. */
export const CATEGORY_ROUTE = 'slug';
export const SEARCH_ROUTE = 'search';
export const TAG_ROUTE = 'tag-slug';
/** All pages of the customer account (`my-account`, `my-account-personal-data`, …) share the title "Mein Konto". */
export const ACCOUNT_ROUTE_PREFIX = 'my-account';
export const ACCOUNT_TITLE_KEY = 'account.heading';
export const SEARCH_RESULTS_TITLE_KEY = 'search.searchResults';
/** Status code shown in the banner of an error without one (Nuxt's default for errors). */
export const DEFAULT_ERROR_STATUS_CODE = 500;

/**
 * Banner title (translation key) of the pages with a fixed title. Mostly the name the page itself registers via
 * `setPageMeta`. Home page and product pages are missing on purpose: like the LTS shop, they have no banner.
 */
export const PAGE_BANNER_TITLE_KEYS: Record<string, string> = {
  'cancellation-form': 'legal.cancellationForm',
  'cancellation-rights': 'legal.cancellationRights',
  cart: 'common.labels.cart',
  checkout: 'common.labels.checkout',
  contact: 'contact.label',
  'declaration-of-accessibility': 'legal.declarationOfAccessibility',
  'guest-login': 'common.labels.checkout',
  'legal-disclosure': 'legal.legalDisclosure',
  login: 'authentication.login.submitLabel',
  'newsletter-unsubscribe': 'newsletter.unsubscribe.label',
  'password-reset-contactId-hash': 'authentication.setNewPassword.heading',
  'privacy-policy': 'CookieBar.keys.PrivacyPolicy',
  'readonly-checkout': 'common.labels.checkout',
  register: 'authentication.signup.heading',
  'reset-password': 'authentication.resetPassword.heading',
  'reset-password-success': 'authentication.resetPassword.title',
  'set-new-password': 'authentication.setNewPassword.heading',
  shipping: 'orderConfirmation.shipping',
  'terms-and-conditions': 'legal.termsAndConditions',
};

/** Translation key of the banner title for a page with a fixed title; `undefined` for all other pages. */
export const getFixedPageBannerTitleKey = (routeBaseName: string) => {
  if (routeBaseName === ACCOUNT_ROUTE_PREFIX || routeBaseName.startsWith(`${ACCOUNT_ROUTE_PREFIX}-`)) {
    return ACCOUNT_TITLE_KEY;
  }
  return PAGE_BANNER_TITLE_KEYS[routeBaseName];
};

/** Tag name of a tag page slug (`<name>_<id>`), as the tag page shows it. */
export const getTagName = (slug: string) => slug.split('_')[0] ?? '';
