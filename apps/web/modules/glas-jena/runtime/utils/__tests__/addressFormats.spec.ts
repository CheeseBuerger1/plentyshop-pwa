import {
  ADDRESS_GROUP_COUNTRIES,
  getAddressFields,
  getAddressFormat,
  getAddressGroup,
  getAddressRows,
  getStateOptions,
  hasNonLatinCharacters,
  isAddressLineTooLong,
  isLegacyAddress,
  joinStreetAndNumber,
  normalizePostalCode,
} from '../addressFormats';

const withStates = { states: [{ id: 1 }] };

/** The fields of a country as `name:columns`, with `*` for required ones. */
const layout = (iso: string, { legacy = false, states = true } = {}) =>
  getAddressFields(getAddressFormat({ isoCode2: iso, states: states ? [{ id: 1 }] : [] }), legacy).map(
    ({ name, span, required }) => `${name}:${span}${required ? '*' : ''}`,
  );

/** The rows of a country as the names of their fields. */
const rowNames = (iso: string) =>
  getAddressRows(getAddressFields(getAddressFormat({ isoCode2: iso }))).map(({ fields, numberFirst }) =>
    [fields.map(({ name }) => name).join('+'), numberFirst ? '(number first)' : ''].join(''),
  );

/** The labels of choices. */
const optionLabels = (options: { label: string }[]) => options.map(({ label }) => label);

/** The labels of street, house number and line 2 of a country. */
const streetLabels = (iso: string) =>
  getAddressFields(getAddressFormat({ isoCode2: iso }))
    .filter(({ name }) => ['streetName', 'apartment', 'additionalAddressInformation'].includes(name))
    .map(({ label }) => label);

describe('addressFormats', () => {
  describe('getAddressGroup', () => {
    it('should put each example country of the concept into its group', () => {
      expect(['DE', 'AT', 'CH', 'NL'].map(getAddressGroup)).toEqual(['A', 'A', 'A', 'A']);
      expect(['IT', 'ES', 'PL', 'BE'].map(getAddressGroup)).toEqual(['B', 'B', 'B', 'B']);
      expect(['US', 'GB', 'FR', 'CA', 'IE'].map(getAddressGroup)).toEqual(['C', 'C', 'C', 'C', 'C']);
      expect(['JP', 'KR', 'CN'].map(getAddressGroup)).toEqual(['D', 'D', 'D']);
    });

    it('should give group E to countries not listed, unknown and missing codes', () => {
      expect(getAddressGroup('HK')).toBe('E');
      expect(getAddressGroup('QQ')).toBe('E');
      expect(getAddressGroup(undefined)).toBe('E');
    });

    it('should accept lower case codes', () => {
      expect(getAddressGroup('us')).toBe('C');
    });

    it('should list every country in one group only', () => {
      const all = Object.values(ADDRESS_GROUP_COUNTRIES).flat();

      expect(new Set(all).size).toBe(all.length);
    });
  });

  describe('getAddressFormat', () => {
    it('should require the state of the US where PlentyONE has a list', () => {
      expect(getAddressFormat({ isoCode2: 'US', ...withStates })).toEqual({
        group: 'C',
        singleLine: false,
        postalCode: 'required',
        state: 'required',
        postalCodeLabel: 'zipCode',
        stateLabel: 'state',
        houseNumberLabel: 'houseNumber',
        stateCodes: true,
      });
    });

    it('should take the address of Great Britain as one line, like PlentyONE', () => {
      expect(getAddressFormat({ isoCode2: 'GB' })).toMatchObject({ singleLine: true, postalCodeLabel: 'postcode' });
    });

    it('should offer the province of Italy without requiring it', () => {
      expect(getAddressFormat({ isoCode2: 'IT', ...withStates }).state).toBe('optional');
    });

    it('should not show a state where PlentyONE has no list, even if the country requires one', () => {
      expect(getAddressFormat({ isoCode2: 'US', states: [] }).state).toBe('none');
    });

    it('should not show the state of Germany although PlentyONE has a list', () => {
      expect(getAddressFormat({ isoCode2: 'DE', ...withStates }).state).toBe('none');
    });

    it('should hide the postal code of Hong Kong and require it everywhere else, as PlentyONE does', () => {
      expect(getAddressFormat({ isoCode2: 'HK' }).postalCode).toBe('none');
      expect(getAddressFormat({ isoCode2: 'IE' })).toMatchObject({
        postalCode: 'required',
        postalCodeLabel: 'eircode',
      });
    });

    it('should name the prefecture and the block of Japan', () => {
      expect(getAddressFormat({ isoCode2: 'JP', ...withStates })).toMatchObject({
        group: 'D',
        state: 'required',
        stateLabel: 'prefecture',
        houseNumberLabel: 'block',
      });
    });

    it('should give the German form while no country is chosen', () => {
      expect(getAddressFormat(undefined)).toMatchObject({ group: 'A', singleLine: false, state: 'none' });
    });
  });

  describe('getStateOptions', () => {
    const australia = [
      { id: 558, name: 'Victoria', isoCode3166: 'VIC' },
      { id: 559, name: 'New South Wales', isoCode3166: 'NSW' },
      { id: 560, name: 'Lord Howe', isoCode3166: null },
    ];

    it('should list the states by abbreviation in alphabetical order, a state without one by name', () => {
      expect(getStateOptions(australia, true)).toEqual([
        { value: '560', label: 'Lord Howe' },
        { value: '559', label: 'NSW' },
        { value: '558', label: 'VIC' },
      ]);
    });

    it("should list the states by name in PlentyONE's order elsewhere", () => {
      expect(optionLabels(getStateOptions(australia, false))).toEqual(['Victoria', 'New South Wales', 'Lord Howe']);
    });

    it('should give no choices without a list', () => {
      expect(getStateOptions(undefined, true)).toEqual([]);
    });
  });

  describe('normalizePostalCode', () => {
    it('should trim and capitalise the postal code but keep its inner space', () => {
      expect(normalizePostalCode(' sw1a 2aa ')).toBe('SW1A 2AA');
      expect(normalizePostalCode('1015cj')).toBe('1015CJ');
      expect(normalizePostalCode(undefined)).toBe('');
    });
  });

  describe('isLegacyAddress', () => {
    it('should take a British address with house number for the old form', () => {
      expect(isLegacyAddress(getAddressFormat({ isoCode2: 'GB' }), '10')).toBe(true);
    });

    it('should not take an address with house number field or a British one without number for the old form', () => {
      expect(isLegacyAddress(getAddressFormat({ isoCode2: 'US' }), '221')).toBe(false);
      expect(isLegacyAddress(getAddressFormat({ isoCode2: 'GB' }), ' ')).toBe(false);
    });
  });

  describe('joinStreetAndNumber', () => {
    it('should put the number in front for groups C and D', () => {
      expect(joinStreetAndNumber('Downing Street', 10, 'C')).toBe('10 Downing Street');
      expect(joinStreetAndNumber('Marunouchi', '1-2-3', 'D')).toBe('1-2-3 Marunouchi');
    });

    it('should put the number behind for the other groups', () => {
      expect(joinStreetAndNumber('Via Roma', '12', 'B')).toBe('Via Roma 12');
    });

    it('should keep a street without number as it is', () => {
      expect(joinStreetAndNumber('10 Downing Street', '', 'C')).toBe('10 Downing Street');
    });
  });

  describe('hasNonLatinCharacters', () => {
    it('should find Japanese and Cyrillic letters', () => {
      expect(hasNonLatinCharacters('丸の内1-2-3')).toBe(true);
      expect(hasNonLatinCharacters('Jena', 'ул. Тверская 7')).toBe(true);
    });

    it('should accept Latin letters with accents, digits and punctuation', () => {
      expect(hasNonLatinCharacters('Calle Mayor 5, 3º B', 'Łódź', 'Hauptstraße 12a', "Queen's Road #01-02", 7)).toBe(
        false,
      );
    });
  });

  describe('isAddressLineTooLong', () => {
    it('should flag a street longer than the 50 characters of the DHL street field', () => {
      expect(isAddressLineTooLong('x'.repeat(50))).toBe(false);
      expect(isAddressLineTooLong('x'.repeat(51))).toBe(true);
    });
  });

  describe('getAddressFields', () => {
    it('should keep street and house number apart in Germany, postal code and town in one row', () => {
      expect(layout('DE')).toEqual([
        'streetName:2*',
        'apartment:1*',
        'additionalAddressInformation:3',
        'zipCode:1*',
        'city:2*',
        'phoneNumber:3',
      ]);
    });

    it('should put the house number of the US first and town, state and ZIP in one row', () => {
      expect(layout('US')).toEqual([
        'apartment:1*',
        'streetName:2*',
        'additionalAddressInformation:3',
        'city:1*',
        'state:1*',
        'zipCode:1*',
        'phoneNumber:3',
      ]);
    });

    it('should give Great Britain one address line and the postcode the rest of the row', () => {
      expect(layout('GB', { states: false })).toEqual([
        'streetName:3*',
        'additionalAddressInformation:3',
        'city:1*',
        'zipCode:2*',
        'phoneNumber:3',
      ]);
    });

    it('should put the postal code before the town in France, Ireland and the other countries of group C', () => {
      expect(layout('FR', { states: false })).toEqual([
        'apartment:1*',
        'streetName:2*',
        'additionalAddressInformation:3',
        'zipCode:1*',
        'city:2*',
        'phoneNumber:3',
      ]);
      expect(layout('IE', { states: false }).slice(3, 5)).toEqual(['zipCode:1*', 'city:2*']);
    });

    it('should show street and an optional house number for a British address in its old form', () => {
      expect(layout('GB', { legacy: true, states: false }).slice(0, 2)).toEqual(['streetName:2*', 'apartment:1']);
    });

    it('should begin Japan with postal code and prefecture, then district and block', () => {
      expect(layout('JP')).toEqual([
        'zipCode:1*',
        'state:2*',
        'city:3*',
        'streetName:2*',
        'apartment:1*',
        'additionalAddressInformation:3',
        'phoneNumber:3',
      ]);
    });

    it('should give the town the whole row in Hong Kong, which has no postal codes', () => {
      expect(layout('HK', { states: false }).slice(3)).toEqual(['city:3*', 'phoneNumber:3']);
    });

    it('should offer the province of Italy below postal code and town, not required', () => {
      expect(layout('IT').slice(3)).toEqual(['zipCode:1*', 'city:2*', 'state:3', 'phoneNumber:3']);
    });

    it('should name street, number and line 2 per group', () => {
      expect(streetLabels('IT')).toEqual(['street', 'houseNumber', 'additionalInformation']);
      expect(streetLabels('US')).toEqual(['houseNumber', 'street', 'unit']);
      expect(streetLabels('GB')).toEqual(['streetAddress', 'unit']);
      expect(streetLabels('JP')).toEqual(['districtStreet', 'block', 'building']);
    });
  });
  describe('getAddressRows', () => {
    it('should put street and house number into one row, the number first in the US', () => {
      expect(rowNames('US').slice(0, 2)).toEqual([
        'apartment+streetName(number first)',
        'additionalAddressInformation',
      ]);
      expect(rowNames('DE')[0]).toBe('streetName+apartment');
    });

    it('should give every other field a row of its own', () => {
      expect(rowNames('GB')).toEqual(['streetName', 'additionalAddressInformation', 'city', 'zipCode', 'phoneNumber']);
    });
  });
});
