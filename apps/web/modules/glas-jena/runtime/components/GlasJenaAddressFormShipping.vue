<!--
  Shipping address form of the checkout (replaces components/AddressFormShipping/AddressFormShipping.vue, see
  COMPONENT_OVERRIDES): the address part per country of delivery (wish of the shop owner, 2026-10-31; concept in
  docs/adressformate.md). Copy of the original with these changes, see copies/addressFormCopy.ts: the country is the
  first field (GlasJenaAddressCountry), the fields from the street on come from GlasJenaAddressFields (street and
  house number apart in group A only, state, address line 2, optional phone number), the schema from
  useGlasJenaAddressForm. Everything else is the original; upstreamContractAddress.spec.ts shows when it changes.
-->
<template>
  <form
    novalidate
    class="grid grid-cols-1 @md:grid-cols-[50%_1fr_120px] gap-4"
    data-testid="shipping-address-form"
    @submit.prevent="validateAndSubmitForm"
  >
    <GlasJenaAddressCountry
      v-model="country"
      :countries="shippingCountries"
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
        :aria-required="!hasShippingCompany"
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
        :aria-required="!hasShippingCompany"
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
        :aria-pressed="hasShippingCompany"
        :aria-label="!hasShippingCompany ? t('form.addCompany') : t('form.removeCompany')"
        @click="hasShippingCompany = !hasShippingCompany"
        @keydown.enter.space="hasShippingCompany = !hasShippingCompany"
      >
        {{ !hasShippingCompany ? t('form.addCompany') : t('form.removeCompany') }}
      </UiLink>
    </div>

    <label v-if="hasShippingCompany" for="shippingCompanyName">
      <UiFormLabel for="shippingCompanyName">{{ t('form.companyLabel') }} {{ t('form.required') }}</UiFormLabel>
      <SfInput
        id="shippingCompanyName"
        v-model="companyName"
        aria-required="true"
        name="companyName"
        autocomplete="organization"
        v-bind="companyNameAttributes"
        :invalid="!!errors['companyName']"
        :aria-invalid="!!errors['companyName']"
      />
      <ErrorMessage as="span" name="companyName" class="flex text-negative-700 text-sm mt-2" />
    </label>

    <label v-if="hasShippingCompany" class="@md:col-span-2" for="shippingVatNumber">
      <UiFormLabel class="flex">
        <span class="mr-1">
          {{ t('form.vatIdLabel') }}
        </span>
        <UiFormHelperText>({{ t('form.optional') }})</UiFormHelperText>
      </UiFormLabel>
      <SfInput
        id="shippingVatNumber"
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
      :countries="shippingCountries"
      :errors="errors"
      :set-field-value="setFieldValue"
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
      class="@md:col-span-3 flex flex-col @sm:flex-row @sm:justify-between @sm:items-center"
    >
      <label v-if="!restrictedAddresses" class="flex items-center gap-2">
        <SfCheckbox v-model="shippingAsBilling" data-testid="use-shipping-as-billing" />
        <span class="cursor-pointer select-none">{{ t('form.useAsBillingLabel') }}</span>
      </label>

      <div v-if="showAddressSaveButton" :class="{ 'mt-3 @sm:mt-0': !restrictedAddresses }" class="flex items-center">
        <UiButton
          :data-testid="`save-address-${AddressType.Shipping}`"
          :disabled="formIsLoading"
          variant="secondary"
          type="submit"
        >
          {{ t('common.actions.saveAddress') }}
        </UiButton>

        <UiButton
          v-if="hasShippingAddress"
          :disabled="formIsLoading || disabled"
          variant="secondary"
          class="ml-2"
          :data-testid="`close-address-${AddressType.Shipping}`"
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
import { SfCheckbox, SfIconClose, SfInput } from '@storefront-ui/vue';
import { ErrorMessage, useForm } from 'vee-validate';
import type { AddressFormShippingProps } from '~/components/AddressFormShipping/types';
import GlasJenaAddressCountry from './GlasJenaAddressCountry.vue';
import GlasJenaAddressFields from './GlasJenaAddressFields.vue';
import { useGlasJenaAddressForm } from '../composables/useGlasJenaAddressForm';

const { disabled, address, addAddress = false } = defineProps<AddressFormShippingProps>();

const { isGuest, missingGuestCheckoutEmail, backToContactInformation } = useCustomer();
const { fetchSession } = useFetchSession();
const { default: shippingCountries } = useAggregatedCountries();
const { shippingAsBilling } = useShippingAsBilling();
const { handleCartTotalChanges } = useCartTotalChange();
const { addresses: shippingAddresses } = useAddressStore(AddressType.Shipping);
const { addresses: billingAddresses } = useAddressStore(AddressType.Billing);
const { set: setShippingAddress, hasCheckoutAddress: hasShippingAddress } = useCheckoutAddress(AddressType.Shipping);
const { set: setBillingAddress } = useCheckoutAddress(AddressType.Billing);
const { hasCheckoutAddress: hasBillingAddress } = useCheckoutAddress(AddressType.Billing);
const { addressToSave: billingAddressToSave, save: saveBillingAddress } = useAddressForm(AddressType.Billing);
const { restrictedAddresses } = useRestrictedAddress();
const { setShippingSkeleton, showBillingAddressSection } = useCheckout();
const {
  isLoading: formIsLoading,
  add: showNewForm,
  open: editing,
  addressToEdit,
  defaultFormValues,
  hasCompany: hasShippingCompany,
  addressToSave: shippingAddressToSave,
  save: saveShippingAddress,
  validationSchema: shippingSchema,
  refreshAddressDependencies,
} = useGlasJenaAddressForm(AddressType.Shipping);
const { invalidVAT, clearInvalidVAT, vatServerError } = useCreateAddress(AddressType.Shipping);
const { defineField, errors, setValues, setFieldValue, validate, handleSubmit } = useForm({
  validationSchema: shippingSchema,
});

const { labelText: firstNameLabelText, helperText: firstNameHelperText } = useFormLabel(
  t('form.firstNameLabel'),
  hasShippingCompany,
);
const { labelText: lastNameLabel, helperText: lastNameHelperText } = useFormLabel(
  t('form.lastNameLabel'),
  hasShippingCompany,
);

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

if (!addAddress && address) {
  hasShippingCompany.value = shippingAddressToSave.value?.companyName
    ? true
    : !!userAddressGetters.getCompanyName(address as Address);

  const addressSource = invalidVAT.value || vatServerError.value ? shippingAddressToSave.value : address;

  setValues(
    {
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
    } as unknown as Record<string, string>,
    false,
  );

  if (!hasShippingCompany.value) {
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

const handleSaveShippingAsBilling = async (shippingAddressForm: Address) => {
  if (!restrictedAddresses.value && shippingAsBilling.value) {
    billingAddressToSave.value = isGuest.value
      ? (shippingAddresses.value[0] as Address)
      : (shippingAddressForm as Address);

    if (addAddress) billingAddressToSave.value.primary = true;
    if (!hasShippingCompany.value) {
      billingAddressToSave.value.companyName = '';
      billingAddressToSave.value.vatNumber = '';
    }

    await saveBillingAddress();
  }
};

const handleShippingPrimaryAddress = async () => {
  if (shippingAddresses.value.length > 0) {
    await setShippingAddress(
      addAddress || isGuest.value
        ? (shippingAddresses.value[0] as Address)
        : (userAddressGetters.getDefault(shippingAddresses.value) as Address),
      !addAddress,
    );

    usePrimaryAddress(AddressType.Shipping).primaryAddressId.value =
      shippingAddresses.value?.find((item) => item.primary === true)?.id || -1;
  }
};

const handleBillingPrimaryAddress = async () => {
  if (!restrictedAddresses.value && shippingAsBilling.value && billingAddresses.value.length > 0) {
    await setBillingAddress(
      addAddress || isGuest.value
        ? (billingAddresses.value[0] as Address)
        : (userAddressGetters.getDefault(billingAddresses.value) as Address),
      false,
    );

    usePrimaryAddress(AddressType.Billing).primaryAddressId.value =
      billingAddresses.value?.find((item) => item.primary === true)?.id || -1;
  }
};

const validateAndSubmitForm = async () => {
  const formData = await validate();

  if (formIsLoading.value) return;
  if (missingGuestCheckoutEmail.value) return backToContactInformation();

  if (formData.valid) {
    if (hasShippingCompany.value) setDefaultFormValues();

    try {
      setShippingSkeleton(true);
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
      setShippingSkeleton(false);
      formIsLoading.value = false;
    }

    if (showNewForm.value && !invalidVAT.value && !vatServerError.value) showNewForm.value = false;
  }
};

const submitForm = handleSubmit((shippingAddressForm) => {
  shippingAddressToSave.value = shippingAddressForm as Address;

  if (addAddress) shippingAddressToSave.value.primary = true;
  if (!hasShippingCompany.value) {
    shippingAddressToSave.value.companyName = '';
    shippingAddressToSave.value.vatNumber = '';
  }
  return saveShippingAddress()
    .then(() => handleSaveShippingAsBilling(shippingAddressForm as Address))
    .then(() => handleShippingPrimaryAddress())
    .then(() => handleBillingPrimaryAddress())
    .then(() => refreshAddressDependencies())
    .then(() => handleCartTotalChanges());
});

const edit = (address: Address) => {
  if (disabled) return;
  addressToEdit.value = editing.value || showNewForm.value ? ({} as Address) : address;
  editing.value = !(editing.value || showNewForm.value);
  showNewForm.value = false;
};

watch(shippingAsBilling, () => {
  showBillingAddressSection.value = !shippingAsBilling.value || hasBillingAddress.value;
});
</script>
