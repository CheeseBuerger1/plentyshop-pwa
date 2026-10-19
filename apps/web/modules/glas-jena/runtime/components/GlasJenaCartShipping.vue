<!--
  Country of delivery and shipping method in the cart (GlasJenaCart.vue), like the LTS shop: a selection of the
  country in the order summary below the totals (in the column that stays in view, so it is never far away with many
  articles); the totals above then show the shipping costs of that country. The shipping methods only as a choice if
  there is more than one (Germany: DHL only; abroad also "Warenpost International"), otherwise the summary already
  says enough. Logic in useGlasJenaCartShipping, see utils/cartShipping.ts.
-->
<template>
  <section class="gj-form" data-testid="gj-cart-shipping" :aria-busy="loading">
    <label for="gj-cart-shipping-country" data-testid="form-label">{{ tLocal('country') }}</label>
    <SfSelect
      id="gj-cart-shipping-country"
      :model-value="countryId === null ? '' : String(countryId)"
      :disabled="loading"
      data-testid="gj-cart-shipping-country"
      @update:model-value="onCountryChange"
    >
      <!-- `selected` as well: the server-rendered page cannot set the value of a select -->
      <option
        v-for="country in countries"
        :key="country.id"
        :value="String(country.id)"
        :selected="country.id === countryId"
      >
        {{ country.currLangName }}
      </option>
    </SfSelect>

    <fieldset v-if="shippingMethods.length > 1" class="mt-6" data-testid="gj-cart-shipping-methods">
      <legend data-testid="form-label">{{ t('shipping.method.heading') }}</legend>
      <label
        v-for="method in shippingMethods"
        :key="shippingProviderGetters.getParcelServicePresetId(method)"
        class="gj-cart-shipping-method flex items-center gap-3 py-2 cursor-pointer"
      >
        <SfRadio
          name="gj-cart-shipping-method"
          :value="shippingProviderGetters.getParcelServicePresetId(method)"
          :model-value="shippingMethodId"
          :disabled="loading"
          @update:model-value="onShippingMethodChange"
        />
        <span>{{ shippingProviderGetters.getShippingMethodName(method) }}</span>
        <span class="ml-auto">{{ getShippingAmount(shippingProviderGetters.getShippingAmount(method)) }}</span>
      </label>
    </fieldset>
  </section>
</template>

<script setup lang="ts">
import { shippingProviderGetters } from '@plentymarkets/shop-api';
import { SfRadio, SfSelect } from '@storefront-ui/vue';
import { useGlasJenaCartShipping } from '../composables/useGlasJenaCartShipping';

const { t: tLocal } = useI18n({ useScope: 'local' });
const { send } = useNotification();
const { format } = usePriceFormatter();
const { countries, countryId, shippingMethods, shippingMethodId, loading, load, changeCountry, changeShippingMethod } =
  useGlasJenaCartShipping();

await load();

const onCountryChange = async (value: string) => {
  const changed = await changeCountry(Number(value));
  if (!changed) {
    send({ message: tLocal('countryNotChanged'), type: 'negative' });
  }
};

const onShippingMethodChange = async (value: string) => {
  await changeShippingMethod(value);
};

/* Like the shipping methods of the checkout (ShippingMethod.vue) */
const getShippingAmount = (amount: string) => (amount === '0' ? t('shipping.method.free') : format(Number(amount)));
</script>

<i18n lang="json">
{
  "en": {
    "country": "Country of delivery",
    "countryNotChanged": "The country of delivery could not be changed. Please try again."
  },
  "de": {
    "country": "Lieferland",
    "countryNotChanged": "Das Lieferland konnte nicht geändert werden. Bitte versuchen Sie es noch einmal."
  }
}
</i18n>
