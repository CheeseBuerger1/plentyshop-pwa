import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { VueWrapper } from '@vue/test-utils';
import GlasJenaFooterBlocks from '../GlasJenaFooterBlocks.vue';

/* v-show hides via inline `display: none`; isVisible() cannot see that on a detached element */
const isBackToTopHidden = (wrapper: VueWrapper) =>
  (wrapper.get('[data-testid="gj-back-to-top"]').element as HTMLElement).style.display === 'none';

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

    expect(isBackToTopHidden(wrapper)).toBe(true);
  });

  it('should show the back to top button after scrolling down', async () => {
    const wrapper = await mountSuspended(GlasJenaFooterBlocks);

    window.scrollY = 500;
    window.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(isBackToTopHidden(wrapper)).toBe(false);
  });

  it('should scroll to the top when the back to top button is clicked', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const wrapper = await mountSuspended(GlasJenaFooterBlocks);

    await wrapper.get('[data-testid="gj-back-to-top"]').trigger('click');

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
