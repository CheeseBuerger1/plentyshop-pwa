import { mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaFreeShippingFrom from '../GlasJenaFreeShippingFrom.vue';
import { FREE_SHIPPING_FROM_SETTING } from '../../../../../../utils/merchantPolicies';

const INPUT = '[data-testid="gj-free-shipping-from"] input, input[data-testid="gj-free-shipping-from"]';

describe('GlasJenaFreeShippingFrom', () => {
  afterEach(() => {
    useSiteSettings(FREE_SHIPPING_FROM_SETTING).updateSetting('');
  });

  it('should show 150 € as placeholder while the setting is empty', async () => {
    const wrapper = await mountSuspended(GlasJenaFreeShippingFrom);

    expect(wrapper.find(INPUT).attributes('placeholder')).toBe('150');
    expect((wrapper.find(INPUT).element as HTMLInputElement).value).toBe('');
  });

  it('should save the entered limit in the editor setting', async () => {
    const wrapper = await mountSuspended(GlasJenaFreeShippingFrom);

    await wrapper.find(INPUT).setValue('200');

    expect(useSiteSettings(FREE_SHIPPING_FROM_SETTING).getSetting()).toBe('200');
  });
});
