import type { CategoryTreeItem } from '@plentymarkets/shop-api';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaCategoryTiles from '../GlasJenaCategoryTiles.vue';

mockNuxtImport('useLocalizedPath', () => () => (path: string) => path);
mockNuxtImport('useLocalization', () => () => ({
  buildCategoryMenuLink: (category: { id: number }) => `/category/${category.id}/`,
}));

const category = (id: number, name: string, imagePath: string | null) =>
  ({
    id,
    type: 'item',
    childCount: 0,
    itemCount: [],
    right: 'all',
    details: [{ name, lang: 'de', nameUrl: name, metaTitle: name, imagePath, image2Path: null }],
  }) as CategoryTreeItem;

const categories = [category(56, 'Kaffee & mehr', 'category/56/katkaff2.jpg'), category(57, 'Diverses', null)];

const mountTiles = () =>
  mountSuspended(GlasJenaCategoryTiles, {
    props: { categories, tree: categories },
    global: {
      stubs: {
        NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
        NuxtImg: { props: ['src', 'alt'], template: '<img :src="src" :alt="alt" />' },
      },
    },
  });

describe('GlasJenaCategoryTiles', () => {
  it('should render one link per subcategory with its name, in the given order', async () => {
    const wrapper = await mountTiles();
    const tiles = wrapper.findAll('[data-testid="gj-category-tile"]');

    expect(tiles.map((tile) => tile.text())).toEqual(['Kaffee & mehr', 'Diverses']);
    expect(tiles.map((tile) => tile.attributes('href'))).toEqual(['/category/56/', '/category/57/']);
  });

  it('should show the category image without a text of its own', async () => {
    const wrapper = await mountTiles();
    const image = wrapper.find('img');

    expect(image.attributes('src')).toBe(`${useRuntimeConfig().public.domain}/documents/category/56/katkaff2.jpg`);
    expect(image.attributes('alt')).toBe('');
  });

  it('should render a category without an image as a tile with its name only', async () => {
    const wrapper = await mountTiles();

    expect(wrapper.findAll('img')).toHaveLength(1);
    expect(wrapper.findAll('[data-testid="gj-category-tile"]')).toHaveLength(2);
  });

  it('should be a named navigation region', async () => {
    const wrapper = await mountTiles();

    expect(wrapper.find('nav').attributes('aria-label')).toBeTruthy();
  });
});
