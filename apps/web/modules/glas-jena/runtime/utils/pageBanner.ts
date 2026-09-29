/** Route base names (without the i18n locale suffix) that get their banner title from the page data. */
export const CATEGORY_ROUTE = 'slug';
export const SEARCH_ROUTE = 'search';
export const TAG_ROUTE = 'tag-slug';
/** Category type of product categories; content pages (type `content`) share the category route. */
export const ITEM_CATEGORY_TYPE = 'item';
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

/**
 * Banner titles with the module's own text (local messages of GlasJenaPageBanner), for pages where the shop has no
 * fitting translation. Cancellation policy: like the LTS page, which holds the policy and the form.
 */
export const OWN_PAGE_BANNER_TITLE_KEYS: Record<string, string> = {
  'cancellation-rights': 'cancellationRightsTitle',
};

/** Local message of GlasJenaPageBanner for error pages ("Fehler 404"). */
export const ERROR_TITLE_KEY = 'errorTitle';

/** Translation key of the banner title for a page with a fixed title; `undefined` for all other pages. */
export const getFixedPageBannerTitleKey = (routeBaseName: string) => {
  if (routeBaseName === ACCOUNT_ROUTE_PREFIX || routeBaseName.startsWith(`${ACCOUNT_ROUTE_PREFIX}-`)) {
    return ACCOUNT_TITLE_KEY;
  }
  return PAGE_BANNER_TITLE_KEYS[routeBaseName];
};

/** Tag name of a tag page slug (`<name>_<id>`), as the tag page shows it. */
export const getTagName = (slug: string) => slug.split('_')[0] ?? '';
