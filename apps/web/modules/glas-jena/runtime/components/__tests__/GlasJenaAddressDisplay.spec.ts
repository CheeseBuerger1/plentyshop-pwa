import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { ActiveShippingCountry, Address } from '@plentymarkets/shop-api';
import GlasJenaAddressDisplay from '../GlasJenaAddressDisplay.vue';

const COUNTRIES = [
  { id: 1, isoCode2: 'DE', currLangName: 'Deutschland', states: [] },
  {
    id: 28,
    isoCode2: 'US',
    currLangName: 'USA',
    states: [{ id: 30, name: 'Illinois', isoCode3166: 'IL' }],
  },
] as unknown as ActiveShippingCountry[];

const ADDRESS = {
  firstName: 'Test',
  lastName: 'Kunde',
  primary: false,
  phoneNumber: '',
} as unknown as Address;

/** The shown lines of an address. */
const shownLines = async (address: Partial<Address>) => {
  const wrapper = await mountSuspended(GlasJenaAddressDisplay, { props: { address: { ...ADDRESS, ...address } } });
  return wrapper.findAll('p').map((line) => line.text());
};

describe('GlasJenaAddressDisplay', () => {
  beforeEach(() => {
    useAggregatedCountries().setCountries(COUNTRIES, []);
  });

  it('should show a US address like its form, with state abbreviation, line 2 and the phone number last', async () => {
    expect(
      await shownLines({
        country: '28',
        streetName: 'Baker St',
        apartment: '221',
        additionalAddressInformation: 'Apt 4B',
        city: 'Springfield',
        state: '30',
        zipCode: '62704',
        phoneNumber: '+1 217 555 0100',
      }),
    ).toEqual(['Test Kunde', '221 Baker St', 'Apt 4B', 'Springfield IL 62704', 'USA', '+1 217 555 0100']);
  });

  it('should show a German address as before, with its additional line', async () => {
    expect(
      await shownLines({
        country: '1',
        streetName: 'Hauptstraße',
        apartment: '12a',
        additionalAddressInformation: 'Hinterhaus',
        city: 'Jena',
        zipCode: '07743',
      }),
    ).toEqual(['Test Kunde', 'Hauptstraße 12a', 'Hinterhaus', '07743 Jena', 'Deutschland']);
  });

  it('should show the company above the name', async () => {
    expect(
      (await shownLines({ country: '1', companyName: 'GLAS IN JENA', streetName: 'Hauptstraße', apartment: '1' }))[0],
    ).toBe('GLAS IN JENA');
  });
});
