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

const product = {
  texts: { name1: 'Teekanne CLASSIC 1.75l' },
  images: { all: [{ urlMiddle: '/teekanne.jpg', name: 'Teekanne', alternate: 'Teekanne' }], variation: [] },
} as unknown as Product;

const stubs = {
  UiModal: { template: '<section><slot /></section>' },
  ProductPrice: true,
  VariationProperties: true,
  GuaranteeBlock: true,
  PayPalExpressButton: true,
  PayPalPayLaterBanner: true,
  NuxtImg: true,
};

const mountWindow = async () => {
  useQuickCheckout().openQuickCheckout(product, 2);

  return mountSuspended(GlasJenaQuickCheckout, { props: { product }, global: { stubs } });
};

describe('GlasJenaQuickCheckout', () => {
  beforeEach(() => {
    navigateToMock.mockClear();
    useQuickCheckout().closeQuickCheckout();
  });

  it('should render nothing while the window is closed', async () => {
    const wrapper = await mountSuspended(GlasJenaQuickCheckout, { props: { product }, global: { stubs } });

    expect(wrapper.find(CART_BUTTON).exists()).toBe(false);
  });

  it('should show the buttons in the order continue shopping, cart, checkout', async () => {
    const wrapper = await mountWindow();
    const continueButton = wrapper.get(CONTINUE_BUTTON).element;
    const cartButton = wrapper.get(CART_BUTTON).element;
    const checkoutButton = wrapper.get(CHECKOUT_BUTTON).element;

    expect(continueButton.compareDocumentPosition(cartButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(cartButton.compareDocumentPosition(checkoutButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('should word the buttons "Einkauf fortsetzen" and "Zum Warenkorb"', async () => {
    const wrapper = await mountWindow();

    expect(wrapper.get(CONTINUE_BUTTON).text()).toMatch(/^(Einkauf fortsetzen|Continue shopping)$/);
    expect(wrapper.get(CART_BUTTON).text()).toMatch(/^(Zum Warenkorb|Go to cart)$/);
  });

  it('should only close the window when "Einkauf fortsetzen" is clicked', async () => {
    const wrapper = await mountWindow();

    await wrapper.get(CONTINUE_BUTTON).trigger('click');

    expect(useQuickCheckout().isOpen.value).toBe(false);
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('should close the window like the cross does', async () => {
    const wrapper = await mountWindow();

    await wrapper.get(CLOSE_BUTTON).trigger('click');

    expect(useQuickCheckout().isOpen.value).toBe(false);
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('should close the window and open the cart when "Zum Warenkorb" is clicked', async () => {
    const wrapper = await mountWindow();

    await wrapper.get(CART_BUTTON).trigger('click');

    expect(useQuickCheckout().isOpen.value).toBe(false);
    expect(navigateToMock).toHaveBeenCalledWith(expect.stringContaining('cart'));
  });
});
