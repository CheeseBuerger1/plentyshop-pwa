import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaTile from '../GlasJenaTile.vue';
import type { GlasJenaTileContent } from '../types';

const { viewportState } = vi.hoisted(() => ({ viewportState: { isDesktop: true } }));

mockNuxtImport('useViewport', () => () => ({
  isGreaterOrEquals: () => viewportState.isDesktop,
  isLessThan: () => !viewportState.isDesktop,
}));

const createContent = (overrides: Partial<GlasJenaTileContent> = {}): GlasJenaTileContent => ({
  text: { title: 'Werksverkauf', htmlDescription: '<p>Westbahnhofstraße 8</p>' },
  button: { label: 'Mehr', link: 'https://www.glas-in-jena.de/', openInNewTab: true },
  layout: { backgroundColor: '#dcedc8', textColor: '#555555', backgroundImage: 'carafe.jpg' },
  collapsibleOnMobile: true,
  ...overrides,
});

const mountTile = (content: GlasJenaTileContent) =>
  mountSuspended(GlasJenaTile, { props: { name: 'GlasJenaTile', type: 'content', meta: { uuid: 'tile' }, content } });

describe('GlasJenaTile', () => {
  afterEach(() => {
    viewportState.isDesktop = true;
  });

  it('should show title, text and colours on desktop without a toggle', async () => {
    const wrapper = await mountTile(createContent());
    const tile = wrapper.find('[data-testid="gj-tile"]');

    expect(wrapper.find('[data-testid="gj-tile-title"]').element.tagName).toBe('H2');
    expect(wrapper.find('[data-testid="gj-tile-title"]').text()).toBe('Werksverkauf');
    expect(wrapper.find('[data-testid="gj-tile-toggle"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="gj-tile-body"]').isVisible()).toBe(true);
    expect(wrapper.text()).toContain('Westbahnhofstraße 8');
    expect(tile.attributes('style')).toContain('background-color: #dcedc8');
    expect(tile.attributes('style')).toContain('carafe.jpg');
  });

  it('should link "Mehr" in a new tab, described by the title', async () => {
    const wrapper = await mountTile(createContent());
    const more = wrapper.find('[data-testid="gj-tile-more"]');
    const titleId = wrapper.find('[data-testid="gj-tile-title"]').attributes('id');

    expect(more.text()).toBe('Mehr');
    expect(more.attributes('href')).toBe('https://www.glas-in-jena.de/');
    expect(more.attributes('target')).toBe('_blank');
    expect(more.attributes('aria-describedby')).toBe(titleId);
  });

  it('should hide "Mehr" without a link', async () => {
    const wrapper = await mountTile(createContent({ button: { label: 'Mehr', link: '' } }));

    expect(wrapper.find('[data-testid="gj-tile-more"]').exists()).toBe(false);
  });

  it('should collapse to the title below the desktop navigation and open on click', async () => {
    viewportState.isDesktop = false;
    const wrapper = await mountTile(createContent());
    const toggle = wrapper.find('[data-testid="gj-tile-toggle"]');
    const body = wrapper.find('[data-testid="gj-tile-body"]');

    expect(toggle.attributes('aria-expanded')).toBe('false');
    expect(toggle.attributes('aria-controls')).toBe(body.attributes('id'));
    expect(body.attributes('style')).toContain('display: none');
    expect(body.text()).toContain('Westbahnhofstraße 8');

    await toggle.trigger('click');

    expect(toggle.attributes('aria-expanded')).toBe('true');
    expect(body.attributes('style') ?? '').not.toContain('display: none');
  });

  it('should stay open on small screens when collapsing is switched off', async () => {
    viewportState.isDesktop = false;
    const wrapper = await mountTile(createContent({ collapsibleOnMobile: false }));

    expect(wrapper.find('[data-testid="gj-tile-toggle"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="gj-tile-body"]').isVisible()).toBe(true);
  });
});
