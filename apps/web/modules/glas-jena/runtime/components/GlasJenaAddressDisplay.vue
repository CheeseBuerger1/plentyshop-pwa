<!--
  An address as shown in the checkout, the account and the order confirmation (replaces
  components/AddressDisplay/AddressDisplay.vue, see COMPONENT_OVERRIDES): the address part exactly as the country's
  form asks for it (wish of the shop owner, 2026-11-03), see getAddressLines in utils/addressFormats.ts – street and
  number in the country's order, address line 2, postal code, town and state as in the form's rows. The original showed
  every address in the German way, without line 2 and state, and without the country on pages that do not load the
  countries (order confirmation); the display loads them itself. Company and name above, country, then phone below;
  the DHL post number of the original stays.
-->
<template>
  <div class="address-display" data-testid="gj-address-display">
    <p v-if="userAddressGetters.getCompanyName(address)">
      {{ userAddressGetters.getCompanyName(address) }}
    </p>
    <p v-if="userAddressGetters.getFirstName(address) || userAddressGetters.getLastName(address)">
      {{ `${userAddressGetters.getFirstName(address)} ${userAddressGetters.getLastName(address)}` }}
    </p>
    <p v-for="(line, index) in lines" :key="index">{{ line }}</p>
    <p v-if="userAddressGetters.getPostNumber(address)">
      {{ t('PreferredDelivery.packstation.postNumberPlaceholder') }}: {{ userAddressGetters.getPostNumber(address) }}
    </p>
    <p>{{ countryName }}</p>
    <p v-if="userAddressGetters.getPhone(address)">{{ userAddressGetters.getPhone(address) }}</p>
  </div>
</template>

<script lang="ts" setup>
import { userAddressGetters } from '@plentymarkets/shop-api';
import type { AddressProps } from '~/components/AddressDisplay/types';
import { getAddressFormat, getAddressLines, getStateOptions, isLegacyAddress } from '../utils/addressFormats';

const { address } = defineProps<AddressProps>();

const { billingCountries, localeCountryName, fetchAggregatedCountries } = useAggregatedCountries();

/* The order confirmation and details do not load the countries; without them neither the country's form nor its name */
onNuxtReady(async () => {
  if (!billingCountries.value.length) {
    await fetchAggregatedCountries();
  }
});

const country = computed(() => billingCountries.value.find((entry) => entry.id === Number(address?.country)));
const countryName = computed(() => (address?.country ? localeCountryName(address.country) : ''));

const lines = computed(() => {
  const format = getAddressFormat(country.value);
  const apartment = userAddressGetters.getStreetNumber(address);
  const state = getStateOptions(country.value?.states, format.stateCodes).find(
    (option) => option.value === String(address?.state ?? ''),
  );
  return getAddressLines(
    format,
    {
      streetName: userAddressGetters.getStreetName(address),
      apartment,
      additionalAddressInformation: address?.additionalAddressInformation,
      zipCode: userAddressGetters.getPostCode(address),
      city: userAddressGetters.getCity(address),
      state: state?.label,
    },
    isLegacyAddress(format, apartment),
  );
});
</script>
