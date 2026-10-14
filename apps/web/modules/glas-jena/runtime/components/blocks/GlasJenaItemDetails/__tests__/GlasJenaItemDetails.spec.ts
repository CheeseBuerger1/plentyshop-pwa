import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaItemDetails from '../GlasJenaItemDetails.vue';

const { pageState } = vi.hoisted(() => ({ pageState: { product: {} as object } }));

mockNuxtImport('useProducts', () => () => ({ currentProduct: ref(pageState.product) }));

const productFixture = {
  item: {
    id: 105075,
    manufacturer: {
      externalName: 'Trendglas Jena GmbH',
      street: 'Westbahnhofstr.',
      houseNo: '8',
      postcode: '07745',
      town: 'Jena',
      url: 'https://www.trendglas-jena.com',
    },
  },
  variation: { number: '105075', name: '1200', heightMM: 114, lengthMM: 225, widthMM: 170 },
};

const mountDetails = (title = 'Weitere Details') =>
  mountSuspended(GlasJenaItemDetails, {
    props: { name: 'GlasJenaItemDetails', type: 'content', meta: { uuid: 'a' }, content: { text: { title } } },
  });

describe('GlasJenaItemDetails', () => {
  beforeEach(() => {
    pageState.product = productFixture;
  });

  it('should show the heading and the details of the item as a description list', async () => {
    const wrapper = await mountDetails();

    expect(wrapper.find('[data-testid="gj-item-details-title"]').text()).toBe('Weitere Details');
    expect(wrapper.find('[data-testid="gj-item-details-itemNumber"] dd').text()).toBe('105075');
    expect(wrapper.find('[data-testid="gj-item-details-content"] dd').text()).toBe('1200 ml');
    expect(wrapper.find('[data-testid="gj-item-details-dimensions"] dd').text()).toBe('114 mm | 225 mm | 170 mm');
    expect(wrapper.findAll('dt')).toHaveLength(4);
  });

  it('should show the manufacturer address line by line with the website as a link', async () => {
    const wrapper = await mountDetails();
    const manufacturer = wrapper.find('[data-testid="gj-item-details-manufacturer"]');

    expect(manufacturer.findAll('.gj-item-details__line').map((line) => line.text())).toEqual([
      'Trendglas Jena GmbH',
      'Westbahnhofstr. 8',
      '07745 Jena',
    ]);
    const link = manufacturer.find('a');
    expect(link.attributes('href')).toBe('https://www.trendglas-jena.com');
    expect(link.attributes('rel')).toBe('noopener');
  });

  it('should show no details outside a product page and no heading without a title', async () => {
    pageState.product = {};
    const wrapper = await mountDetails('');

    expect(wrapper.find('[data-testid="gj-item-details-title"]').exists()).toBe(false);
    expect(wrapper.findAll('dt')).toHaveLength(0);
  });
});
