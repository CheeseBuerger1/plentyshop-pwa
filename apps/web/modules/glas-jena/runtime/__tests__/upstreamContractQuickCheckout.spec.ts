/**
 * Upstream contract of the cart window (the window after "Add to cart").
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readApp = (path: string) => readFileSync(join(process.cwd(), 'app', path), 'utf8');

describe('upstream contract of the glas-jena module: cart window', () => {
  it('should find the cart window parts that the module copy GlasJenaQuickCheckout builds on', () => {
    const quickCheckout = readApp('components/QuickCheckout/QuickCheckout.vue');
    /*
     * The copy adds "Einkauf fortsetzen" above the cart button, words the cart button "Zum Warenkorb", drops the short
     * description and moves the cart summary (count, subtotal) from the right column under the price
     */
    for (const part of [
      'aria-label="quick-checkout-modal"',
      "{{ t('quickCheckout.heading') }}",
      "{{ t('quickCheckout.cartContains', { count: cartItemsCount }) }}",
      "{{ t('quickCheckout.subTotal') }}:",
      '{{ format(cartGetters.getItemSumNet(cart)) }}',
      '{{ format(totals.subTotal) }}',
      'data-testid="quick-checkout-close"',
      'data-testid="quick-checkout-cart-button"',
      '@click="goToPage(paths.cart)"',
      'data-testid="quick-checkout-checkout-button"',
      '@click="goToCheckout()"',
      '<GuaranteeBlock :product="product" class="mt-4" />',
      'const close = () => {',
      'closeQuickCheckout();',
      'startTimer();',
    ]) {
      expect(quickCheckout).toContain(part);
    }
    expect(readApp('components/QuickCheckout/types.ts')).toContain('QuickCheckoutProps');
  });

  it('should find the dialog parts of UiModal and SfModal that the focus handling of the cart window relies on', () => {
    /* The copy focuses the element with `aria-modal` (tabindex -1) and gives it `role` and `aria-labelledby` */
    const uiModal = readApp('components/ui/Modal/Modal.vue');
    expect(uiModal).toContain('<SfModal');
    expect(uiModal).toContain('v-bind="{ ...$attrs, ...props }"');
    /* SfModal then traps Tab inside and closes on Escape (the original never moves the focus there) */
    const sfModal = readFileSync(
      join(process.cwd(), '../../node_modules/@storefront-ui/vue/dist/components/SfModal/SfModal.vue.mjs'),
      'utf8',
    );
    for (const part of ['"aria-modal": "true"', 'tabindex: "-1"', 'trapTabs', '["esc"]']) {
      expect(sfModal).toContain(part);
    }
  });

  it('should find the name and price that glas-jena.css weights in the cart window', () => {
    /* `[aria-label='quick-checkout-modal'] [data-testid='product-name']` and `... [data-testid='price']` */
    expect(readApp('components/QuickCheckout/QuickCheckout.vue')).toContain('data-testid="product-name"');
    expect(readApp('components/Price/Price.vue')).toContain("testId: 'price'");
  });
});
