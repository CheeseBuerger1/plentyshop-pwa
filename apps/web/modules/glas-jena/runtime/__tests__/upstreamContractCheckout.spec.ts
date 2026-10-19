/**
 * Upstream contract of the checkout (guest or login, checkout page).
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readApp = (path: string) => readFileSync(join(process.cwd(), 'app', path), 'utf8');

describe('upstream contract of the glas-jena module: checkout', () => {
  it('should find the headings of the guest or login choice that glas-jena.css makes medium', () => {
    /* `div:has(> [data-testid='guest-checkout-button']) :is(h2, h3)`: the column with the guest button holds them */
    const guestLogin = readApp('pages/guest/login.vue');
    expect(guestLogin).toMatch(
      /<div[^>]*>\s*<h2[^>]*>\{\{ t\('checkout\.guestCheckout'\) \}\}<\/h2>\s*<UiButton\s+data-testid="guest-checkout-button"/,
    );
    expect(guestLogin).toContain('<h2 class="font-bold text-lg">{{ t(\'checkout.loginFastCheckout\') }}</h2>');
    expect(guestLogin).toContain(
      '<h3 class="font-bold text-lg mb-6">{{ t(\'authentication.login.createAccount\') }}</h3>',
    );
  });
});
