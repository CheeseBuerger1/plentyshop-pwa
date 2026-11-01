/**
 * How the module's address forms of the checkout come from the originals (GlasJenaAddressFormShipping.vue from
 * components/AddressFormShipping/AddressFormShipping.vue, GlasJenaAddressFormBilling.vue from AddressFormBilling.vue):
 * the country moves to the top (GlasJenaAddressCountry), the address part from the street to the country becomes
 * GlasJenaAddressFields, the schema comes from useGlasJenaAddressForm, and state, address line 2 and phone number are
 * fields of the form. upstreamContractAddress.spec.ts applies these changes to the originals and expects the copies;
 * if the original changed, it fails and the change has to be taken over into the copy.
 */

/** Which of the two checkout forms. */
type AddressFormKind = 'Shipping' | 'Billing';

const FIRST_NAME_LABEL = `    <label>
      <UiFormLabel class="flex">
        <span class="mr-1">
          {{ firstNameLabelText }}`;

const ADDRESS_START = `    <label class="@md:col-span-2">
      <UiFormLabel>{{ t('form.streetNameLabel') }} {{ t('form.required') }}</UiFormLabel>`;

const ADDRESS_END = `      <ErrorMessage as="span" name="country" class="flex text-negative-700 text-sm mt-2" />
    </label>
`;

const countriesOf = (kind: AddressFormKind) => (kind === 'Shipping' ? 'shippingCountries' : 'billingCountries');

const countryField = (kind: AddressFormKind) => `    <GlasJenaAddressCountry
      v-model="country"
      :countries="${countriesOf(kind)}"
      :error="errors['country']"
      :field-attributes="countryAttributes"
    />

`;

const addressFields = (kind: AddressFormKind) => `    <GlasJenaAddressFields
      v-model:street-name="streetName"
      v-model:apartment="apartment"
      v-model:additional-address-information="additionalAddressInformation"
      v-model:zip-code="zipCode"
      v-model:city="city"
      v-model:state="state"
      v-model:phone-number="phoneNumber"
      :country="country"
      :countries="${countriesOf(kind)}"
      :errors="errors"
      :field-attributes="{
        streetName: streetNameAttributes,
        apartment: apartmentAttributes,
        additionalAddressInformation: additionalAddressInformationAttributes,
        zipCode: zipCodeAttributes,
        city: cityAttributes,
        state: stateAttributes,
        phoneNumber: phoneNumberAttributes,
      }"
    />
`;

/** Replaces exactly one occurrence, so a changed original fails instead of giving a half-changed copy. */
const replaceOnce = (text: string, search: string, replacement: string) => {
  const index = text.indexOf(search);
  if (index < 0 || text.indexOf(search, index + 1) >= 0) {
    throw new Error(`Not found exactly once in the original: ${search.slice(0, 80)}`);
  }
  return text.slice(0, index) + replacement + text.slice(index + search.length);
};

/** Replaces the text from `start` up to and including `end` (both exactly once). */
const replaceBetween = (text: string, start: string, end: string, replacement: string) => {
  const from = text.indexOf(start);
  const to = text.indexOf(end, from);
  if (from < 0 || to < 0) {
    throw new Error(`Block not found in the original: ${start.slice(0, 80)}`);
  }
  return replaceOnce(text, text.slice(from, to + end.length), replacement);
};

/** The module's copy of an address form of the checkout, made from the original (without the copy's header comment). */
export const toModuleAddressForm = (original: string, kind: AddressFormKind) => {
  let copy = original.replace(/\r\n/g, '\n');
  copy = replaceOnce(copy, FIRST_NAME_LABEL, countryField(kind) + FIRST_NAME_LABEL);
  copy = replaceBetween(copy, ADDRESS_START, ADDRESS_END, addressFields(kind));
  copy = replaceOnce(
    copy,
    `import type { AddressForm${kind}Props } from './types';\n`,
    `import type { AddressForm${kind}Props } from '~/components/AddressForm${kind}/types';\n` +
      `import GlasJenaAddressCountry from './GlasJenaAddressCountry.vue';\n` +
      `import GlasJenaAddressFields from './GlasJenaAddressFields.vue';\n` +
      `import { useGlasJenaAddressForm } from '../composables/useGlasJenaAddressForm';\n`,
  );
  /* The country select is in GlasJenaAddressCountry now */
  copy = replaceOnce(copy, `, SfSelect } from '@storefront-ui/vue';`, ` } from '@storefront-ui/vue';`);
  copy = replaceOnce(
    copy,
    `} = useAddressForm(AddressType.${kind});`,
    `} = useGlasJenaAddressForm(AddressType.${kind});`,
  );
  copy = replaceOnce(
    copy,
    `const [vatNumber, vatNumberAttributes] = defineField('vatNumber');\n`,
    `const [vatNumber, vatNumberAttributes] = defineField('vatNumber');\n` +
      `const [state, stateAttributes] = defineField('state');\n` +
      `const [additionalAddressInformation, additionalAddressInformationAttributes] =\n` +
      `  defineField('additionalAddressInformation');\n` +
      `const [phoneNumber, phoneNumberAttributes] = defineField('phoneNumber');\n`,
  );
  copy = replaceOnce(
    copy,
    `    zipCode: addressSource?.zipCode || '',\n`,
    `    zipCode: addressSource?.zipCode || '',\n` +
      `    state: addressSource?.state || '',\n` +
      `    additionalAddressInformation: addressSource?.additionalAddressInformation || '',\n` +
      `    phoneNumber: addressSource?.phoneNumber || '',\n`,
  );
  copy = replaceOnce(
    copy,
    `    zipCode: zipCode.value,\n`,
    `    zipCode: zipCode.value,\n` +
      `    state: state.value,\n` +
      `    additionalAddressInformation: additionalAddressInformation.value,\n` +
      `    phoneNumber: phoneNumber.value,\n`,
  );
  return copy;
};

const ACCOUNT_FIRST_NAME = `    <label>
      <UiFormLabel>{{ t('form.firstNameLabel') }} {{ t('form.required') }}</UiFormLabel>`;

const ACCOUNT_ADDRESS_START = `    <label class="@md:col-span-3">
      <UiFormLabel class="flex">
        <span class="mr-1">{{ t('form.phoneLabel') }}</span>`;

const ACCOUNT_ADDRESS_END = `      <SfInput v-model="defaultValues.zipCode" name="postalCode" autocomplete="postal-code" required />
    </label>
`;

const ACCOUNT_COUNTRY = `    <GlasJenaAddressCountry v-model="defaultValues.country" :countries="countries" native-required />

`;

const ACCOUNT_FIELDS = `    <GlasJenaAddressFields
      v-model:street-name="defaultValues.streetName"
      v-model:apartment="defaultValues.apartment"
      v-model:additional-address-information="defaultValues.additionalAddressInformation"
      v-model:zip-code="defaultValues.zipCode"
      v-model:city="defaultValues.city"
      v-model:state="defaultValues.state"
      v-model:phone-number="defaultValues.phoneNumber"
      :country="defaultValues.country"
      :countries="countries"
      native-required
    />
`;

const ACCOUNT_STATES = `
const states = computed(() => {
  const selectedCountry = defaultValues.value.country;
  return (
    countries.value.find(
      (country: ActiveShippingCountry | GeoRegulatedCountry) => country.id === Number(selectedCountry),
    )?.states ?? []
  );
});
`;

/**
 * The module's copy of the account's address form (GlasJenaAddressForm.vue from components/AddressForm/AddressForm.vue,
 * without the copy's header comment): country first, the address part from GlasJenaAddressFields (with the phone
 * number, which the original asks for above the country), address line 2 as a new value. Its states are in
 * GlasJenaAddressFields now. The form keeps the browser's checks (`required`), like the original.
 */
export const toModuleAccountAddressForm = (original: string) => {
  let copy = original.replace(/\r\n/g, '\n');
  copy = replaceOnce(copy, ACCOUNT_FIRST_NAME, ACCOUNT_COUNTRY + ACCOUNT_FIRST_NAME);
  copy = replaceBetween(copy, ACCOUNT_ADDRESS_START, ACCOUNT_ADDRESS_END, ACCOUNT_FIELDS);
  copy = replaceOnce(copy, ACCOUNT_STATES, '');
  copy = replaceOnce(
    copy,
    `import {
  type ActiveShippingCountry,
  type Address,
  AddressType,
  type GeoRegulatedCountry,
  userAddressGetters,
} from '@plentymarkets/shop-api';
import { SfCheckbox, SfInput, SfLoaderCircular, SfSelect } from '@storefront-ui/vue';
import type { AddressFormProps } from '~/components/AddressForm/types';
`,
    `import { type Address, AddressType, userAddressGetters } from '@plentymarkets/shop-api';
import { SfCheckbox, SfInput, SfLoaderCircular } from '@storefront-ui/vue';
import type { AddressFormProps } from '~/components/AddressForm/types';
import GlasJenaAddressCountry from './GlasJenaAddressCountry.vue';
import GlasJenaAddressFields from './GlasJenaAddressFields.vue';
`,
  );
  copy = replaceOnce(
    copy,
    `  apartment: userAddressGetters.getStreetNumber(savedAddress),\n`,
    `  apartment: userAddressGetters.getStreetNumber(savedAddress),\n` +
      `  additionalAddressInformation: savedAddress.additionalAddressInformation ?? '',\n`,
  );
  copy = replaceOnce(copy, `    apartment: '',\n`, `    apartment: '',\n    additionalAddressInformation: '',\n`);
  return copy;
};

const REGISTER_NAMES = `        <div class="grid grid-cols-1 @md:grid-cols-2 gap-4">
          <label>
            <UiFormLabel>
              {{ hasCompany ? t('form.firstNameLabel')`;

const REGISTER_ADDRESS_START = `        <div class="grid grid-cols-1 @md:grid-cols-2 gap-4">
          <label>
            <UiFormLabel>{{ t('form.streetNameLabel') }} {{ t('form.required') }}</UiFormLabel>`;

const REGISTER_ADDRESS_END = `            <ErrorMessage as="span" name="country" class="flex text-negative-700 text-sm mt-2" />
          </label>
        </div>
`;

const REGISTER_COUNTRY = `        <div class="grid grid-cols-1">
          <GlasJenaAddressCountry
            v-model="formFields.country.value"
            :countries="shippingCountries"
            :error="errors['country']"
            :field-attributes="formFieldsAttributes.country.value"
          />
        </div>

`;

const REGISTER_FIELDS = `        <div class="grid grid-cols-1 @md:grid-cols-[50%_1fr_120px] gap-4">
          <GlasJenaAddressFields
            v-model:street-name="formFields.streetName.value"
            v-model:apartment="formFields.apartment.value"
            v-model:additional-address-information="formFields.additionalAddressInformation.value"
            v-model:zip-code="formFields.zipCode.value"
            v-model:city="formFields.city.value"
            v-model:state="formFields.state.value"
            v-model:phone-number="formFields.phoneNumber.value"
            :country="formFields.country.value"
            :countries="shippingCountries"
            :errors="errors"
            :field-attributes="{
              streetName: formFieldsAttributes.streetName.value,
              apartment: formFieldsAttributes.apartment.value,
              additionalAddressInformation: formFieldsAttributes.additionalAddressInformation.value,
              zipCode: formFieldsAttributes.zipCode.value,
              city: formFieldsAttributes.city.value,
              state: formFieldsAttributes.state.value,
              phoneNumber: formFieldsAttributes.phoneNumber.value,
            }"
          />
        </div>
`;

/**
 * The module's copy of the registration page (GlasJenaRegister.vue from pages/register.vue, without the copy's header
 * comment): the country above the name, the address part from GlasJenaAddressFields, the form from
 * useGlasJenaRegisterForm.
 */
export const toModuleRegisterPage = (original: string) => {
  let copy = original.replace(/\r\n/g, '\n');
  copy = replaceOnce(copy, REGISTER_NAMES, REGISTER_COUNTRY + REGISTER_NAMES);
  copy = replaceBetween(copy, REGISTER_ADDRESS_START, REGISTER_ADDRESS_END, REGISTER_FIELDS);
  copy = replaceOnce(
    copy,
    `import { SfInput, SfLoaderCircular, SfCheckbox, SfIconCheck, SfIconClose, SfSelect } from '@storefront-ui/vue';\n`,
    `import { SfInput, SfLoaderCircular, SfCheckbox, SfIconCheck, SfIconClose } from '@storefront-ui/vue';\n`,
  );
  copy = replaceOnce(
    copy,
    `import type { Locale } from '#i18n';\n`,
    `import type { Locale } from '#i18n';\n` +
      `import GlasJenaAddressCountry from '../components/GlasJenaAddressCountry.vue';\n` +
      `import GlasJenaAddressFields from '../components/GlasJenaAddressFields.vue';\n` +
      `import { useGlasJenaRegisterForm } from '../composables/useGlasJenaRegisterForm';\n`,
  );
  return replaceOnce(copy, `} = useRegisterForm();`, `} = useGlasJenaRegisterForm();`);
};

/** Replaces every occurrence and expects `count` of them. */
const replaceCount = (text: string, search: string, replacement: string, count: number) => {
  const parts = text.split(search);
  if (parts.length - 1 !== count) {
    throw new Error(`Not found ${count} times in the original: ${search.slice(0, 80)}`);
  }
  return parts.join(replacement);
};

/**
 * The module's copy of the registration's form (useGlasJenaRegisterForm.ts from composables/useRegisterForm/
 * useRegisterForm.ts, without the copy's header comment): the rules of useGlasJenaAddressForm (house number not
 * required in Great Britain, postal code trimmed and capitalised, state required per country) and state, address
 * line 2 and phone number as fields of the form and of both addresses.
 */
export const toModuleRegisterForm = (original: string) => {
  let copy = original.replace(/\r\n/g, '\n');
  copy = replaceOnce(
    copy,
    `import type { UseRegisterFormReturn } from './types';\n`,
    `import { getAddressFormat, normalizePostalCode } from '../utils/addressFormats';\n`,
  );
  copy = replaceOnce(
    copy,
    `export const useRegisterForm = (): UseRegisterFormReturn => {`,
    `export const useGlasJenaRegisterForm = () => {`,
  );
  copy = replaceOnce(
    copy,
    `  const { getCountryZipCodeRegex } = useAggregatedCountries();\n`,
    `  const { default: shippingCountries, getCountryZipCodeRegex } = useAggregatedCountries();\n` +
      `  const formatOf = (countryId: string | undefined) =>\n` +
      `    getAddressFormat(shippingCountries.value.find((entry) => entry.id === Number(countryId)));\n`,
  );
  copy = replaceOnce(
    copy,
    `      apartment: '',\n`,
    `      apartment: '',\n      state: '',\n      additionalAddressInformation: '',\n      phoneNumber: '',\n`,
  );
  copy = replaceOnce(
    copy,
    `      apartment: string().trim().required(t('error.requiredField')).default(state.value.defaultFormValues.apartment),\n`,
    `      apartment: string()
        .trim()
        .when('country', ([countryId], schema) =>
          formatOf(countryId).singleLine ? schema.optional() : schema.required(t('error.requiredField')),
        )
        .default(state.value.defaultFormValues.apartment),
      additionalAddressInformation: string().trim().optional().default(''),
      state: string()
        .when('country', ([countryId], schema) =>
          formatOf(countryId).state === 'required' ? schema.required(t('error.requiredField')) : schema.optional(),
        )
        .default(''),
      phoneNumber: string()
        .trim()
        .optional()
        .matches(/^.{7,18}$/, { message: t('glasJenaAddress.phoneInvalid'), excludeEmptyString: true })
        .default(''),
`,
  );
  copy = replaceOnce(
    copy,
    `      zipCode: string()\n        .trim()\n`,
    `      zipCode: string()\n        .transform(normalizePostalCode)\n`,
  );
  copy = replaceOnce(
    copy,
    `  const [vatNumber, vatNumberAttributes] = defineField('vatNumber');\n`,
    `  const [vatNumber, vatNumberAttributes] = defineField('vatNumber');\n` +
      `  const [addressState, addressStateAttributes] = defineField('state');\n` +
      `  const [additionalAddressInformation, additionalAddressInformationAttributes] =\n` +
      `    defineField('additionalAddressInformation');\n` +
      `  const [phoneNumber, phoneNumberAttributes] = defineField('phoneNumber');\n`,
  );
  copy = replaceCount(
    copy,
    `        apartment: apartment.value,\n`,
    `        apartment: apartment.value,\n` +
      `        additionalAddressInformation: additionalAddressInformation.value,\n` +
      `        state: addressState.value,\n` +
      `        phoneNumber: phoneNumber.value,\n`,
    2,
  );
  copy = replaceOnce(
    copy,
    `      apartment,\n`,
    `      apartment,\n      state: addressState,\n      additionalAddressInformation,\n      phoneNumber,\n`,
  );
  return replaceOnce(
    copy,
    `      apartment: apartmentAttributes,\n`,
    `      apartment: apartmentAttributes,\n` +
      `      state: addressStateAttributes,\n` +
      `      additionalAddressInformation: additionalAddressInformationAttributes,\n` +
      `      phoneNumber: phoneNumberAttributes,\n`,
  );
};
