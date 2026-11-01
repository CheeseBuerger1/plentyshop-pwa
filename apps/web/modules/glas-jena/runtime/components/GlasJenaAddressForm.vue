<!--
  Address form of "Mein Konto" (replaces components/AddressForm/AddressForm.vue, see COMPONENT_OVERRIDES): the address
  part per country like the checkout (wish of the shop owner, 2026-10-31; concept in docs/adressformate.md). Copy of
  the original with the changes of __tests__/addressFormCopy.ts: country first, the address part from
  GlasJenaAddressFields, address line 2. Everything else is the original; upstreamContractAddress.spec.ts shows when it
  changes.
-->
<template>
  <form
    class="grid grid-cols-1 @md:grid-cols-[50%_1fr_120px] gap-4"
    data-testid="address-form"
    @submit.prevent="$emit('on-save', defaultValues, useAsShippingAddress)"
  >
    <GlasJenaAddressCountry v-model="defaultValues.country" :countries="countries" native-required />

    <label>
      <UiFormLabel>{{ t('form.firstNameLabel') }} {{ t('form.required') }}</UiFormLabel>
      <SfInput v-model="defaultValues.firstName" name="firstName" autocomplete="given-name" required />
    </label>
    <label class="@md:col-span-2">
      <UiFormLabel>{{ t('form.lastNameLabel') }} {{ t('form.required') }}</UiFormLabel>
      <SfInput v-model="defaultValues.lastName" name="lastName" autocomplete="family-name" required />
    </label>
    <GlasJenaAddressFields
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

    <label v-if="type === AddressType.Billing" class="@md:col-span-3 flex items-center gap-2">
      <SfCheckbox v-model="useAsShippingAddress" name="useAsShipping" />
      {{ t('form.useAsShippingLabel') }}
    </label>

    <div class="@md:col-span-3 flex flex-col-reverse @md:flex-row justify-end mt-6 gap-4">
      <UiButton
        type="button"
        class="@max-md:w-1/2"
        variant="secondary"
        :disabled="isCartUpdateLoading"
        @click="clearInputs"
      >
        {{ t('common.actions.clearAll') }}
      </UiButton>
      <UiButton data-testid="save-address" type="submit" class="min-w-[120px]" :disabled="isCartUpdateLoading">
        <SfLoaderCircular v-if="isCartUpdateLoading" class="flex justify-center items-center" size="sm" />
        <span v-else>
          {{ t('common.actions.save') }}
        </span>
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { type Address, AddressType, userAddressGetters } from '@plentymarkets/shop-api';
import { SfCheckbox, SfInput, SfLoaderCircular } from '@storefront-ui/vue';
import type { AddressFormProps } from '~/components/AddressForm/types';
import GlasJenaAddressCountry from './GlasJenaAddressCountry.vue';
import GlasJenaAddressFields from './GlasJenaAddressFields.vue';

const { type, savedAddress: propertySavedAddress, useAsShippingDefault = true } = defineProps<AddressFormProps>();
const { loading: loadBilling } = useAddress(AddressType.Billing);
const { loading: loadShipping } = useAddress(AddressType.Shipping);
const { billingCountries, default: defaultCountries } = useAggregatedCountries();

const countries = computed(() => (type === AddressType.Billing ? billingCountries.value : defaultCountries.value));
const isCartUpdateLoading = computed(() => loadBilling.value || loadShipping.value);
const useAsShippingAddress = ref(useAsShippingDefault);
const savedAddress = propertySavedAddress || ({} as Address);

const defaultValues = ref({
  firstName: userAddressGetters.getFirstName(savedAddress),
  lastName: userAddressGetters.getLastName(savedAddress),
  phoneNumber: userAddressGetters.getPhone(savedAddress),
  country: savedAddress?.country ?? '',
  streetName: userAddressGetters.getStreetName(savedAddress),
  apartment: userAddressGetters.getStreetNumber(savedAddress),
  additionalAddressInformation: savedAddress.additionalAddressInformation ?? '',
  city: userAddressGetters.getCity(savedAddress),
  state: userAddressGetters.getProvince(savedAddress),
  zipCode: userAddressGetters.getPostCode(savedAddress),
  primary: !userAddressGetters.getId(savedAddress),
});

const clearInputs = () => {
  defaultValues.value = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    streetName: '',
    apartment: '',
    additionalAddressInformation: '',
    city: '',
    state: '',
    zipCode: '',
    primary: !userAddressGetters.getId(savedAddress),
  };
};

defineEmits(['on-save', 'on-close']);
</script>
