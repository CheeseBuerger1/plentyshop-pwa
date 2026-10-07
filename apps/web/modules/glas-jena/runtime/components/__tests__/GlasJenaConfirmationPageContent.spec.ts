import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import type { Order } from '@plentymarkets/shop-api';
import GlasJenaConfirmationPageContent from '../GlasJenaConfirmationPageContent.vue';

const customerState = vi.hoisted(() => ({ isAuthorized: true }));

mockNuxtImport('useCustomer', () => () => ({ isAuthorized: ref(customerState.isAuthorized) }));
mockNuxtImport('useActiveShippingCountries', () => () => ({ getActiveShippingCountries: vi.fn() }));
mockNuxtImport('useDynamicPaymentButtons', () => () => ({ createOrderLoading: ref(true) }));

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const createOrder = (createdAt: string, statusId = 7, paymentStatus = 'unpaid') => ({
  order: {
    id: 4711,
    createdAt,
    statusId,
    statusName: `[${statusId}] Status`,
    orderItems: [],
    deliveryAddress: { options: [{ typeId: 5, value: 'kunde@example.com' }] },
  },
  paymentStatus,
  paymentBankDetails: { accountOwner: 'Max Mustermann', name: 'Testbank', iban: 'DE00 0000 0000 0000 0000 00' },
  totals: {},
});

const stubs = {
  OrderDetails: true,
  OrderSummaryProductCard: true,
  OrderTotals: true,
  OrderShippingSummary: true,
  OrderPaymentSummary: true,
  OrderBankDetails: { template: '<div data-testid="bank-details" />' },
  PayPalInvoiceDetails: true,
  OrderDocumentsList: true,
  OrderReturnItems: true,
  OrderAgainButton: { template: '<a data-testid="back-link" />' },
  UiModal: true,
  RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
};

const mountContent = async (order: ReturnType<typeof createOrder>) => {
  const wrapper = await mountSuspended(GlasJenaConfirmationPageContent, {
    props: { order: order as unknown as Order },
    global: { stubs },
  });
  await flushPromises();
  return wrapper;
};

describe('GlasJenaConfirmationPageContent', () => {
  it('should thank the customer for an order of the last 24 hours', async () => {
    const wrapper = await mountContent(createOrder(hoursAgo(2)));

    expect(wrapper.find('[data-testid="success-header"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-order-thanks-message"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="gj-order-thanks-mail"]').text()).toContain('kunde@example.com');
    expect(wrapper.find('[data-testid="gj-order-heading"]').exists()).toBe(false);
    /* The rest is the same page as the order details: boxes, products, totals */
    for (const name of ['OrderDetails', 'OrderTotals', 'OrderShippingSummary']) {
      expect(wrapper.findComponent({ name }).exists()).toBe(true);
    }
    /* No document download right after the purchase: the confirmation may not exist yet and comes by e-mail */
    expect(wrapper.findComponent({ name: 'OrderDocumentsList' }).exists()).toBe(false);
  });

  it('should show a neutral heading with the order date for an older order', async () => {
    const wrapper = await mountContent(createOrder('2026-09-25T10:22:05Z'));

    expect(wrapper.find('[data-testid="success-header"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="gj-order-heading"]').text()).toBe('Order 4711');
    expect(wrapper.get('[data-testid="gj-order-placed"]').text()).toContain('ordered on');
    expect(wrapper.text()).not.toContain('kunde@example.com');
  });

  it('should keep the original page structure: details, totals, documents and the way back', async () => {
    const wrapper = await mountContent(createOrder('2026-09-25T10:22:05Z'));

    expect(wrapper.find('[data-testid="order-success-page"]').exists()).toBe(true);
    for (const name of ['OrderDetails', 'OrderTotals', 'OrderDocumentsList']) {
      expect(wrapper.findComponent({ name }).exists()).toBe(true);
    }
  });

  it('should show the way back to "My orders" at the top, before the heading, for signed-in customers only', async () => {
    customerState.isAuthorized = true;
    const signedIn = await mountContent(createOrder('2026-09-25T10:22:05Z'));
    const html = signedIn.html();

    expect(signedIn.find('[data-testid="back-link"]').exists()).toBe(true);
    expect(html.indexOf('data-testid="back-link"')).toBeLessThan(html.indexOf('data-testid="gj-order-heading"'));
    expect(signedIn.findAll('[data-testid="back-link"]')).toHaveLength(1);

    customerState.isAuthorized = false;
    const guest = await mountContent(createOrder(hoursAgo(1)));

    expect(guest.find('[data-testid="back-link"]').exists()).toBe(false);
    /* 16 px below the banner without the back link, 8 px below the back link */
    expect(guest.get('[data-testid="gj-order-heading-block"]').classes()).toContain('pt-4');
    expect(signedIn.get('[data-testid="gj-order-heading-block"]').classes()).toContain('pt-2');
    customerState.isAuthorized = true;
  });
});

describe('GlasJenaConfirmationPageContent bank details', () => {
  it('should show the bank details of an open (unpaid, not cancelled) order', async () => {
    const wrapper = await mountContent(createOrder(hoursAgo(2), 7));

    expect(wrapper.find('[data-testid="bank-details"]').exists()).toBe(true);
  });

  it('should hide the bank details of a fully paid order', async () => {
    const wrapper = await mountContent(createOrder(hoursAgo(2), 7, 'paid'));

    expect(wrapper.find('[data-testid="bank-details"]').exists()).toBe(false);
  });

  it('should hide the bank details of a cancelled order', async () => {
    const wrapper = await mountContent(createOrder(hoursAgo(2), 8));

    expect(wrapper.find('[data-testid="bank-details"]').exists()).toBe(false);
  });
});
