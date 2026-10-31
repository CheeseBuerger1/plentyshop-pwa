import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import type { CartItem } from '@plentymarkets/shop-api';
import GlasJenaCartProductCard from '../GlasJenaCartProductCard.vue';

const { setCartItemQuantity } = vi.hoisted(() => ({ setCartItemQuantity: vi.fn(() => Promise.resolve({})) }));

/* Two articles of 1 each: the cart's `itemQuantity` is 2 */
mockNuxtImport('useCart', () => () => ({
  data: ref({ itemQuantity: 2 }),
  setCartItemQuantity,
  deleteCartItem: vi.fn(),
}));

/* Stand-in for the quantity selector: only its event `change-quantity` matters */
const QuantitySelectorStub = { name: 'QuantitySelectorStub', template: '<div />', emits: ['change-quantity'] };

const cartItem = {
  id: 7,
  variationId: 1256,
  quantity: 1,
  variation: undefined,
  basketItemOrderParams: [],
} as unknown as CartItem;

const changeQuantity = async (quantity: number) => {
  const wrapper = await mountSuspended(GlasJenaCartProductCard, {
    props: { cartItem },
    global: {
      stubs: { NuxtImg: true, GuaranteeBlock: true, Price: true, UiQuantitySelector: QuantitySelectorStub },
    },
  });
  wrapper.findComponent(QuantitySelectorStub).vm.$emit('change-quantity', String(quantity));
  /* The quantity is sent after a pause of 500 ms (debounce) */
  await new Promise((resolve) => setTimeout(resolve, 600));
  await flushPromises();
};

describe('GlasJenaCartProductCard', () => {
  it('should send a quantity equal to the number of all articles in the cart (1 → 2 with two articles)', async () => {
    await changeQuantity(2);

    expect(setCartItemQuantity).toHaveBeenCalledWith({ quantity: 2, cartItemId: 7, productId: 1256 });
  });

  it('should not send the quantity the article already has', async () => {
    await changeQuantity(1);

    expect(setCartItemQuantity).not.toHaveBeenCalled();
  });
});
