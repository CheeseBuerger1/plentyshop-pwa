import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import type { PaymentMethod, ShippingMethod } from '@plentymarkets/shop-api';
import GlasJenaPaymentButtons from '../GlasJenaPaymentButtons.vue';

const PREPAYMENT = 6000;
const PAYPAL = 6001;

const { state, send, order, handlePaymentMethodUpdate, scroll } = vi.hoisted(() => ({
  state: {
    list: [] as PaymentMethod[],
    selected: 0,
    excluded: [] as number[],
    paymentLoading: false,
  },
  send: vi.fn(),
  order: vi.fn(),
  handlePaymentMethodUpdate: vi.fn(),
  scroll: vi.fn(),
}));

/* The original buy button: its click handler stands for placing the order */
vi.mock('~/components/PaymentButtons/PaymentButtons.vue', () => ({
  default: defineComponent({
    setup: () => () => h('button', { 'data-testid': 'place-order-button', onClick: order }, 'Bestellen'),
  }),
}));

mockNuxtImport('useNotification', () => () => ({ send }));
mockNuxtImport('scrollToHTMLObject', () => scroll);
mockNuxtImport('useCart', () => () => ({ data: ref({ methodOfPaymentId: state.selected }) }));
mockNuxtImport('useCartShippingMethods', () => () => ({
  selectedMethod: ref({ excludedPaymentMethodIds: state.excluded } as unknown as ShippingMethod),
}));
mockNuxtImport('useCheckoutPagePaymentAndShipping', () => () => ({
  paymentMethods: ref({ list: state.list, selected: state.selected }),
  paymentLoading: ref(state.paymentLoading),
  shippingLoading: ref(false),
  handlePaymentMethodUpdate,
}));

const payment = (id: number) => ({ id, isSelectable: true }) as PaymentMethod;

const mountButtons = async () => {
  const wrapper = await mountSuspended(GlasJenaPaymentButtons, {
    global: { stubs: { GlasJenaCheckoutLegalNotice: true } },
  });
  await flushPromises();
  return wrapper;
};

describe('GlasJenaPaymentButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.list = [payment(PREPAYMENT), payment(PAYPAL)];
    state.selected = PREPAYMENT;
    state.excluded = [];
    state.paymentLoading = false;
  });

  it('should order as before with an allowed payment method', async () => {
    const wrapper = await mountButtons();

    await wrapper.get('[data-testid="place-order-button"]').trigger('click');

    expect(order).toHaveBeenCalledTimes(1);
    expect(handlePaymentMethodUpdate).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('should switch to the first allowed payment method when the stored one is no longer offered', async () => {
    state.list = [payment(PAYPAL)];

    await mountButtons();

    expect(handlePaymentMethodUpdate).toHaveBeenCalledWith(PAYPAL);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: 'warning' }));
  });

  it('should switch when the shipping method excludes the stored payment method', async () => {
    state.excluded = [PREPAYMENT];

    await mountButtons();

    expect(handlePaymentMethodUpdate).toHaveBeenCalledWith(PAYPAL);
  });

  it('should stop the order and show the payment methods when no payment method is allowed', async () => {
    state.list = [payment(PREPAYMENT)];
    state.excluded = [PREPAYMENT];
    const wrapper = await mountButtons();

    await wrapper.get('[data-testid="place-order-button"]').trigger('click');

    expect(handlePaymentMethodUpdate).not.toHaveBeenCalled();
    expect(order).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: 'warning' }));
    expect(scroll).toHaveBeenCalledWith('[data-testid="checkout-payment"]');
  });

  it('should stop the order while no payment method has been chosen, without choosing one itself', async () => {
    state.selected = 0;
    const wrapper = await mountButtons();

    await wrapper.get('[data-testid="place-order-button"]').trigger('click');

    expect(handlePaymentMethodUpdate).not.toHaveBeenCalled();
    expect(order).not.toHaveBeenCalled();
  });

  it('should not switch while the payment methods are loading', async () => {
    state.list = [payment(PAYPAL)];
    state.paymentLoading = true;

    await mountButtons();

    expect(handlePaymentMethodUpdate).not.toHaveBeenCalled();
  });
});
