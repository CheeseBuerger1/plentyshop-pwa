import type { PayPalSettings } from '@plentymarkets/shop-api';
import { getGooglePayEnvironment } from '../googlePay';

const settings = (isSandbox: boolean) => ({ isSandbox }) as PayPalSettings;

describe('getGooglePayEnvironment', () => {
  it('should run Google Pay live when PayPal runs live', () => {
    expect(getGooglePayEnvironment(settings(false))).toBe('PRODUCTION');
  });

  it('should run Google Pay as a test when PayPal runs in the sandbox', () => {
    expect(getGooglePayEnvironment(settings(true))).toBe('TEST');
  });

  it('should run Google Pay as a test while the PayPal settings are not loaded', () => {
    expect(getGooglePayEnvironment(null)).toBe('TEST');
  });
});
