/**
 * Upstream contract of the address forms per country (copies of the original forms, useGlasJenaAddressForm.ts,
 * GlasJenaAddressDisplay.vue; concept in docs/adressformate.md).
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCopyHeader, MODULE_COPIES } from '../../copies';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readApp = (path: string) => readFileSync(join(process.cwd(), 'app', path), 'utf8');
const readModule = (path: string) => readFileSync(join(process.cwd(), 'modules/glas-jena/runtime', path), 'utf8');
const readPackage = (path: string) => readFileSync(join(process.cwd(), '../../node_modules', path), 'utf8');

/** A copy of the module without its header comment. */
const readCopy = (path: string) => {
  const copy = readModule(path).replace(/\r\n/g, '\n');
  return copy.slice(getCopyHeader(copy).length);
};

describe('upstream contract of the glas-jena module: address forms', () => {
  /*
   * Every copy is its original with the changes of copies/ (MODULE_COPIES). If one fails, the original changed: make the
   * copies again (`npx jiti modules/glas-jena/copies/generate.ts` in apps/web) and check the result, or adapt the rule
   * that no longer finds its place.
   */
  it.each(MODULE_COPIES)('should find the original of $file unchanged except for the changes of the copy', (copy) => {
    expect(readCopy(copy.file)).toBe(copy.make(readApp(copy.original)));
  });

  it('should find what the original address display shows, which GlasJenaAddressDisplay shows too', () => {
    /* A new line of the original (e.g. another getter) would be missing in the module's display */
    const display = readApp('components/AddressDisplay/AddressDisplay.vue');
    const getters = [...display.matchAll(/userAddressGetters\.(\w+)\(/g)].map(([, name]) => name);

    expect([...new Set(getters)].sort()).toEqual(
      [
        'getCity',
        'getCompanyName',
        'getFirstName',
        'getLastName',
        'getPhone',
        'getPostCode',
        'getPostNumber',
        'getStreetName',
        'getStreetNumber',
      ].sort(),
    );
    expect(display).toContain('useAggregatedCountries().localeCountryName(address.country)');
    expect(readApp('components/AddressDisplay/types.ts')).toContain('address: Address;');
  });

  it('should find the fields of the original schema that useGlasJenaAddressForm rebuilds', () => {
    /* A new field of the original would be missing in the module's schema */
    const composable = readApp('composables/useAddressForm/useAddressForm.ts');
    const schema = composable.slice(composable.indexOf('const validationSchema'), composable.indexOf('const notify'));
    const fields = [...schema.matchAll(/^ {6}(\w+): /gm)].map(([, name]) => name);

    expect(fields).toEqual([
      'firstName',
      'lastName',
      'country',
      'streetName',
      'apartment',
      'city',
      'state',
      'zipCode',
      'primary',
      'companyName',
      'vatNumber',
    ]);
    expect(composable).toContain('...toRefs(state.value),');
    expect(composable).toContain('hasCompany: false,');
  });

  it('should find the mapping of the shop package that sends the fields to PlentyONE', () => {
    /* Street address1, house number address2, line 2 address3 (DHL prints it), state and phone, see addressFormats.ts */
    const server = readPackage('@plentymarkets/shop-api/server/index.js');

    for (const line of [
      'address1: address.streetName,',
      'address2: address.apartment,',
      'address3: address.additionalAddressInformation,',
      'postalCode: address.zipCode,',
      'town: address.city,',
      'telephone: address.phoneNumber,',
      'stateId: convertToNumberOrNull(address.state),',
      'additionalAddressInformation: decodeHtml(addressData.address3),',
    ]) {
      expect(server).toContain(line);
    }
  });
});
