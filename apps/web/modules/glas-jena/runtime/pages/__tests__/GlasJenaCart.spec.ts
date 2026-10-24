import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import GlasJenaCart from '../GlasJenaCart.vue';

const { cartState } = vi.hoisted(() => ({ cartState: { empty: true } }));

mockNuxtImport('useCart', () => () => ({
  data: ref({ items: [] }),
  cartIsEmpty: computed(() => cartState.empty),
  loading: ref(false),
}));

vi.mock('../../composables/useGlasJenaCartShipping', () => ({
  useGlasJenaCartShipping: () => ({ loading: ref(false) }),
}));

const mountCart = async () => {
  const wrapper = await mountSuspended(GlasJenaCart, {
    global: {
      stubs: {
        NuxtLayout: { template: '<div><slot /></div>' },
        ModuleComponentRendering: true,
        GlasJenaCartShipping: true,
        OrderSummary: true,
        ClientOnly: true,
        RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
      },
    },
  });
  await flushPromises();
  return wrapper;
};

describe('GlasJenaCart', () => {
  beforeEach(() => {
    cartState.empty = true;
  });

  it('should lead from the empty cart back to the home page with "Weiter einkaufen"', async () => {
    const wrapper = await mountCart();
    const button = wrapper.get('[data-testid="gj-cart-continue-shopping"]');

    expect(button.attributes('href')).toBe('/');
    expect(button.text()).toBeTruthy();
  });

  it('should not show the button while the cart has articles', async () => {
    cartState.empty = false;
    const wrapper = await mountCart();

    expect(wrapper.find('[data-testid="gj-cart-continue-shopping"]').exists()).toBe(false);
  });
});
