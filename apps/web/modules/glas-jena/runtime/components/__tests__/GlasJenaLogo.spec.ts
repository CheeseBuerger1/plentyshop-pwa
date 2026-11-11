import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import GlasJenaLogo from '../GlasJenaLogo.vue';

const LOGO_URL = 'https://cdn02.plentyone.com/atgu0g2nr01z/frontend/layout/jenaglas_logo-header.png';

mockNuxtImport('useSiteSettings', () => () => ({ getSetting: () => LOGO_URL }));

describe('GlasJenaLogo', () => {
  it('should show the logo of the shop settings with the brand as alternative text and its own size', async () => {
    const wrapper = await mountSuspended(GlasJenaLogo);
    const logo = wrapper.find('[data-testid="gj-logo"]');

    expect(logo.attributes('src')).toBe(LOGO_URL);
    expect(logo.attributes('alt')).toBe('GLAS in JENA');
    expect(logo.attributes('width')).toBe('136');
    expect(logo.attributes('height')).toBe('139');
  });
});
