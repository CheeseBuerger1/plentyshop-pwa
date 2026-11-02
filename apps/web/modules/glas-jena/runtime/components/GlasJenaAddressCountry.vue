<!--
  Country of an address form, as the first field (wish of the shop owner, 2026-10-31: country first, the form follows
  it, see GlasJenaAddressFields.vue and docs/adressformate.md). The field of the original forms, moved to the top.
-->
<template>
  <label class="@md:col-span-3" data-testid="gj-address-country">
    <UiFormLabel>{{ t('form.countryLabel') }} {{ t('form.required') }}</UiFormLabel>
    <SfSelect
      v-model="country"
      name="country"
      v-bind="fieldAttributes"
      :placeholder="t('form.selectPlaceholder')"
      :invalid="!!error"
      :required="nativeRequired"
      aria-required="true"
      wrapper-class-name="bg-white"
      class="!ring-1 !ring-neutral-200"
      autocomplete="country-name"
    >
      <option v-for="entry in countries" :key="`country-${entry.id}`" :value="entry.id.toString()">
        {{ entry.currLangName }}
      </option>
    </SfSelect>
    <span v-if="error" class="flex text-negative-700 text-sm mt-2">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
import { SfSelect } from '@storefront-ui/vue';
import type { GlasJenaAddressCountryProps } from './types';

const { countries, error, fieldAttributes, nativeRequired = false } = defineProps<GlasJenaAddressCountryProps>();
const country = defineModel<string | undefined>({ required: true });
</script>
