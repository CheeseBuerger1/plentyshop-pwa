import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import type { VueWrapper } from '@vue/test-utils';
import GlasJenaFooterBlocks from '../GlasJenaFooterBlocks.vue';
import { FOOTER_LINKS } from '../../utils/footer';

const { editorState } = vi.hoisted(() => ({ editorState: { isEditing: false } }));

mockNuxtImport('useEditor', () => () => ({ isEditing: ref(editorState.isEditing) }));

const mountFooter = () =>
  mountSuspended(GlasJenaFooterBlocks, {
    global: { stubs: { FooterBlocks: { template: '<footer data-testid="original-footer" />' } } },
  });

/* v-show hides via inline `display: none`; isVisible() cannot see that on a detached element */
const isBackToTopHidden = (wrapper: VueWrapper) =>
  (wrapper.get('[data-testid="gj-back-to-top"]').element as HTMLElement).style.display === 'none';

describe('GlasJenaFooterBlocks', () => {
  afterEach(() => {
    window.scrollY = 0;
    editorState.isEditing = false;
  });

  it('should show the legal links of the LTS shop in the footer bar', async () => {
    const wrapper = await mountFooter();

    /* The test router renders the links as `router-link-stub` with the target in `to` */
    const links = wrapper.findAll('[data-testid="gj-footer"] .gj-footer__link');

    expect(links).toHaveLength(FOOTER_LINKS.length);
    expect(links.map((link) => link.attributes('to') ?? link.attributes('href'))).toEqual(
      FOOTER_LINKS.map(({ pathKey }) => expect.stringContaining(paths[pathKey])),
    );
  });

  it('should show the copyright with the current year in the footer bar', async () => {
    const wrapper = await mountFooter();

    expect(wrapper.get('[data-testid="gj-footer-copyright"]').text()).toContain(`© ${new Date().getFullYear()} GLAS`);
  });

  it('should keep the original footer in the block editor', async () => {
    editorState.isEditing = true;

    const wrapper = await mountFooter();

    expect(wrapper.find('[data-testid="original-footer"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-footer"]').exists()).toBe(false);
  });

  it('should hide the back to top button at the top of the page', async () => {
    const wrapper = await mountFooter();

    expect(isBackToTopHidden(wrapper)).toBe(true);
  });

  it('should show the back to top button after scrolling down', async () => {
    const wrapper = await mountFooter();

    window.scrollY = 500;
    /* A window scroll fires on the document */
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(isBackToTopHidden(wrapper)).toBe(false);
  });

  it('should scroll to the top when the back to top button is clicked', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const wrapper = await mountFooter();

    await wrapper.get('[data-testid="gj-back-to-top"]').trigger('click');

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('should scroll to the top from the back to top bar at the end of the page (phones)', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const wrapper = await mountFooter();

    await wrapper.get('[data-testid="gj-back-to-top-bar"]').trigger('click');

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  describe('with the editor UI, where a page area scrolls instead of the window', () => {
    const mountInScrollArea = async () => {
      const scrollArea = document.createElement('div');
      document.body.appendChild(scrollArea);
      const wrapper = await mountSuspended(GlasJenaFooterBlocks, {
        attachTo: scrollArea,
        global: { stubs: { FooterBlocks: true } },
      });
      scrollArea.scrollTo = vi.fn();
      return { wrapper, scrollArea };
    };

    const scrollAreaTo = async (element: HTMLElement, top: number) => {
      element.scrollTop = top;
      element.dispatchEvent(new Event('scroll'));
      await nextTick();
    };

    it('should show the button when the page area is scrolled down and scroll that area back up', async () => {
      const { wrapper, scrollArea } = await mountInScrollArea();

      await scrollAreaTo(scrollArea, 500);
      expect(isBackToTopHidden(wrapper)).toBe(false);

      await wrapper.get('[data-testid="gj-back-to-top"]').trigger('click');
      expect(scrollArea.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

      wrapper.unmount();
      scrollArea.remove();
    });

    it('should ignore scrolling elements that do not contain the footer', async () => {
      const { wrapper, scrollArea } = await mountInScrollArea();
      const dropdown = document.createElement('div');
      document.body.appendChild(dropdown);

      await scrollAreaTo(dropdown, 500);
      expect(isBackToTopHidden(wrapper)).toBe(true);

      wrapper.unmount();
      scrollArea.remove();
      dropdown.remove();
    });
  });
});
