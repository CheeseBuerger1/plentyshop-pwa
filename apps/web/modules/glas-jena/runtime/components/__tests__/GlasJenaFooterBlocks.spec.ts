import { mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaFooterBlocks from '../GlasJenaFooterBlocks.vue';

describe('GlasJenaFooterBlocks', () => {
  afterEach(() => {
    window.scrollY = 0;
  });

  it('should render the copyright line with the current year', async () => {
    const wrapper = await mountSuspended(GlasJenaFooterBlocks);

    expect(wrapper.get('[data-testid="gj-footnote"]').text()).toContain(`© ${new Date().getFullYear()} GLAS`);
  });

  it('should hide the back to top button at the top of the page', async () => {
    const wrapper = await mountSuspended(GlasJenaFooterBlocks);

    expect(wrapper.get('[data-testid="gj-back-to-top"]').isVisible()).toBe(false);
  });

  it('should show the back to top button after scrolling down', async () => {
    const wrapper = await mountSuspended(GlasJenaFooterBlocks);

    window.scrollY = 500;
    window.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(wrapper.get('[data-testid="gj-back-to-top"]').isVisible()).toBe(true);
  });

  it('should scroll to the top when the back to top button is clicked', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const wrapper = await mountSuspended(GlasJenaFooterBlocks);

    await wrapper.get('[data-testid="gj-back-to-top"]').trigger('click');

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
