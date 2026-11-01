<!--
  Billing address form of the checkout (replaces components/AddressFormBilling/AddressFormBilling.vue, see
  COMPONENT_OVERRIDES): the address part per country (wish of the shop owner, 2026-10-31; concept in
  docs/adressformate.md). Copy of the original with the changes of GlasJenaAddressFormShipping.vue, see
  __tests__/addressFormCopy.ts. Everything else is the original; upstreamContractAddress.spec.ts shows when it changes.
-->
<template>
  <form
    novalidate
    class="grid grid-cols-1 @md:grid-cols-[50%_1fr_120px] gap-4"
    data-testid="billing-address-form"
    @submit.prevent="validateAndSubmitForm"
  >
    <GlasJenaAddressCountry
      v-model="country"
      :countries="billingCountries"
      :error="errors['country']"
      :field-attributes="countryAttributes"
    />

    <label>
      <UiFormLabel class="flex">
        <span class="mr-1">
          {{ firstNameLabelText }}
        </span>
        <UiFormHelperText v-if="firstNameHelperText">({{ firstNameHelperText }})</UiFormHelperText>
      </UiFormLabel>
      <SfInput
        v-model="firstName"
        name="firstName"
        autocomplete="given-name"
        v-bind="firstNameAttributes"
        :invalid="!!errors['firstName']"
      />
      <ErrorMessage as="span" name="firstName" class="flex text-negative-700 text-sm mt-2" />
    </label>

    <label class="@md:col-span-2">
      <UiFormLabel class="flex">
        <span class="mr-1">
          {{ lastNameLabel }}
        </span>
        <UiFormHelperText v-if="lastNameHelperText">({{ lastNameHelperText }})</UiFormHelperText>
      </UiFormLabel>
      <SfInput
        v-model="lastName"
        name="lastName"
        autocomplete="family-name"
        v-bind="lastNameAttributes"
        :invalid="!!errors['lastName']"
      />
      <ErrorMessage as="span" name="lastName" class="flex text-negative-700 text-sm mt-2" />
    </label>

    <div class="@md:col-span-3">
      <UiLink
        class="select-none hover:cursor-pointer"
        role="button"
        tabindex="0"
        :aria-pressed="hasCompany"
        :aria-label="!hasCompany ? t('form.addCompany') : t('form.removeCompany')"
        @click="hasCompany = !hasCompany"
        @keydown.enter.space="hasCompany = !hasCompany"
      >
        {{ !hasCompany ? t('form.addCompany') : t('form.removeCompany') }}
      </UiLink>
    </div>

    <label v-if="hasCompany" for="billingCompanyName">
      <UiFormLabel for="billingCompanyName">{{ t('form.companyLabel') }} {{ t('form.required') }}</UiFormLabel>
      <SfInput
        id="billingCompanyName"
        v-model="companyName"
        name="companyName"
        autocomplete="organization"
        v-bind="companyNameAttributes"
        :invalid="!!errors['companyName']"
        :aria-invalid="!!errors['companyName']"
      />
      <ErrorMessage as="span" name="companyName" class="flex text-negative-700 text-sm mt-2" />
    </label>

    <label v-if="hasCompany" class="@md:col-span-2" for="billingVatNumber">
      <UiFormLabel class="flex">
        <span class="mr-1">
          {{ t('form.vatIdLabel') }}
        </span>
        <UiFormHelperText>({{ t('form.optional') }})</UiFormHelperText>
      </UiFormLabel>
      <SfInput
        id="billingVatNumber"
        v-model="vatNumber"
        name="vatNumber"
        autocomplete="vat-number"
        v-bind="vatNumberAttributes"
        :invalid="invalidVAT"
        :aria-invalid="invalidVAT"
        @input="clearInvalidVAT"
      />
      <span v-if="invalidVAT" class="flex text-negative-700 text-sm mt-2">
        {{ t('storefrontError.address.vatInvalid') }}
      </span>
    </label>

    <GlasJenaAddressFields
      v-model:street-name="streetName"
      v-model:apartment="apartment"
      v-model:additional-address-information="additionalAddressInformation"
      v-model:zip-code="zipCode"
      v-model:city="city"
      v-model:state="state"
      v-model:phone-number="phoneNumber"
      :country="country"
      :countries="billingCountries"
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

    <div
      v-if="!restrictedAddresses || showAddressSaveButton"
      class="@md:col-span-3 flex flex-col @sm:flex-row @sm:justify-end @sm:items-center"
    >
      <div v-if="showAddressSaveButton" class="flex items-center">
        <UiButton
          :data-testid="`save-address-${AddressType.Billing}`"
          :disabled="formIsLoading"
          variant="secondary"
          type="submit"
        >
          {{ t('common.actions.saveAddress') }}
        </UiButton>

        <UiButton
          v-if="hasCheckoutAddress"
          :disabled="formIsLoading || disabled"
          variant="secondary"
          class="ml-2"
          :data-testid="`close-address-${AddressType.Billing}`"
          :aria-label="t('common.navigation.closeAddressForm')"
          @click="edit"
        >
          <SfIconClose />
        </UiButton>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { type Address, AddressType, ApiError, userAddressGetters } from '@plentymarkets/shop-api';
import { SfIconClose, SfInput } from '@storefront-ui/vue';
import { ErrorMessage, useForm } from 'vee-validate';
import type { AddressFormBillingProps } from '~/components/AddressFormBilling/types';
import GlasJenaAddressCountry from './GlasJenaAddressCountry.vue';
import GlasJenaAddressFields from './GlasJenaAddressFields.vue';
import { useGlasJenaAddressForm } from '../composables/useGlasJenaAddressForm';

const { disabled, address, addAddress = false } = defineProps<AddressFormBillingProps>();

const { isGuest, missingGuestCheckoutEmail, backToContactInformation } = useCustomer();
const { fetchSession } = useFetchSession();
const { shippingAsBilling } = useShippingAsBilling();
const {
  isLoading: formIsLoading,
  hasCompany,
  addressToSave,
  open: editing,
  addressToEdit,
  defaultFormValues,
  add: showNewForm,
  save: saveAddress,
  validationSchema: billingSchema,
  refreshAddressDependencies,
} = useGlasJenaAddressForm(AddressType.Billing);
const { invalidVAT, clearInvalidVAT, vatServerError } = useCreateAddress(AddressType.Billing);
const { addresses: billingAddresses } = useAddressStore(AddressType.Billing);
const { set: setCheckoutAddress, hasCheckoutAddress } = useCheckoutAddress(AddressType.Billing);
const { defineField, errors, setValues, validate, handleSubmit } = useForm({ validationSchema: billingSchema });
const { billingCountries } = useAggregatedCountries();
const { restrictedAddresses } = useRestrictedAddress();
const { setBillingSkeleton } = useCheckout();

const { labelText: firstNameLabelText, helperText: firstNameHelperText } = useFormLabel(
  t('form.firstNameLabel'),
  hasCompany,
);
const { labelText: lastNameLabel, helperText: lastNameHelperText } = useFormLabel(t('form.lastNameLabel'), hasCompany);

const [firstName, firstNameAttributes] = defineField('firstName');
const [lastName, lastNameAttributes] = defineField('lastName');
const [country, countryAttributes] = defineField('country');
const [streetName, streetNameAttributes] = defineField('streetName');
const [apartment, apartmentAttributes] = defineField('apartment');
const [city, cityAttributes] = defineField('city');
const [zipCode, zipCodeAttributes] = defineField('zipCode');
const [companyName, companyNameAttributes] = defineField('companyName');
const [vatNumber, vatNumberAttributes] = defineField('vatNumber');
const [state, stateAttributes] = defineField('state');
const [additionalAddressInformation, additionalAddressInformationAttributes] =
  defineField('additionalAddressInformation');
const [phoneNumber, phoneNumberAttributes] = defineField('phoneNumber');

const showAddressSaveButton = computed(() => editing.value || showNewForm.value);
const guestHasShippingAsBilling = computed(() => isGuest.value && shippingAsBilling.value);

if (!addAddress && address) {
  hasCompany.value = addressToSave.value?.companyName ? true : !!userAddressGetters.getCompanyName(address as Address);

  const addressSource = invalidVAT.value || vatServerError.value ? addressToSave.value : address;

  setValues({
    ...address,
    firstName: addressSource?.firstName || '',
    lastName: addressSource?.lastName || '',
    country: addressSource?.country || '',
    streetName: addressSource?.streetName || '',
    apartment: addressSource?.apartment || '',
    city: addressSource?.city || '',
    zipCode: addressSource?.zipCode || '',
    state: addressSource?.state || '',
    additionalAddressInformation: addressSource?.additionalAddressInformation || '',
    phoneNumber: addressSource?.phoneNumber || '',
    companyName: addressSource.companyName || '',
    vatNumber: addressSource.vatNumber || '',
  } as unknown as Record<string, string>);

  if (!hasCompany.value) {
    companyName.value = '';
    vatNumber.value = '';
  }
}

const setDefaultFormValues = () => {
  defaultFormValues.value = {
    firstName: firstName.value,
    lastName: lastName.value,
    country: country.value,
    streetName: streetName.value,
    apartment: apartment.value,
    city: city.value,
    zipCode: zipCode.value,
    state: state.value,
    additionalAddressInformation: additionalAddressInformation.value,
    phoneNumber: phoneNumber.value,
    companyName: companyName.value,
    vatNumber: vatNumber.value,
  };
};

const syncCheckoutAddress = async () => {
  await setCheckoutAddress(
    addAddress || isGuest.value
      ? (billingAddresses.value[0] as Address)
      : (userAddressGetters.getDefault(billingAddresses.value) as Address),
    !addAddress,
  );

  if (guestHasShippingAsBilling.value) shippingAsBilling.value = false;
};

const validateAndSubmitForm = async () => {
  const formData = await validate();

  if (formIsLoading.value) return;
  if (missingGuestCheckoutEmail.value) return backToContactInformation();

  if (formData.valid) {
    if (hasCompany.value) setDefaultFormValues();

    try {
      setBillingSkeleton(true);
      await submitForm();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === getErrorCode('1400')) {
          await fetchSession();
          await submitForm();
        }
      } else if (error instanceof ApiError) {
        useHandleError(error);
      }
    } finally {
      setBillingSkeleton(false);
      formIsLoading.value = false;
    }
    if (showNewForm.value && !invalidVAT.value && !vatServerError.value) showNewForm.value = false;
  }
};

const submitForm = handleSubmit((billingAddressForm) => {
  addressToSave.value = billingAddressForm as Address;

  if (guestHasShippingAsBilling.value && !addAddress) delete addressToSave.value?.id;
  if (addAddress) addressToSave.value.primary = true;
  if (!hasCompany.value) {
    addressToSave.value.companyName = '';
    addressToSave.value.vatNumber = '';
  }

  return saveAddress()
    .then(() => syncCheckoutAddress())
    .then(() => refreshAddressDependencies());
});

const edit = (address: Address) => {
  if (disabled) return;
  addressToEdit.value = editing.value || showNewForm.value ? ({} as Address) : address;
  editing.value = !(editing.value || showNewForm.value);
  showNewForm.value = false;
};
</script>
