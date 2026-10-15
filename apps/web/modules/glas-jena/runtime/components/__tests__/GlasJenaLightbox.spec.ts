import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { ImagesData } from '@plentymarkets/shop-api';
import GlasJenaLightbox from '../GlasJenaLightbox.vue';

/* The test DOM may lack the modal dialog: a minimal stand-in that opens, closes and fires `close` */
const dialogProto = HTMLDialogElement.prototype as HTMLDialogElement & { showModal: () => void };
if (!dialogProto.showModal) {
  dialogProto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  dialogProto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

const images = [1, 2, 3, 4].map(
  (number) => ({ url: `https://cdn.example/full/${number}.jpg` }) as unknown as ImagesData,
);

const mountLightbox = async () => {
  const wrapper = await mountSuspended(GlasJenaLightbox, { props: { images }, attachTo: document.body });
  const dialog = wrapper.find('[data-testid="gj-lightbox"]').element as HTMLDialogElement;
  const open = (index: number) => (wrapper.vm as unknown as { open: (index: number) => void }).open(index);
  return { wrapper, dialog, open };
};

const counterOf = (wrapper: Awaited<ReturnType<typeof mountLightbox>>['wrapper']) =>
  wrapper.find('[data-testid="gj-lightbox-counter"]').text();

describe('GlasJenaLightbox', () => {
  afterEach(() => {
    document.documentElement.style.overflow = '';
  });

  it('should open at the given picture as a modal dialog and stop the page from scrolling', async () => {
    const { wrapper, dialog, open } = await mountLightbox();

    open(2);
    await nextTick();

    expect(dialog.hasAttribute('open')).toBe(true);
    expect(counterOf(wrapper)).toContain('3');
    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  it('should page round in a loop with the arrows and the arrow keys', async () => {
    const { wrapper, open } = await mountLightbox();
    open(0);
    await nextTick();

    await wrapper.find('[data-testid="gj-lightbox-previous"]').trigger('click');
    expect(counterOf(wrapper)).toContain('4');

    await wrapper.find('[data-testid="gj-lightbox"]').trigger('keydown', { key: 'ArrowRight' });
    expect(counterOf(wrapper)).toContain('1');
  });

  it('should close on the close button and on the dark area and report the picture last seen', async () => {
    const { wrapper, dialog, open } = await mountLightbox();
    open(1);
    await nextTick();

    await wrapper.find('[data-testid="gj-lightbox-close"]').trigger('click');
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(wrapper.emitted('close')?.at(-1)).toEqual([1]);
    expect(document.documentElement.style.overflow).toBe('');

    open(3);
    await nextTick();
    await wrapper.find('.gj-lightbox__stage').trigger('click');
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(wrapper.emitted('close')?.at(-1)).toEqual([3]);
  });

  it('should keep the dialog open on a click on the picture', async () => {
    const { wrapper, dialog, open } = await mountLightbox();
    open(0);
    await nextTick();

    await wrapper.find('[data-testid="gj-lightbox-image"]').trigger('click');

    expect(dialog.hasAttribute('open')).toBe(true);
  });
});
