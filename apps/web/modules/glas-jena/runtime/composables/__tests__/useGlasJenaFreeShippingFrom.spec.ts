import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useGlasJenaFreeShippingFrom } from '../useGlasJenaFreeShippingFrom';

const { settings } = vi.hoisted(() => ({ settings: { value: {} as { getSetting?: () => unknown } } }));

mockNuxtImport('useSiteSettings', () => () => settings.value);

describe('useGlasJenaFreeShippingFrom', () => {
  it('should take the limit from the editor setting', () => {
    settings.value = { getSetting: () => '200' };

    expect(useGlasJenaFreeShippingFrom().value).toBe(200);
  });

  it('should give the default of 150 € when the setting cannot be read (partly replaced in tests)', () => {
    settings.value = {};
    expect(useGlasJenaFreeShippingFrom().value).toBe(150);

    settings.value = {
      getSetting: () => {
        throw new TypeError("Cannot read properties of undefined (reading 'data')");
      },
    };
    expect(useGlasJenaFreeShippingFrom().value).toBe(150);
  });
});
