import { runInNewContext } from 'node:vm';
import {
  CONSENT_COOKIE,
  getConsentState,
  getGtmHeadScript,
  GTM_CONTAINER_ID,
  GTM_COOKIE_GROUP,
  GTM_COOKIE_NAME,
} from '../googleTagManager';

/** Runs the head script with the given cookies and returns the data layer and the loaded script. */
const runHeadScript = (cookie: string) => {
  const appended: { src?: string }[] = [];
  const window: { dataLayer?: unknown[] } = {};
  const document = {
    cookie,
    head: { appendChild: (element: { src?: string }) => appended.push(element) },
    createElement: () => ({}),
  };
  runInNewContext(getGtmHeadScript(), { window, document, Date });
  const commands = (window.dataLayer ?? []).map((entry) =>
    entry && typeof entry === 'object' && 'length' in entry ? Array.from(entry as ArrayLike<unknown>) : entry,
  );
  return { commands, appended };
};

const consentCookie = (accepted: boolean) =>
  `${CONSENT_COOKIE}=${encodeURIComponent(
    JSON.stringify({ hash: 'x', groups: { [GTM_COOKIE_GROUP]: { [GTM_COOKIE_NAME]: accepted } } }),
  )}`;

describe('getGtmHeadScript', () => {
  it('should set the consent default to denied before loading the container', () => {
    const { commands, appended } = runHeadScript('');

    expect(commands[0]).toEqual(['consent', 'default', getConsentState(false)]);
    expect(commands).toHaveLength(2);
    expect(commands[1]).toMatchObject({ event: 'gtm.js' });
    expect(appended[0]?.src).toBe(`https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`);
  });

  it('should grant the consent right away if the visitor accepted it before', () => {
    const { commands } = runHeadScript(`other=1; ${consentCookie(true)}`);

    expect(commands[0]).toEqual(['consent', 'default', getConsentState(false)]);
    expect(commands[1]).toEqual(['consent', 'update', getConsentState(true)]);
    expect(commands[2]).toMatchObject({ event: 'gtm.js' });
  });

  it('should keep the default if the visitor declined or the cookie is broken', () => {
    expect(runHeadScript(consentCookie(false)).commands).toHaveLength(2);
    expect(runHeadScript(`${CONSENT_COOKIE}=%7Bbroken`).commands).toHaveLength(2);
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
