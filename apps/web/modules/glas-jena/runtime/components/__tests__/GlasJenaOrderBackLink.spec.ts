import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { Order } from '@plentymarkets/shop-api';
import GlasJenaOrderBackLink from '../GlasJenaOrderBackLink.vue';

const createOrder = (createdAt?: string) => ({ order: { createdAt } }) as unknown as Order;

const mountLink = (order: Order) =>
  mountSuspended(GlasJenaOrderBackLink, {
    props: { order },
    global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  });

describe('GlasJenaOrderBackLink', () => {
  it('should link back to the order overview of "My orders" for an older order', async () => {
    const wrapper = await mountLink(createOrder('2026-09-25T10:22:05Z'));
    const link = wrapper.get('[data-testid="gj-order-back-link"]');

    expect(link.attributes('href')).toBe('/my-account/my-orders');
    expect(link.text()).toBe('To overview');
    expect(link.attributes('order')).toBeUndefined();
  });

  it('should link to the home page right after the purchase (order of the last 24 hours)', async () => {
    const wrapper = await mountLink(createOrder(new Date(Date.now() - 60 * 60 * 1000).toISOString()));
    const link = wrapper.get('[data-testid="gj-order-back-link"]');

    expect(link.attributes('href')).toBe('/');
    expect(link.text()).toBe('To home page');
  });

  it('should treat an order without a date as an older order', async () => {
    const wrapper = await mountLink(createOrder(undefined));

    expect(wrapper.get('[data-testid="gj-order-back-link"]').attributes('href')).toBe('/my-account/my-orders');
  });
});
