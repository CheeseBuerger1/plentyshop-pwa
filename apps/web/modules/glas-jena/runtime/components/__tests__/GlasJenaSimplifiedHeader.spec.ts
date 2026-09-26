import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaSimplifiedHeader from '../GlasJenaSimplifiedHeader.vue';

const { editorState } = vi.hoisted(() => ({ editorState: { isEditing: false } }));

mockNuxtImport('useEditor', () => () => ({ isEditing: ref(editorState.isEditing) }));

const mountHeader = () =>
  mountSuspended(GlasJenaSimplifiedHeader, {
    global: {
      stubs: {
        SimplifiedHeader: { template: '<header data-testid="original-simplified-header" />' },
        GlasJenaHeaderBlocks: { template: '<div data-testid="gj-header" />' },
      },
    },
  });

describe('GlasJenaSimplifiedHeader', () => {
  afterEach(() => {
    editorState.isEditing = false;
  });

  it('should show the GLAS IN JENA header in the checkout, like the LTS shop', async () => {
    const wrapper = await mountHeader();

    expect(wrapper.find('[data-testid="gj-header"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="original-simplified-header"]').exists()).toBe(false);
  });

  it('should keep the original simplified header in the block editor', async () => {
    editorState.isEditing = true;

    const wrapper = await mountHeader();

    expect(wrapper.find('[data-testid="original-simplified-header"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-header"]').exists()).toBe(false);
  });
});
