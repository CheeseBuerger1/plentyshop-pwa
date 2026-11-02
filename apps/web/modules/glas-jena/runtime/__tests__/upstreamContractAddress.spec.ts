/**
 * Upstream contract of the address forms per country (GlasJenaAddressFormShipping.vue, GlasJenaAddressFormBilling.vue,
 * GlasJenaAddressForm.vue, GlasJenaRegister.vue, useGlasJenaAddressForm.ts, useGlasJenaRegisterForm.ts; concept in
 * docs/adressformate.md).
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  toModuleAccountAddressForm,
  toModuleAddressForm,
  toModuleRegisterForm,
  toModuleRegisterPage,
} from './addressFormCopy';
import { toModuleContactInformation, toModuleOrderAddressData } from './displayCopy';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readApp = (path: string) => readFileSync(join(process.cwd(), 'app', path), 'utf8');
const readModule = (path: string) => readFileSync(join(process.cwd(), 'modules/glas-jena/runtime', path), 'utf8');
const readPackage = (path: string) => readFileSync(join(process.cwd(), '../../node_modules', path), 'utf8');

/** A copy of the module without its header comment. */
const readCopy = (path: string) =>
  readModule(path)
    .replace(/\r\n/g, '\n')
    .replace(/^<!--[\s\S]*?-->\n/, '');

describe('upstream contract of the glas-jena module: address forms', () => {
  /*
   * The copies are the originals with the changes of addressFormCopy.ts. If one of these fails, the original changed:
   * take the change over into the copy (or adapt addressFormCopy.ts if a replaced part moved).
   */
  it('should find the shipping address form of the checkout unchanged except for the changes of the copy', () => {
    const original = readApp('components/AddressFormShipping/AddressFormShipping.vue');

    expect(readCopy('components/GlasJenaAddressFormShipping.vue')).toBe(toModuleAddressForm(original, 'Shipping'));
  });

  it('should find the billing address form of the checkout unchanged except for the changes of the copy', () => {
    const original = readApp('components/AddressFormBilling/AddressFormBilling.vue');

    expect(readCopy('components/GlasJenaAddressFormBilling.vue')).toBe(toModuleAddressForm(original, 'Billing'));
  });

  it("should find the account's address form unchanged except for the changes of the copy", () => {
    const original = readApp('components/AddressForm/AddressForm.vue');

    expect(readCopy('components/GlasJenaAddressForm.vue')).toBe(toModuleAccountAddressForm(original));
  });

  it('should find the registration page unchanged except for the changes of the copy', () => {
    expect(readCopy('pages/GlasJenaRegister.vue')).toBe(toModuleRegisterPage(readApp('pages/register.vue')));
  });

  it("should find the registration's form unchanged except for the changes of the copy", () => {
    const copy = readModule('composables/useGlasJenaRegisterForm.ts')
      .replace(/\r\n/g, '\n')
      .replace(/^\/\*[\s\S]*?\*\/\n/, '');

    expect(copy).toBe(toModuleRegisterForm(readApp('composables/useRegisterForm/useRegisterForm.ts')));
  });

  it('should find the contact information unchanged except for the required mark of the copy', () => {
    expect(readCopy('components/GlasJenaContactInformation.vue')).toBe(
      toModuleContactInformation(readApp('components/ContactInformation/ContactInformation.vue')),
    );
  });

  it('should find the order address unchanged except for address line 2 and state of the copy', () => {
    expect(readCopy('components/GlasJenaOrderAddressData.vue')).toBe(
      toModuleOrderAddressData(readApp('components/OrderAddressData/OrderAddressData.vue')),
    );
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
