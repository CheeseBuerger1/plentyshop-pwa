import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { Order } from '@plentymarkets/shop-api';
import GlasJenaOrderTotals from '../GlasJenaOrderTotals.vue';

const createOrder = (isNet: boolean) =>
  ({
    order: {
      typeId: 1,
      orderItems: [],
      amounts: [
        {
          isSystemCurrency: false,
          shippingCostsGross: 6.9,
          shippingCostsNet: 5.8,
          vats: [{ vatRate: 19, value: 3.55 }],
        },
      ],
    },
    totals: {
      isNet,
      currency: 'EUR',
      itemSumGross: 15.35,
      itemSumNet: 12.9,
      totalGross: 22.25,
      totalNet: 18.7,
      couponValue: 0,
      itemSumRebateGross: 0,
      itemSumRebateNet: 0,
      vats: [],
    },
  }) as unknown as Order;

const mountTotals = (order: Order) =>
  mountSuspended(GlasJenaOrderTotals, { props: { order }, global: { stubs: { UiDivider: true } } });

describe('GlasJenaOrderTotals', () => {
  it('should put "incl." (German "inkl.") in front of the VAT label on the left and keep only the amount on the right', async () => {
    const wrapper = await mountTotals(createOrder(false));
    const label = wrapper.get('[data-testid="gj-order-vat-label"]').text();
    const value = wrapper.get('[data-testid="gj-order-vat-value"]').text();

    expect(label).toBe('incl. VAT (19%):');
    expect(value).toContain('3.55');
    expect(value).not.toContain('incl.');
  });

  it('should put "excl." (German "exkl.") in front of the VAT label for net orders', async () => {
    const wrapper = await mountTotals(createOrder(true));

    expect(wrapper.get('[data-testid="gj-order-vat-label"]').text()).toBe('excl. VAT (19%):');
    expect(wrapper.get('[data-testid="gj-order-vat-value"]').text()).not.toContain('excl.');
  });

  it('should keep the other totals of the original: subtotal, shipping and total', async () => {
    const wrapper = await mountTotals(createOrder(false));
    const text = wrapper.text();

    expect(text).toContain('15.35');
    expect(text).toContain('6.90');
    expect(text).toContain('22.25');
  });
});
