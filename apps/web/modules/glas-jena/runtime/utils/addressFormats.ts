import type {
  AddressCountry,
  AddressFieldRow,
  AddressFieldSlot,
  AddressFormat,
  AddressGroup,
  AddressState,
  AddressStateOption,
  AddressValue,
  PostalCodeLabel,
  StateLabel,
} from './types';

/*
 * Address forms per country of delivery (wish of the shop owner, 2026-10-31; concept and sources in
 * docs/adressformate.md). Data only: the forms read it through getAddressFormat, no country is handled in code.
 * Countries are keyed by their ISO code, so the PlentyONE special areas (Helgoland, Büsingen, Balearic Islands) follow
 * their country. Every country not listed gets group E, also new countries of delivery.
 *
 * PlentyONE requires a house number (`address2`) and a postal code for every country except Great Britain (tested on
 * 2026-11-02; not a setting, the lists of required fields of the shop are empty). So street and house number are two
 * fields everywhere except GB, in the order of the country (number first in group C); the customer fills in both, nothing
 * is split. The fields go to PlentyONE as before: street `address1`, number `address2`, line 2 `address3` (DHL prints it
 * above the street), postal code, town, state (`stateId`) and phone.
 */

/** A list of ISO codes written as one line separated by spaces (long lists stay readable). */
const isoCodes = (codes: string): readonly string[] => codes.split(' ');

/** Countries of the groups A–D (ISO 3166-1 alpha-2); all others are group E. */
export const ADDRESS_GROUP_COUNTRIES: Record<Exclude<AddressGroup, 'E'>, readonly string[]> = {
  /* Street and house number as in the German form (confirmed by the shop owner, 2026-11-01) */
  A: ['DE', 'AT', 'CH', 'NL'],
  /* Number behind the street */
  B: isoCodes(
    'BE LI DK NO SE FI IS FO GL EE LV LT PL CZ SK HU SI HR BA RS ME MK XK AL BG RO MD UA BY RU GR CY IT SM ES IC EA PT AD TR GE AM AZ KZ IL AR CL UY PY PE MX BR',
  ),
  /* Number in front of the street */
  C: isoCodes('US CA AU NZ GB IE IM JE GI FR GF GP RE YT MC LU ZA SG MY PH TT'),
  /* Area-based: postal code, prefecture and town first */
  D: ['JP', 'KR', 'CN'],
};

/** Countries whose address PlentyONE takes as one line without house number (its English form). */
export const SINGLE_LINE_COUNTRIES: readonly string[] = ['GB'];

/**
 * Countries whose state is required: PlentyONE requires it (US, CA; for the US also DHL), or it belongs to the postal
 * address (libaddressinput). In IT and ID it stays optional without any notice (wish of the shop owner, 2026-11-01).
 */
export const STATE_REQUIRED_COUNTRIES: readonly string[] = ['US', 'CA', 'AU', 'BR', 'CN', 'IN', 'JP', 'MX'];

/**
 * Countries whose states are listed by their abbreviation ("IL", "ON", "NSW", PlentyONE's `isoCode3166`), as their
 * addresses write them (wish of the shop owner, 2026-11-02: the full names looked odd in the narrow field).
 */
export const STATE_CODE_COUNTRIES: readonly string[] = ['US', 'CA', 'AU'];

/** Countries whose state is offered although not required (PlentyONE has a list, the postal address knows it). */
export const STATE_OPTIONAL_COUNTRIES: readonly string[] = ['AR', 'ID', 'IT', 'TH'];

/** Countries without postal codes: the field is hidden and PlentyONE, which requires one, gets POSTAL_CODE_NONE. */
export const POSTAL_CODE_NONE_COUNTRIES: readonly string[] = ['AE', 'HK', 'JM', 'MO', 'PA'];

/** The postal code sent for countries without postal codes (chosen by the shop owner, 2026-11-02). */
export const POSTAL_CODE_NONE = '0';

/** The usual name of the postal code where it is not "postal code". */
const POSTAL_CODE_LABELS: Partial<Record<string, PostalCodeLabel>> = {
  US: 'zipCode',
  GB: 'postcode',
  AU: 'postcode',
  NZ: 'postcode',
  IM: 'postcode',
  JE: 'postcode',
  GI: 'postcode',
  IE: 'eircode',
};

/** The usual name of the state; countries not listed say "region". */
const STATE_LABELS: Partial<Record<string, StateLabel>> = {
  US: 'state',
  AU: 'state',
  BR: 'state',
  MX: 'state',
  IN: 'state',
  CA: 'province',
  CN: 'province',
  AR: 'province',
  ID: 'province',
  IT: 'province',
  TH: 'province',
  JP: 'prefecture',
};

/** The usual name of the house number where it is not "house number": the block of a Japanese address. */
const HOUSE_NUMBER_LABELS: Partial<Record<string, string>> = {
  JP: 'block',
};

/** Space of the street field of DHL; a longer street gets a notice (wish of the shop owner, 2026-11-01). */
export const ADDRESS_LINE_MAX_LENGTH = 50;

/** Group of a country by its ISO code; E for every country not listed. */
export const getAddressGroup = (isoCode: string | null | undefined): AddressGroup => {
  const iso = (isoCode ?? '').toUpperCase();
  const entry = Object.entries(ADDRESS_GROUP_COUNTRIES).find(([, countries]) => countries.includes(iso));
  return entry ? (entry[0] as AddressGroup) : 'E';
};

/**
 * The address form of a country of the shop: group, one line or street and number, whether postal code and state are
 * shown and required, and their labels. The state is only shown where PlentyONE has a list for the country (`states`).
 * Without a country (none chosen yet) the German form.
 */
export const getAddressFormat = (country: AddressCountry): AddressFormat => {
  const iso = (country?.isoCode2 ?? 'DE').toUpperCase();
  const hasStates = (country?.states?.length ?? 0) > 0;
  let state: AddressFormat['state'] = 'none';
  if (hasStates && STATE_REQUIRED_COUNTRIES.includes(iso)) {
    state = 'required';
  } else if (hasStates && STATE_OPTIONAL_COUNTRIES.includes(iso)) {
    state = 'optional';
  }
  return {
    group: getAddressGroup(iso),
    singleLine: SINGLE_LINE_COUNTRIES.includes(iso),
    postalCode: POSTAL_CODE_NONE_COUNTRIES.includes(iso) ? 'none' : 'required',
    state,
    postalCodeLabel: POSTAL_CODE_LABELS[iso] ?? 'postalCode',
    stateLabel: STATE_LABELS[iso] ?? 'region',
    stateCodes: STATE_CODE_COUNTRIES.includes(iso),
    houseNumberLabel: HOUSE_NUMBER_LABELS[iso] ?? 'houseNumber',
  };
};

/**
 * The choices of the state field: by abbreviation in alphabetical order where the country writes it so (a state
 * without one keeps its name), otherwise by name in PlentyONE's order (Japan's prefectures from north to south).
 */
export const getStateOptions = (states: AddressState[] | null | undefined, useCodes: boolean): AddressStateOption[] => {
  const options = (states ?? []).map((state) => ({
    value: String(state.id),
    label: (useCodes && state.isoCode3166) || state.name,
  }));
  return useCodes ? options.sort((first, second) => first.label.localeCompare(second.label)) : options;
};

/** Postal code without surrounding spaces and in capitals ("sw1a 2aa" → "SW1A 2AA"; PlentyONE's NL rule wants them). */
export const normalizePostalCode = (value: AddressValue) =>
  String(value ?? '')
    .trim()
    .toUpperCase();

/**
 * An address of a single-line country (GB) saved with a house number (the German form of the LTS shop and of the shop
 * until 2026-11): edited with its two fields, so nothing is joined or split.
 */
export const isLegacyAddress = (format: AddressFormat, houseNumber: AddressValue) =>
  format.singleLine && !!String(houseNumber ?? '').trim();

/**
 * Street and house number as one line, when the customer changes to a single-line country (GB): the number in front
 * in groups C and D ("10 Downing Street"), behind elsewhere.
 */
export const joinStreetAndNumber = (street: AddressValue, houseNumber: AddressValue, group: AddressGroup) => {
  const parts = [String(street ?? '').trim(), String(houseNumber ?? '').trim()].filter(Boolean);
  return (group === 'C' || group === 'D' ? parts.reverse() : parts).join(' ');
};

/** Letters outside the Latin script (Kanji, Cyrillic, …), which the DHL label cannot print. */
const NON_LATIN = /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/u;

/** Whether one of the values has letters outside the Latin script. */
export const hasNonLatinCharacters = (...values: AddressValue[]) =>
  values.some((value) => NON_LATIN.test(String(value ?? '')));

/** Whether the street (or the single address line) is longer than the street field of DHL. */
export const isAddressLineTooLong = (value: AddressValue) =>
  String(value ?? '').trim().length > ADDRESS_LINE_MAX_LENGTH;

/** Label of the street and of line 2 per group (the house number has its own, see HOUSE_NUMBER_LABELS). */
const LINE_LABELS: Record<AddressGroup, [string, string]> = {
  A: ['street', 'additionalInformation'],
  B: ['street', 'additionalInformation'],
  C: ['street', 'unit'],
  D: ['districtStreet', 'building'],
  E: ['street', 'additionalInformation'],
};

/**
 * Street, house number and line 2: the number in front in group C, behind elsewhere; one line in a single-line country
 * (GB) unless the address has its old house number (`legacy`, see isLegacyAddress), which is optional there.
 */
const getStreetFields = (format: AddressFormat, legacy: boolean): AddressFieldSlot[] => {
  const [street, line2] = LINE_LABELS[format.group];
  const additional: AddressFieldSlot = { name: 'additionalAddressInformation', label: line2, required: false, span: 3 };
  if (format.singleLine && !legacy) {
    return [{ name: 'streetName', label: 'streetAddress', required: true, span: 3 }, additional];
  }
  const streetField: AddressFieldSlot = { name: 'streetName', label: street, required: true, span: 2 };
  const numberField: AddressFieldSlot = {
    name: 'apartment',
    label: format.houseNumberLabel,
    required: !format.singleLine,
    span: 1,
  };
  /* An old British address was typed into the German form: street first, as it was entered */
  if (format.group === 'C' && !legacy) {
    return [numberField, streetField, additional];
  }
  return [streetField, numberField, additional];
};

/** Fields side by side in one row of the grid: one column each, the last one takes the rest of the row. */
const row = (fields: AddressFieldSlot[]): AddressFieldSlot[] =>
  fields.map((field, index) => ({
    ...field,
    span: index === fields.length - 1 ? ((4 - fields.length) as AddressFieldSlot['span']) : 1,
  }));

/**
 * Postal code, town and state in the order of the country's addresses: "Springfield, IL 62704" in group C with a
 * state (US, CA, AU: town, state, ZIP in one row) and in Great Britain (town, postcode), postal code and prefecture
 * first in group D, postal code and town everywhere else with the state below – also in the other countries of group C
 * (France and the others write it so; chosen by the shop owner for all of them, 2026-11-03). Fields the country does
 * not use are left out, the others take their columns.
 */
const getLocalityFields = (format: AddressFormat): AddressFieldSlot[] => {
  const zip: AddressFieldSlot[] =
    format.postalCode === 'none'
      ? []
      : [{ name: 'zipCode', label: format.postalCodeLabel, required: format.postalCode === 'required', span: 1 }];
  const state: AddressFieldSlot[] =
    format.state === 'none'
      ? []
      : [{ name: 'state', label: format.stateLabel, required: format.state === 'required', span: 3 }];
  const city: AddressFieldSlot = {
    name: 'city',
    label: format.group === 'D' ? 'cityWard' : 'city',
    required: true,
    span: 3,
  };
  if (format.group === 'C' && (state.length || format.singleLine)) {
    return row([city, ...state, ...zip]);
  }
  if (format.group === 'D') {
    return state.length ? [...row([...zip, ...state]), city] : row([...zip, city]);
  }
  return [...row([...zip, city]), ...state];
};

const STREET_AND_NUMBER = ['apartment', 'streetName'];

/**
 * The fields as rows of the form: street and house number share a row of their own, so the number stays narrow also
 * when it comes first (the form's columns are 50 %, the rest and 120 px); every other field is a row of one.
 */
export const getAddressRows = (fields: AddressFieldSlot[]): AddressFieldRow[] => {
  const rows: AddressFieldRow[] = [];
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index]!;
    const next = fields[index + 1];
    if (next && STREET_AND_NUMBER.includes(field.name) && STREET_AND_NUMBER.includes(next.name)) {
      rows.push({ key: field.name, fields: [field, next], numberFirst: field.name === 'apartment' });
      index++;
    } else {
      rows.push({ key: field.name, fields: [field], numberFirst: false });
    }
  }
  return rows;
};

/**
 * The fields of the address part in the order of the country's form, each with its label, whether it is required and
 * its columns; the optional phone number last. Group D begins with postal code, prefecture and town (Japanese order),
 * the others with the street.
 */
export const getAddressFields = (format: AddressFormat, legacy = false): AddressFieldSlot[] => {
  const street = getStreetFields(format, legacy);
  const locality = getLocalityFields(format);
  const phone: AddressFieldSlot = { name: 'phoneNumber', label: 'phone', required: false, span: 3 };
  return [...(format.group === 'D' ? [...locality, ...street] : [...street, ...locality]), phone];
};
