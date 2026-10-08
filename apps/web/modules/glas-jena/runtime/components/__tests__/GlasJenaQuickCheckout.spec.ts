import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import type { Product } from '@plentymarkets/shop-api';
import GlasJenaQuickCheckout from '../GlasJenaQuickCheckout.vue';

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));

mockNuxtImport('navigateTo', () => navigateToMock);
mockNuxtImport('useCart', () => () => ({
  data: ref({ items: [{ quantity: 2 }] }),
  lastUpdatedCartItem: ref({ variation: {} }),
  showNetPrices: ref(false),
}));
mockNuxtImport('usePayPal', () => () => ({
  isAvailable: () => ref(false),
  loadConfig: vi.fn(),
}));
mockNuxtImport('useCustomer', () => () => ({ isAuthorized: ref(true) }));

const CONTINUE_BUTTON = '[data-testid="gj-quick-checkout-continue-button"]';
const CART_BUTTON = '[data-testid="quick-checkout-cart-button"]';
const CHECKOUT_BUTTON = '[data-testid="quick-checkout-checkout-button"]';
const CLOSE_BUTTON = '[data-testid="quick-checkout-close"]';
const DIALOG = '[aria-modal="true"]';

const product = {
  texts: { name1: 'Teekanne CLASSIC 1.75l' },
  images: { all: [{ urlMiddle: '/teekanne.jpg', name: 'Teekanne', alternate: 'Teekanne' }], variation: [] },
} as unknown as Product;

/* Like SfModal: the root is the dialog (`aria-modal`) and can be focused (`tabindex="-1"`) */
const stubs = {
  UiModal: { template: '<section aria-modal="true" tabindex="-1"><slot /></section>' },
  ProductPrice: true,
  VariationProperties: true,
  GuaranteeBlock: true,
  PayPalExpressButton: true,
  PayPalPayLaterBanner: true,
  NuxtImg: true,
};

type Wrapper = Awaited<ReturnType<typeof mountSuspended<typeof GlasJenaQuickCheckout>>>;

let wrapper: Wrapper | undefined;
let trigger: HTMLButtonElement | undefined;

/** Opens the window like the "add to cart" button does; `trigger` is the button that has the focus meanwhile. */
const openWindow = async () => {
  trigger = document.createElement('button');
  document.body.appendChild(trigger);
  trigger.focus();
  useQuickCheckout().openQuickCheckout(product, 2);
  wrapper = await mountSuspended(GlasJenaQuickCheckout, {
    props: { product },
    global: { stubs },
    attachTo: document.body,
  });
  await nextTick();

  return wrapper;
};

describe('GlasJenaQuickCheckout', () => {
  beforeEach(() => {
    navigateToMock.mockClear();
    useQuickCheckout().closeQuickCheckout();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    trigger?.remove();
    trigger = undefined;
  });

  it('should render nothing while the window is closed', async () => {
    wrapper = await mountSuspended(GlasJenaQuickCheckout, { props: { product }, global: { stubs } });

    expect(wrapper.find(CART_BUTTON).exists()).toBe(false);
  });

  it('should show the buttons in the order continue shopping, cart, checkout', async () => {
    const window = await openWindow();
    const continueButton = window.get(CONTINUE_BUTTON).element;
    const cartButton = window.get(CART_BUTTON).element;
    const checkoutButton = window.get(CHECKOUT_BUTTON).element;

    expect(continueButton.compareDocumentPosition(cartButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(cartButton.compareDocumentPosition(checkoutButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('should word the buttons "Einkauf fortsetzen" and "Zum Warenkorb"', async () => {
    const window = await openWindow();

    expect(window.get(CONTINUE_BUTTON).text()).toMatch(/^(Einkauf fortsetzen|Continue shopping)$/);
    expect(window.get(CART_BUTTON).text()).toMatch(/^(Zum Warenkorb|Go to cart)$/);
  });

  it('should only close the window when "Einkauf fortsetzen" is clicked', async () => {
    const window = await openWindow();

    await window.get(CONTINUE_BUTTON).trigger('click');

    expect(useQuickCheckout().isOpen.value).toBe(false);
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('should close the window like the cross does', async () => {
    const window = await openWindow();

    await window.get(CLOSE_BUTTON).trigger('click');

    expect(useQuickCheckout().isOpen.value).toBe(false);
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('should close the window and open the cart when "Zum Warenkorb" is clicked', async () => {
    const window = await openWindow();

    await window.get(CART_BUTTON).trigger('click');

    expect(useQuickCheckout().isOpen.value).toBe(false);
    expect(navigateToMock).toHaveBeenCalledWith(expect.stringContaining('cart'));
  });

  describe('keyboard and screen readers', () => {
    it('should be a dialog named by its title', async () => {
      const window = await openWindow();
      const dialog = window.get(DIALOG);
      const title = window.get(`#${dialog.attributes('aria-labelledby')}`);

      expect(dialog.attributes('role')).toBe('dialog');
      expect(title.text()).not.toBe('');
      expect(title.element.tagName).toBe('H2');
    });

    it('should move the focus into the window when it opens', async () => {
      const window = await openWindow();

      expect(document.activeElement).toBe(window.get(DIALOG).element);
    });

    it('should give the focus back to the button that opened the window when it is closed', async () => {
      const window = await openWindow();

      await window.get(CONTINUE_BUTTON).trigger('click');
      window.unmount();
      wrapper = undefined;

      expect(document.activeElement).toBe(trigger);
    });

    it('should not take the focus back when it goes on to the cart', async () => {
      const window = await openWindow();

      await window.get(CART_BUTTON).trigger('click');
      window.unmount();
      wrapper = undefined;

      expect(document.activeElement).not.toBe(trigger);
    });
  });
});
