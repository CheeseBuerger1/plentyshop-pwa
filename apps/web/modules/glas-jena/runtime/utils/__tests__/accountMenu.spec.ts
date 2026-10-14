import { AFTER_LOGIN_PATH, getAccountLoginPath, logOutToHomePage } from '../accountMenu';

describe('getAccountLoginPath', () => {
  it('should land on the page "Meine Bestellungen" of the shop', () => {
    expect(AFTER_LOGIN_PATH).toBe(paths.accountMyOrders);
  });

  it('should lead the login page to "Meine Bestellungen"', () => {
    expect(getAccountLoginPath('/en/login/')).toBe('/en/login/?redirect=/my-account/my-orders');
  });
});

describe('logOutToHomePage', () => {
  it('should close the menu, log out and then open the home page', async () => {
    const steps: string[] = [];
    const assign = vi.fn(() => steps.push('home'));
    vi.stubGlobal('location', { assign });

    await logOutToHomePage(
      async () => {
        steps.push('logout');
      },
      () => steps.push('close'),
      '/en/',
    );

    expect(steps).toEqual(['close', 'logout', 'home']);
    expect(assign).toHaveBeenCalledWith('/en/');
    vi.unstubAllGlobals();
  });
});
