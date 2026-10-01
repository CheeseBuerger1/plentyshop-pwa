import { mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaOrderBackLink from '../GlasJenaOrderBackLink.vue';

describe('GlasJenaOrderBackLink', () => {
  it('should link back to the order overview of "My orders"', async () => {
    const wrapper = await mountSuspended(GlasJenaOrderBackLink, {
      props: { order: {} },
      global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
    });
    const link = wrapper.find('[data-testid="gj-order-back-link"]');

    expect(link.attributes('href')).toBe('/my-account/my-orders');
    expect(link.text()).toBe('Back to overview');
    expect(link.attributes('order')).toBeUndefined();
  });
});
