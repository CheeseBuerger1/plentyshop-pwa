import { GTM_COOKIE_GROUP, GTM_COOKIE_NAME } from '../utils/googleTagManager';

/*
 * Entry for Google Tag Manager / Google Ads in the cookie banner (group "Marketing"); its choice switches the Google
 * consent, see utils/googleTagManager.ts. Cookies can only be registered on the server.
 */
export default defineNuxtPlugin(() => {
  useRegisterCookie().add(
    {
      name: GTM_COOKIE_NAME,
      Provider: 'CookieBar.glasJenaGoogle.provider',
      Status: 'CookieBar.glasJenaGoogle.status',
      PrivacyPolicy: 'https://policies.google.com/privacy',
      Lifespan: 'CookieBar.glasJenaGoogle.lifespan',
      cookieNames: ['^_ga', '^_gcl'],
      accepted: false,
    },
    GTM_COOKIE_GROUP,
  );
});
