import { getAccountRedirectPath } from '../accountRedirect';

/** The shop's setting "trailing slash: always" */
const addTrailingSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);
/** The setting "no change" */
const keepPath = (path: string) => path;

describe('getAccountRedirectPath', () => {
  it('should keep the account URL of the LTS shop as the page of the account menu, with the trailing slash', () => {
    expect(getAccountRedirectPath('my-account', '/my-account', addTrailingSlash)).toBe('/my-account/');
    expect(getAccountRedirectPath('my-account', '/my-account/', addTrailingSlash)).toBeUndefined();
  });

  it('should add the missing trailing slash to account subpages', () => {
    expect(getAccountRedirectPath('my-account-my-orders', '/en/my-account/my-orders', addTrailingSlash)).toBe(
      '/en/my-account/my-orders/',
    );
  });

  it('should keep account subpages that already have the form of the setting', () => {
    expect(
      getAccountRedirectPath('my-account-personal-data', '/my-account/personal-data/', addTrailingSlash),
    ).toBeUndefined();
    expect(getAccountRedirectPath('my-account-my-orders', '/my-account/my-orders', keepPath)).toBeUndefined();
  });

  it('should leave all other pages alone', () => {
    expect(getAccountRedirectPath('cart', '/cart', addTrailingSlash)).toBeUndefined();
    expect(getAccountRedirectPath('slug', '/my-accountant', addTrailingSlash)).toBeUndefined();
  });
});
