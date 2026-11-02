import { string } from 'yup';
import { getAddressFormat } from './addressFormats';
import type { AddressRuleCountry, AddressRuleMessages } from './types';

/** Length of a phone number, as in the account's address form (`minlength`/`maxlength`). */
export const PHONE_LENGTH = /^.{7,18}$/;

/**
 * The validation rules per country that the address forms of the checkout (useGlasJenaAddressForm) and the registration
 * (useGlasJenaRegisterForm) share, see addressFormats.ts and docs/adressformate.md. `countries` gives the form's
 * countries when a field is checked (they load after the form is built).
 */
export const getAddressRules = (countries: () => AddressRuleCountry[], messages: AddressRuleMessages) => {
  const formatOf = (countryId: string | undefined) =>
    getAddressFormat(countries().find((entry) => entry.id === Number(countryId)));
  return {
    /** Required except in Great Britain, whose address is one line (PlentyONE requires it everywhere else) */
    apartment: () =>
      string()
        .trim()
        .when('country', ([countryId], schema) =>
          formatOf(countryId).singleLine ? schema.optional() : schema.required(messages.required),
        ),
    /** Address line 2 (PlentyONE `address3`), optional */
    additionalAddressInformation: () => string().trim().optional(),
    /** Required in the countries of STATE_REQUIRED_COUNTRIES that have a list in PlentyONE */
    state: () =>
      string().when('country', ([countryId], schema) =>
        formatOf(countryId).state === 'required' ? schema.required(messages.required) : schema.optional(),
      ),
    /** Optional; when given 7 to 18 characters */
    phoneNumber: () =>
      string().trim().optional().matches(PHONE_LENGTH, { message: messages.phoneInvalid, excludeEmptyString: true }),
  };
};
