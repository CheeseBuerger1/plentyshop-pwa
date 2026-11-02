<!--
  Address of an order (replaces components/OrderAddressData/OrderAddressData.vue, see COMPONENT_OVERRIDES): copy of the
  original that also passes address line 2 (`address3`) and the state to the display (GlasJenaAddressDisplay.vue), so
  the order confirmation and details show the address like its form. Made by __tests__/addressFormCopy.ts;
  upstreamContractAddress.spec.ts shows when the original changes.
-->
<template>
  <AddressDisplay :address="transformAddress(address)" />
</template>

<script setup lang="ts">
import type { OrderAddressDataPropsType } from '~/components/OrderAddressData/types';
import type { Address, AddressData } from '@plentymarkets/shop-api';

const props = defineProps<OrderAddressDataPropsType>();

const transformAddress = (address: AddressData): Address => {
  return {
    companyName: address.name1 || undefined,
    firstName: address.name2 || '',
    lastName: address.name3 || '',
    zipCode: address.postalCode,
    city: address.town,
    country: props.address.countryId.toString(),
    streetName: address.address1,
    apartment: address.address2,
    additionalAddressInformation: address.address3,
    state: address.stateId?.toString(),
    phoneNumber: '',
    primary: false,
  };
};
</script>
