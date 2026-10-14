import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaSearchSorting from '../GlasJenaSearchSorting.vue';

const { state } = vi.hoisted(() => ({
  state: { query: {} as Record<string, string>, updateSorting: vi.fn() },
}));

const SETTINGS: Record<string, string> = {
  availableSortingOptions: '["default.recommended_sorting","texts.name1_asc"]',
  defaultSortingSearch: 'item.score',
};

mockNuxtImport('useSiteSettings', () => (name: string) => ({
  getSetting: () => SETTINGS[name],
  getJsonSetting: () => JSON.parse(SETTINGS[name] ?? '[]'),
}));
mockNuxtImport('useCategoryFilter', () => () => ({ updateSorting: state.updateSorting }));

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRoute: () => ({ query: state.query }),
}));

const select = async () => (await mountSuspended(GlasJenaSearchSorting)).find('[data-testid="select-sort-by"]');

describe('GlasJenaSearchSorting', () => {
  beforeEach(() => {
    state.query = {};
    state.updateSorting.mockClear();
  });

  it('should offer and preselect the relevance although the editor list lacks it', async () => {
    const sortBy = await select();

    expect(sortBy.findAll('option').map((option) => option.attributes('value'))).toEqual([
      'item.score',
      'default.recommended_sorting',
      'texts.name1_asc',
    ]);
    expect((sortBy.element as HTMLSelectElement).value).toBe('item.score');
  });

  it('should show the sort chosen in the address', async () => {
    state.query = { sort: 'texts.name1_asc' };

    expect(((await select()).element as HTMLSelectElement).value).toBe('texts.name1_asc');
  });

  it('should sort by the chosen option', async () => {
    const sortBy = await select();

    await sortBy.setValue('default.recommended_sorting');

    expect(state.updateSorting).toHaveBeenCalledWith('default.recommended_sorting');
  });
});
