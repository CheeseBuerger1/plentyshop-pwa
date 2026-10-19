import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import GlasJenaPackstationFinder from '../GlasJenaPackstationFinder.vue';

/* The original as far as the wrapper relies on it: open accordion (`ref(true)`) of Storefront UI in the finder box */
vi.mock('~/components/PreferredDelivery/PackstationFinder.vue', async () => {
  const { SfAccordionItem } = await import('@storefront-ui/vue');
  const { defineComponent, h, ref } = await import('vue');
  return {
    default: defineComponent({
      setup() {
        const open = ref(true);
        return () =>
          h('div', { 'data-testid': 'preferred-delivery-location-finder' }, [
            h(
              SfAccordionItem,
              { modelValue: open.value, 'onUpdate:modelValue': (value: boolean) => (open.value = value) },
              { summary: () => h('h2', 'Packstation'), default: () => h('form', 'search') },
            ),
          ]);
      },
    }),
  };
});

describe('GlasJenaPackstationFinder', () => {
  it('should close the Packstation search when it appears', async () => {
    const wrapper = await mountSuspended(GlasJenaPackstationFinder, { attachTo: document.body });
    await flushPromises();

    expect((wrapper.get('details').element as HTMLDetailsElement).open).toBe(false);
    wrapper.unmount();
  });

  it('should open again with a click on the heading', async () => {
    const wrapper = await mountSuspended(GlasJenaPackstationFinder, { attachTo: document.body });
    await flushPromises();

    await wrapper.get('summary').trigger('click');

    expect((wrapper.get('details').element as HTMLDetailsElement).open).toBe(true);
    wrapper.unmount();
  });
});
