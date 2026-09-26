import { getAccountRedirectPath } from '../accountRedirect';

const ACCOUNT_START_PATH = '/my-account/personal-data/';
/** The shop's setting "trailing slash: always" */
const addTrailingSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);
/** The setting "no change" */
const keepPath = (path: string) => path;

describe('getAccountRedirectPath', () => {
  it('should send the account URL of the LTS shop to the start page of the account', () => {
    expect(getAccountRedirectPath('my-account', '/my-account', ACCOUNT_START_PATH, addTrailingSlash)).toBe(
      ACCOUNT_START_PATH,
    );
    expect(getAccountRedirectPath('my-account', '/my-account/', ACCOUNT_START_PATH, addTrailingSlash)).toBe(
      ACCOUNT_START_PATH,
    );
  });

  it('should add the missing trailing slash to account subpages', () => {
    expect(
      getAccountRedirectPath('my-account-my-orders', '/en/my-account/my-orders', ACCOUNT_START_PATH, addTrailingSlash),
    ).toBe('/en/my-account/my-orders/');
  });

  it('should keep account subpages that already have the form of the setting', () => {
    expect(
      getAccountRedirectPath('my-account-personal-data', ACCOUNT_START_PATH, ACCOUNT_START_PATH, addTrailingSlash),
    ).toBeUndefined();
    expect(
      getAccountRedirectPath('my-account-my-orders', '/my-account/my-orders', ACCOUNT_START_PATH, keepPath),
    ).toBeUndefined();
  });

  it('should leave all other pages alone', () => {
    expect(getAccountRedirectPath('cart', '/cart', ACCOUNT_START_PATH, addTrailingSlash)).toBeUndefined();
    expect(getAccountRedirectPath('slug', '/my-accountant', ACCOUNT_START_PATH, addTrailingSlash)).toBeUndefined();
  });
});
