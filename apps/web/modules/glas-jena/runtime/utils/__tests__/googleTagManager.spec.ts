import { runInNewContext } from 'node:vm';
import {
  CONSENT_COOKIE,
  getConsentState,
  getGtmHeadScript,
  GTM_CONTAINER_ID,
  GTM_COOKIE_GROUP,
  GTM_COOKIE_NAME,
  GTM_LOADER,
} from '../googleTagManager';
import type { GtagWindow } from '../types';

const GTM_URL = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`;

/** Runs the head script with the given cookies; returns the data layer, the loaded scripts and the loader. */
const runHeadScript = (cookie: string) => {
  const appended: { src?: string }[] = [];
  const window: GtagWindow = {};
  const document = {
    cookie,
    head: { appendChild: (element: { src?: string }) => appended.push(element) },
    createElement: () => ({}),
  };
  runInNewContext(getGtmHeadScript(), { window, document, Date });
  const commands = () =>
    (window.dataLayer ?? []).map((entry) =>
      entry && typeof entry === 'object' && 'length' in entry ? Array.from(entry as ArrayLike<unknown>) : entry,
    );
  return { commands, appended, load: () => window[GTM_LOADER]?.() };
};

const consentCookie = (accepted: boolean) =>
  `${CONSENT_COOKIE}=${encodeURIComponent(
    JSON.stringify({ hash: 'x', groups: { [GTM_COOKIE_GROUP]: { [GTM_COOKIE_NAME]: accepted } } }),
  )}`;

describe('getGtmHeadScript', () => {
  it('should set the consent default to denied and load nothing without consent', () => {
    const { commands, appended } = runHeadScript('');

    expect(commands()).toEqual([['consent', 'default', getConsentState(false)]]);
    expect(appended).toHaveLength(0);
  });

  it('should grant the consent and load the container right away if the visitor accepted it before', () => {
    const { commands, appended } = runHeadScript(`other=1; ${consentCookie(true)}`);

    expect(commands()[0]).toEqual(['consent', 'default', getConsentState(false)]);
    expect(commands()[1]).toEqual(['consent', 'update', getConsentState(true)]);
    expect(commands()[2]).toMatchObject({ event: 'gtm.js' });
    expect(appended.map(({ src }) => src)).toEqual([GTM_URL]);
  });

  it('should load nothing if the visitor declined or the cookie is broken', () => {
    for (const cookie of [consentCookie(false), `${CONSENT_COOKIE}=%7Bbroken`]) {
      const { commands, appended } = runHeadScript(cookie);
      expect(commands()).toHaveLength(1);
      expect(appended).toHaveLength(0);
    }
  });

  it('should load the container only once when the loader is called after the consent', () => {
    const { commands, appended, load } = runHeadScript('');

    load();
    load();

    expect(appended.map(({ src }) => src)).toEqual([GTM_URL]);
    expect(commands()).toHaveLength(2);
    expect(commands()[1]).toMatchObject({ event: 'gtm.js' });
  });

  it('should not load the container a second time after loading it for a returning visitor', () => {
    const { appended, load } = runHeadScript(consentCookie(true));

    load();

    expect(appended).toHaveLength(1);
  });
});

describe('getConsentState', () => {
  it('should switch all four consent types', () => {
    expect(getConsentState(true)).toEqual({
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
    expect(Object.values(getConsentState(false))).toEqual(['denied', 'denied', 'denied', 'denied']);
  });
});
