import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { Order } from '@plentymarkets/shop-api';
import GlasJenaOrderShippingSummary from '../GlasJenaOrderShippingSummary.vue';

const SHIPPING_DATE_TYPE_ID = 5;

const createOrder = (dates: unknown[] = []) =>
  ({
    order: { id: 42030, dates, addressRelations: [], properties: [], deliveryAddress: {} },
    shippingProvider: 'DHL',
    tracking: { trackingNumbers: ['222222222222222222'], trackingURLs: ['https://dhl.example/222'] },
  }) as unknown as Order;

const mountSummary = (order: Order) =>
  mountSuspended(GlasJenaOrderShippingSummary, {
    props: { order },
    global: { stubs: { OrderAddressData: true, OrderTracking: { template: '<div data-testid="tracking" />' } } },
  });

describe('GlasJenaOrderShippingSummary', () => {
  it('should show the shipping date below the shipping method and before the tracking number', async () => {
    const date = '2026-10-07T00:22:11+02:00';
    const wrapper = await mountSummary(createOrder([{ typeId: SHIPPING_DATE_TYPE_ID, date }]));

    expect(wrapper.get('[data-testid="gj-order-shipping-date"]').text()).toBe(new Date(date).toLocaleDateString('en'));
    expect(wrapper.get('[data-testid="gj-order-shipping-date-label"]').text()).not.toBe('');
    const html = wrapper.html();
    expect(html.indexOf('DHL')).toBeLessThan(html.indexOf('gj-order-shipping-date"'));
    expect(html.indexOf('gj-order-shipping-date"')).toBeLessThan(html.indexOf('data-testid="tracking"'));
  });

  it('should show no shipping date without one, but keep method and tracking', async () => {
    const wrapper = await mountSummary(createOrder([{ typeId: 2, date: '2023-11-22T23:05:28+01:00' }]));

    expect(wrapper.find('[data-testid="gj-order-shipping-date"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="gj-order-shipping-date-label"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('DHL');
    expect(wrapper.find('[data-testid="tracking"]').exists()).toBe(true);
  });
});
