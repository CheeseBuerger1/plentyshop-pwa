import type { ConsentState, ConsentType, Gtag, GtagWindow } from './types';

/**
 * Google Tag Manager with the container of the LTS shop, so tags and variables are kept in one place. The Google Ads
 * conversion itself is set up in the container; the shop only provides the `purchase` event (see purchaseTracking.ts).
 */
export const GTM_CONTAINER_ID = 'GTM-W78FSN7P';

/** Entry in the cookie banner (group "Marketing") whose choice switches the Google consent. */
export const GTM_COOKIE_NAME = 'CookieBar.glasJenaGoogle.name';
export const GTM_COOKIE_GROUP = 'CookieBar.marketing.label';

/** Cookie in which useCookieBar stores the choice: `{ hash, groups: { [group]: { [cookie]: boolean } } }`. */
export const CONSENT_COOKIE = 'consent-cookie';

/** Consent types of Google's consent mode that the banner choice switches. */
export const CONSENT_TYPES: ConsentType[] = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'];

export const getConsentState = (granted: boolean): ConsentState =>
  Object.fromEntries(CONSENT_TYPES.map((type) => [type, granted ? 'granted' : 'denied'])) as ConsentState;

/** The `gtag` of the head script; pushes the `arguments` object, as GTM only reads commands in that form. */
export const getGtag = (): Gtag => {
  const target = window as unknown as GtagWindow;
  return (
    target.gtag ??
    function () {
      // eslint-disable-next-line prefer-rest-params
      (target.dataLayer ??= []).push(arguments);
    }
  );
};

/** Global of the head script that loads the container once (head script and client plugin share it). */
export const GTM_LOADER = 'glasJenaLoadGtm' satisfies keyof GtagWindow;

/**
 * Head script, before the app: consent default `denied` and the loader `glasJenaLoadGtm`. GTM is only loaded with the
 * visitor's consent (decision of the shop owner, 2026-10-25), so without it nothing is sent to Google, not even the
 * cookieless pings of the consent mode: here if the consent cookie already holds it (returning visitors), otherwise
 * by the client plugin once the visitor accepts in the banner. No noscript part, as it would load GTM without consent.
 */
export const getGtmHeadScript = (containerId = GTM_CONTAINER_ID) =>
  [
    '(function(w,d){',
    'w.dataLayer=w.dataLayer||[];',
    'w.gtag=w.gtag||function(){w.dataLayer.push(arguments);};',
    `w.gtag('consent','default',${JSON.stringify(getConsentState(false))});`,
    'var l=false;',
    `w.${GTM_LOADER}=function(){`,
    'if(l)return;l=true;',
    "w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});",
    "var s=d.createElement('script');s.async=true;",
    `s.src='https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}';`,
    'd.head.appendChild(s);',
    '};',
    'try{',
    `var m=d.cookie.match(/(?:^|;\\s*)${CONSENT_COOKIE}=([^;]*)/);`,
    'var g=m&&JSON.parse(decodeURIComponent(m[1])).groups;',
    `if(g&&g[${JSON.stringify(GTM_COOKIE_GROUP)}]&&g[${JSON.stringify(GTM_COOKIE_GROUP)}][${JSON.stringify(GTM_COOKIE_NAME)}]===true){`,
    `w.gtag('consent','update',${JSON.stringify(getConsentState(true))});`,
    `w.${GTM_LOADER}();`,
    '}',
    '}catch(e){}',
    '})(window,document);',
  ].join('');

/** Loads the container if the head script has not done so yet (after the consent in the banner). */
export const loadGtm = () => (window as unknown as GtagWindow)[GTM_LOADER]?.();
