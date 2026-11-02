import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { ActiveShippingCountry } from '@plentymarkets/shop-api';
import GlasJenaAddressFields from '../GlasJenaAddressFields.vue';

const country = (id: number, isoCode2: string, states: { id: number; name: string }[] = []) =>
  ({ id, isoCode2, currLangName: isoCode2, states }) as unknown as ActiveShippingCountry;

const COUNTRIES = [
  country(1, 'DE'),
  country(12, 'GB'),
  country(28, 'US', [{ id: 30, name: 'Illinois' }]),
  country(57, 'HK'),
];

const EMPTY = {
  streetName: '',
  apartment: '',
  additionalAddressInformation: '',
  zipCode: '',
  city: '',
  state: '',
  phoneNumber: '',
};

/** Mounts the fields like a form does: every `update:` event goes back into the props. */
const mountFields = async (countryId: string, values: Partial<typeof EMPTY> = {}) => {
  const props = { country: countryId, countries: COUNTRIES, ...EMPTY, ...values };
  const updates = Object.fromEntries(
    Object.keys(EMPTY).map((name) => [`onUpdate:${name}`, (value: string) => wrapper.setProps({ [name]: value })]),
  );
  const wrapper = await mountSuspended(GlasJenaAddressFields, { props: { ...props, ...updates } });
  return wrapper;
};

/** The fields in the order shown, by their test id. */
const fieldOrder = (wrapper: Awaited<ReturnType<typeof mountFields>>) =>
  wrapper.findAll('label[data-testid^="gj-address-"]').map((label) => label.attributes('data-testid')!.slice(11));

describe('GlasJenaAddressFields', () => {
  it('should show the house number of the US first and town, state and ZIP code below', async () => {
    const wrapper = await mountFields('28');

    expect(fieldOrder(wrapper)).toEqual([
      'apartment',
      'streetName',
      'additionalAddressInformation',
      'city',
      'state',
      'zipCode',
      'phoneNumber',
    ]);
    expect(wrapper.get('[data-testid="gj-address-state"]').text()).toContain('State *');
    expect(wrapper.get('[data-testid="gj-address-zipCode"]').text()).toContain('ZIP code *');
  });

  it('should keep the input name of the house number of the original forms', async () => {
    const wrapper = await mountFields('1');

    expect(wrapper.find('input[name="streetNumber"]').exists()).toBe(true);
  });

  it('should show one address line for Great Britain', async () => {
    const wrapper = await mountFields('12');

    expect(fieldOrder(wrapper).slice(0, 2)).toEqual(['streetName', 'additionalAddressInformation']);
  });

  it('should keep the house number field of a British address saved with one', async () => {
    const wrapper = await mountFields('12', { streetName: 'Downing Street', apartment: '10' });

    expect(fieldOrder(wrapper).slice(0, 2)).toEqual(['streetName', 'apartment']);
  });

  it('should join street and house number when the customer changes to Great Britain', async () => {
    const wrapper = await mountFields('1', { streetName: 'Downing Street', apartment: '10' });

    await wrapper.setProps({ country: '12' });

    expect(wrapper.props('streetName')).toBe('10 Downing Street');
    expect(wrapper.props('apartment')).toBe('');
  });

  it('should clear the state of the old country', async () => {
    const wrapper = await mountFields('28', { state: '30' });

    await wrapper.setProps({ country: '1' });

    expect(wrapper.props('state')).toBe('');
  });

  it('should hide the postal code of Hong Kong and send "0" instead, and drop it again for another country', async () => {
    const wrapper = await mountFields('1', { zipCode: '07743' });

    await wrapper.setProps({ country: '57' });

    expect(wrapper.find('[data-testid="gj-address-zipCode"]').exists()).toBe(false);
    expect(wrapper.props('zipCode')).toBe('0');

    await wrapper.setProps({ country: '28' });

    expect(wrapper.props('zipCode')).toBe('');
  });

  it('should note letters outside the Latin script and a street longer than DHL takes, without errors', async () => {
    const wrapper = await mountFields('1', { streetName: 'x'.repeat(51), city: '東京' });

    expect(wrapper.find('[data-testid="gj-address-too-long"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="gj-address-non-latin"]').exists()).toBe(true);
  });

  it('should show no notice for an ordinary address', async () => {
    const wrapper = await mountFields('1', { streetName: 'Hauptstraße', apartment: '12a', city: 'Jena' });

    expect(wrapper.find('[data-testid="gj-address-too-long"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="gj-address-non-latin"]').exists()).toBe(false);
  });

  it('should capitalise the postal code when the customer leaves the field', async () => {
    const wrapper = await mountFields('12');
    const input = wrapper.get('input[name="zipCode"]');

    (input.element as HTMLInputElement).value = ' sw1a 2aa ';
    await input.trigger('change');

    expect(wrapper.props('zipCode')).toBe('SW1A 2AA');
  });
});
