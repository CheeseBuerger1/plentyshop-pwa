import type { Category, CategoryTreeItem } from '@plentymarkets/shop-api';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaCategoryTree from '../GlasJenaCategoryTree.vue';

const PATHS: Record<number, string> = { 24: '/tee-kaffee/', 39: '/tee-kaffee/teewaermer/', 57: '/diverses/' };

const treeItem = (id: number, name: string, children: CategoryTreeItem[] = []) =>
  ({
    id,
    type: 'item',
    childCount: children.length,
    children,
    itemCount: [],
    right: 'all',
    details: [{ name, lang: 'de', nameUrl: name, metaTitle: name, imagePath: null, image2Path: null }],
  }) as CategoryTreeItem;

const { treeState } = vi.hoisted(() => ({ treeState: { tree: [] as unknown[] } }));

mockNuxtImport('useCategoryTree', () => () => ({ data: ref(treeState.tree) }));
mockNuxtImport('useRoute', () => () => ({ path: '/tee-kaffee/teewaermer/', meta: {} }));
mockNuxtImport('useLocalizedPath', () => () => (path: string) => path);
mockNuxtImport('useLocalization', () => () => ({
  buildCategoryMenuLink: (category: { id: number }) => PATHS[category.id],
}));

const mountTree = () =>
  mountSuspended(GlasJenaCategoryTree, {
    props: { category: { id: 39 } as unknown as Category },
    global: { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  });

describe('GlasJenaCategoryTree', () => {
  beforeEach(() => {
    treeState.tree = [treeItem(24, 'Tee & Kaffee', [treeItem(39, 'Teewärmer')]), treeItem(57, 'Diverses')];
  });

  it('should show the category list of the shop with the path to the current category open', async () => {
    const wrapper = await mountTree();
    const names = wrapper.findAll('[data-testid="gj-category-sidebar-item"]').map((item) => item.find('a').text());

    expect(names).toEqual(['Tee & Kaffee', 'Teewärmer', 'Diverses']);
    expect(wrapper.find('[aria-current="page"]').text()).toBe('Teewärmer');
  });

  it('should carry the test id of the list in the filter column', async () => {
    const wrapper = await mountTree();

    expect(wrapper.find('[data-testid="gj-category-tree"]').exists()).toBe(true);
  });
});
