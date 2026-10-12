import type { CategoryTreeItem } from '@plentymarkets/shop-api';
import type { VueWrapper } from '@vue/test-utils';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaCategorySidebar from '../GlasJenaCategorySidebar.vue';

const PATHS: Record<number, string> = {
  24: '/tee-kaffee/',
  56: '/tee-kaffee/kaffee-mehr/',
  25: '/tee-kaffee/teekannen/',
  30: '/tee-kaffee/teekannen/mit-glasfilter/',
  57: '/diverses/',
};

const { routeMock } = vi.hoisted(() => ({ routeMock: { path: '/tee-kaffee/teekannen/', meta: {} } }));

mockNuxtImport('useRoute', () => () => routeMock);
mockNuxtImport('useLocalizedPath', () => () => (path: string) => path);
mockNuxtImport('useLocalization', () => () => ({
  buildCategoryMenuLink: (category: { id: number }) => PATHS[category.id],
}));

const category = (id: number, name: string, children: CategoryTreeItem[] = []) =>
  ({
    id,
    type: 'item',
    childCount: children.length,
    children,
    itemCount: [],
    right: 'all',
    details: [{ name, lang: 'de', nameUrl: name, metaTitle: name, imagePath: null, image2Path: null }],
  }) as CategoryTreeItem;

const tree = [
  category(24, 'Tee & Kaffee', [
    category(56, 'Kaffee & mehr'),
    category(25, 'Teekannen', [category(30, 'mit Glasfilter')]),
  ]),
  category(57, 'Diverses'),
];

const mountSidebar = () =>
  mountSuspended(GlasJenaCategorySidebar, {
    props: { tree },
    global: { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  });

const items = (wrapper: VueWrapper) => wrapper.findAll('[data-testid="gj-category-sidebar-item"]');
const names = (wrapper: VueWrapper) => items(wrapper).map((item) => item.find('a').text());

describe('GlasJenaCategorySidebar', () => {
  it('should show the main categories and open the path to the current category', async () => {
    const wrapper = await mountSidebar();

    expect(names(wrapper)).toEqual(['Tee & Kaffee', 'Kaffee & mehr', 'Teekannen', 'mit Glasfilter', 'Diverses']);
  });

  it('should highlight the categories on the path and mark the current one', async () => {
    const wrapper = await mountSidebar();
    const active = items(wrapper).filter((item) => item.classes('gj-category-sidebar__item--active'));

    expect(active.map((item) => item.find('a').text())).toEqual(['Tee & Kaffee', 'Teekannen']);
    expect(wrapper.find('[aria-current="page"]').text()).toBe('Teekannen');
  });

  it('should close and open the subcategories of a category with its arrow', async () => {
    const wrapper = await mountSidebar();
    const toggle = wrapper.findAll('[data-testid="gj-category-sidebar-toggle"]')[1];

    expect(toggle?.attributes('aria-expanded')).toBe('true');
    await toggle?.trigger('click');

    expect(names(wrapper)).toEqual(['Tee & Kaffee', 'Kaffee & mehr', 'Teekannen', 'Diverses']);
    expect(wrapper.findAll('[data-testid="gj-category-sidebar-toggle"]')[1]?.attributes('aria-expanded')).toBe('false');

    await wrapper.findAll('[data-testid="gj-category-sidebar-toggle"]')[1]?.trigger('click');

    expect(names(wrapper)).toContain('mit Glasfilter');
  });

  it('should give only categories with subcategories an arrow, named after the category', async () => {
    const wrapper = await mountSidebar();
    const toggles = wrapper.findAll('[data-testid="gj-category-sidebar-toggle"]');

    expect(toggles).toHaveLength(2);
    expect(toggles[0]?.attributes('aria-label')).toContain('Tee & Kaffee');
  });
});
