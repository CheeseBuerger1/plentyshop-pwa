import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import GlasJenaMyOrders from '../GlasJenaMyOrders.vue';

const { ordersState, fetchCustomerOrders } = vi.hoisted(() => ({
  ordersState: { data: null as unknown, loading: false },
  fetchCustomerOrders: vi.fn(),
}));

mockNuxtImport('useCustomerOrders', () => () => ({
  fetchCustomerOrders,
  data: computed(() => ordersState.data),
  loading: computed(() => ordersState.loading),
}));

const createOrder = (id: number, isNet = false) => ({
  order: { id, accessKey: `key${id}`, createdAt: '2026-09-25T10:22:05Z', statusName: 'Versendet', dates: [] },
  totals: { isNet, totalGross: 119, totalNet: 100, currency: 'EUR' },
});

const mountPage = async (entries: unknown[], lastPageNumber = 1) => {
  ordersState.data = {
    data: { entries, page: 1, totalsCount: entries.length, itemsPerPage: 5, lastPageNumber },
  };
  const wrapper = await mountSuspended(GlasJenaMyOrders, {
    global: {
      stubs: {
        ClientOnly: { template: '<div><slot /></div>' },
        RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
      },
    },
  });
  await flushPromises();
  return wrapper;
};

describe('GlasJenaMyOrders', () => {
  beforeEach(() => {
    fetchCustomerOrders.mockReset();
  });

  it('should list every order with a details link to its confirmation page and no further menu', async () => {
    const wrapper = await mountPage([createOrder(101), createOrder(102)]);
    const orders = wrapper.findAll('[data-testid="gj-order"]');

    expect(orders).toHaveLength(2);
    expect(orders[0]!.find('[data-testid="gj-order-details-link"]').attributes('href')).toBe(
      '/confirmation/101/key101',
    );
    expect(wrapper.find('[data-testid="more-horiz"]').exists()).toBe(false);
    expect(fetchCustomerOrders).toHaveBeenCalledWith({ page: 1 });
  });

  it('should show the gross total, or the net total for net orders', async () => {
    const wrapper = await mountPage([createOrder(101), createOrder(102, true)]);
    const amounts = wrapper.findAll('[data-testid="gj-order-amount"]').map((amount) => amount.text());

    expect(amounts[0]).toContain('119');
    expect(amounts[1]).toContain('100');
  });

  it('should span all columns of the layout grid, which has four columns from 1536 px', async () => {
    const wrapper = await mountPage([createOrder(101)]);

    expect(wrapper.find('[data-testid="account-orders-content"]').classes()).toContain('col-span-full');
    expect(wrapper.find('[data-testid="account-orders-heading"]').classes()).toContain('col-span-full');
  });

  it('should show the texts maintained in the translation editor ("Summe" instead of "Anzahl")', async () => {
    const i18n = useNuxtApp().$i18n;
    i18n.mergeLocaleMessage(i18n.locale.value, {
      translated: { account: { ordersAndReturns: { amount: 'Summe' } } },
    });
    const wrapper = await mountPage([createOrder(101)]);

    expect(wrapper.find('.gj-orders__head').text()).toContain('Summe');
  });

  it('should list all page numbers of a short list instead of only one number', async () => {
    const wrapper = await mountPage([createOrder(101)], 2);

    expect(wrapper.findComponent({ name: 'UiPagination' }).props('maxVisiblePages')).toBe(5);
  });

  it('should show the order ID of every order in its own highlighted cell', async () => {
    const wrapper = await mountPage([createOrder(101), createOrder(102)]);
    const ids = wrapper.findAll('[data-testid="gj-order-id"]');

    expect(ids.map((id) => id.text())).toEqual(['101', '102']);
    expect(ids[0]!.classes()).toContain('gj-orders__id');
  });
});
