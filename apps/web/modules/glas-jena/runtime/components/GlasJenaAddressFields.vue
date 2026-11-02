<!--
  Address part of the address forms (checkout, account, registration) for the chosen country (wish of the shop owner,
  2026-10-31; concept in docs/adressformate.md): fields, order, labels and required fields per country from
  utils/addressFormats.ts. Street and house number are two fields (PlentyONE requires the number), in the order of the
  country; in Great Britain one line, which PlentyONE takes without number. Line 2 is PlentyONE's `address3`, which DHL
  prints above the street. A British address saved with a house number keeps both fields while it is edited.
  When the customer changes to Great Britain, street and number are joined to one line (visible before saving); a
  state of the old country is cleared. Countries without postal codes get the hidden POSTAL_CODE_NONE. Two notices,
  which never block the order (chosen by the shop owner, 2026-11-01): letters outside the Latin script and a street
  longer than DHL's street field.
-->
<template>
  <div
    v-for="row in rows"
    :key="row.key"
    :class="
      row.fields.length > 1
        ? ['@md:col-span-3 grid grid-cols-1 gap-4', row.numberFirst ? NUMBER_FIRST_COLUMNS : NUMBER_LAST_COLUMNS]
        : ['min-w-0', SPAN_CLASSES[row.fields[0]!.span]]
    "
  >
    <label
      v-for="field in row.fields"
      :key="field.name"
      class="block min-w-0"
      :data-testid="`gj-address-${field.name}`"
    >
      <UiFormLabel class="flex">
        <span class="mr-1">{{ labelOf(field) }}{{ field.required ? ` ${t('form.required')}` : '' }}</span>
        <UiFormHelperText v-if="!field.required">({{ t('form.optional') }})</UiFormHelperText>
      </UiFormLabel>
      <SfSelect
        v-if="field.name === 'state'"
        v-model="state"
        name="state"
        v-bind="fieldAttributes?.state"
        :placeholder="t('form.selectPlaceholder')"
        :invalid="!!errors?.state"
        :required="nativeRequired && field.required"
        wrapper-class-name="bg-white"
        class="!ring-1 !ring-neutral-200"
        autocomplete="address-level1"
      >
        <option v-for="option in stateOptions" :key="`state-${option.value}`" :value="option.value">
          {{ option.label }}
        </option>
      </SfSelect>
      <SfInput
        v-else
        v-model="models[field.name].value"
        :name="field.name === 'apartment' ? 'streetNumber' : field.name"
        :type="field.name === 'phoneNumber' ? 'tel' : 'text'"
        :autocomplete="AUTOCOMPLETE[field.name]"
        v-bind="fieldAttributes?.[field.name]"
        :invalid="!!errors?.[field.name]"
        :required="nativeRequired && field.required"
        @change="normalize(field, $event)"
      />
      <span v-if="errors?.[field.name]" class="flex text-negative-700 text-sm mt-2">{{ errors[field.name] }}</span>
      <span
        v-if="field.name === 'streetName' && tooLong"
        class="flex text-warning-700 text-sm mt-2"
        data-testid="gj-address-too-long"
      >
        {{ tLocal('tooLong', { max: ADDRESS_LINE_MAX_LENGTH }) }}
      </span>
    </label>
  </div>
  <p v-if="nonLatin" class="@md:col-span-3 text-warning-700 text-sm" data-testid="gj-address-non-latin">
    {{ tLocal('nonLatin') }}
  </p>
</template>

<script setup lang="ts">
import { SfInput, SfSelect } from '@storefront-ui/vue';
import {
  ADDRESS_LINE_MAX_LENGTH,
  POSTAL_CODE_NONE,
  getAddressFields,
  getAddressFormat,
  getAddressRows,
  getStateOptions,
  hasNonLatinCharacters,
  isAddressLineTooLong,
  isLegacyAddress,
  joinStreetAndNumber,
  normalizePostalCode,
} from '../utils/addressFormats';
import type { Ref } from 'vue';
import type { AddressFieldName, AddressFieldSlot } from '../utils/types';
import type { GlasJenaAddressFieldsProps, GlasJenaAddressFieldValue } from './types';

const {
  country,
  countries,
  errors,
  fieldAttributes,
  nativeRequired = false,
} = defineProps<GlasJenaAddressFieldsProps>();

const streetName = defineModel<GlasJenaAddressFieldValue>('streetName', { required: true });
const apartment = defineModel<GlasJenaAddressFieldValue>('apartment', { required: true });
const additionalAddressInformation = defineModel<GlasJenaAddressFieldValue>('additionalAddressInformation', {
  required: true,
});
const zipCode = defineModel<GlasJenaAddressFieldValue>('zipCode', { required: true });
const city = defineModel<GlasJenaAddressFieldValue>('city', { required: true });
const state = defineModel<string | undefined>('state', { required: true });
const phoneNumber = defineModel<GlasJenaAddressFieldValue>('phoneNumber', { required: true });

const { t: tLocal } = useI18n({ useScope: 'local' });

/* The text fields (the state is a select of its own) */
const models: Record<Exclude<AddressFieldName, 'state'>, Ref<GlasJenaAddressFieldValue>> = {
  streetName,
  apartment,
  additionalAddressInformation,
  zipCode,
  city,
  phoneNumber,
};

/**
 * Columns in the forms' grid `@md:grid-cols-[50%_1fr_120px]`. Every field has `min-w-0`: a select is as wide as its
 * longest option (US states), which pushed the row out of the form.
 */
const SPAN_CLASSES: Record<AddressFieldSlot['span'], string> = {
  1: '',
  2: '@md:col-span-2',
  3: '@md:col-span-3',
};

/* Street and house number in a row of their own: the number narrow, in front of the street or behind it */
const NUMBER_FIRST_COLUMNS = '@md:grid-cols-[120px_1fr]';
const NUMBER_LAST_COLUMNS = '@md:grid-cols-[1fr_120px]';

/* The house number gets none: browsers would fill in address line 2 there. Its input keeps the original name
   'streetNumber' (Cypress page objects of the shop). */
const AUTOCOMPLETE: Partial<Record<AddressFieldName, string>> = {
  streetName: 'address-line1',
  additionalAddressInformation: 'address-line2',
  zipCode: 'postal-code',
  city: 'address-level2',
  phoneNumber: 'tel',
};

const findCountry = (id: string | null | undefined) => countries.find((entry) => entry.id === Number(id));
const format = computed(() => getAddressFormat(findCountry(country)));
const legacy = ref(isLegacyAddress(format.value, apartment.value));
const rows = computed(() => getAddressRows(getAddressFields(format.value, legacy.value)));
const states = computed(() => findCountry(country)?.states ?? []);
const stateOptions = computed(() => getStateOptions(states.value, format.value.stateCodes));

const labelOf = (field: AddressFieldSlot) =>
  field.name === 'phoneNumber' ? t('form.phoneLabel') : tLocal(`label.${field.label}`);

/* From the input itself: the model may not have the typed value yet when `change` fires */
const normalize = (field: AddressFieldSlot, event: Event) => {
  if (field.name === 'zipCode') {
    zipCode.value = normalizePostalCode((event.target as HTMLInputElement | null)?.value);
  }
};

const tooLong = computed(() => isAddressLineTooLong(streetName.value));
const nonLatin = computed(() =>
  hasNonLatinCharacters(streetName.value, apartment.value, additionalAddressInformation.value, city.value),
);

/*
 * PlentyONE requires a postal code: countries without one send POSTAL_CODE_NONE in the hidden field. A saved address
 * keeps the code it has.
 */
if (format.value.postalCode === 'none' && !zipCode.value) {
  zipCode.value = POSTAL_CODE_NONE;
}

watch(
  () => country,
  (_newCountry, oldCountry) => {
    const oldFormat = getAddressFormat(findCountry(oldCountry));
    const hadNumberField = !oldFormat.singleLine || legacy.value;
    legacy.value = false;
    if (hadNumberField && format.value.singleLine && apartment.value) {
      streetName.value = joinStreetAndNumber(streetName.value, apartment.value, format.value.group);
      apartment.value = '';
    }
    if (state.value && !states.value.some((entry) => entry.id.toString() === state.value)) {
      state.value = '';
    }
    /* The hidden code of a country without postal codes replaces the old country's one, and goes when it is left */
    if (format.value.postalCode === 'none') {
      zipCode.value = POSTAL_CODE_NONE;
    } else if (oldFormat.postalCode === 'none' && zipCode.value === POSTAL_CODE_NONE) {
      zipCode.value = '';
    }
  },
);
</script>

<i18n lang="json">
{
  "en": {
    "label": {
      "street": "Street",
      "houseNumber": "House number",
      "block": "Block (chōme-ban-gō)",
      "additionalInformation": "Additional address information",
      "streetAddress": "Street address",
      "districtStreet": "District, street",
      "unit": "Apt, suite, unit, building",
      "building": "Building, room",
      "city": "City",
      "cityWard": "City, ward",
      "postalCode": "Postal code",
      "zipCode": "ZIP code",
      "postcode": "Postcode",
      "eircode": "Eircode",
      "state": "State",
      "province": "Province",
      "prefecture": "Prefecture",
      "region": "State, region"
    },
    "tooLong": "This is longer than {max} characters, more than fit on the shipping label. Please shorten it or move a part to the additional line.",
    "nonLatin": "Please use Latin letters, so that the shipping label can be read."
  },
  "de": {
    "label": {
      "street": "Straße",
      "houseNumber": "Hausnummer",
      "block": "Block (Chōme-Ban-Gō)",
      "additionalInformation": "Adresszusatz",
      "streetAddress": "Hausnummer und Straße",
      "districtStreet": "Stadtteil, Straße",
      "unit": "Wohnung, Suite, Gebäude",
      "building": "Gebäude, Zimmer",
      "city": "Ort",
      "cityWard": "Stadt, Bezirk",
      "postalCode": "Postleitzahl",
      "zipCode": "ZIP-Code",
      "postcode": "Postleitzahl",
      "eircode": "Eircode",
      "state": "Bundesstaat",
      "province": "Provinz",
      "prefecture": "Präfektur",
      "region": "Region"
    },
    "tooLong": "Das sind mehr als {max} Zeichen, mehr als auf das Versandetikett passen. Bitte kürzen Sie oder schreiben Sie einen Teil in den Adresszusatz.",
    "nonLatin": "Bitte verwenden Sie lateinische Buchstaben, damit das Versandetikett lesbar ist."
  }
}
</i18n>
