<!--
  Country of delivery and shipping method in the cart (GlasJenaCart.vue), like the LTS shop: a selection of the
  country in the order summary below the totals (in the column that stays in view, so it is never far away with many
  articles); the totals above then show the shipping costs of that country. The shipping methods only as a choice if
  there is more than one (Germany: DHL only; abroad also "Warenpost International"), otherwise the summary already
  says enough; they are fetched again when the articles change (a lighter cart may allow "Warenpost"). As tiles like
  the payment methods of the checkout, one below the other in the narrow column (GlasJenaShippingMethodTile.vue).
  With an address in the cart the country is fixed, like in the LTS shop: PlentyONE calculates with the country of the
  address, so the choice is disabled with a note to change the address in the checkout (isShippingCountryLocked).
  Logic in useGlasJenaCartShipping, see utils/cartShipping.ts.
-->
<template>
  <section class="gj-form" data-testid="gj-cart-shipping" :aria-busy="loading">
    <label for="gj-cart-shipping-country" data-testid="form-label">{{ tLocal('country') }}</label>
    <SfSelect
      id="gj-cart-shipping-country"
      :model-value="countryId === null ? '' : String(countryId)"
      :disabled="loading || countryLocked"
      :aria-describedby="countryLocked ? 'gj-cart-shipping-country-locked' : undefined"
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
    <p
      v-if="countryLocked"
      id="gj-cart-shipping-country-locked"
      class="mt-2 text-sm text-neutral-600"
      data-testid="gj-cart-shipping-country-locked"
    >
      {{ tLocal('countryLocked') }}
    </p>

    <fieldset v-if="shippingMethods.length > 1" class="mt-6" data-testid="gj-cart-shipping-methods">
      <legend data-testid="form-label">{{ t('shipping.method.heading') }}</legend>
      <div class="grid gap-3">
        <GlasJenaShippingMethodTile
          v-for="method in shippingMethods"
          :key="shippingProviderGetters.getParcelServicePresetId(method)"
          :method="method"
          group="gj-cart-shipping-method"
          :checked="shippingProviderGetters.getParcelServicePresetId(method) === shippingMethodId"
          :disabled="loading"
          :amount="getShippingAmount(shippingProviderGetters.getShippingAmount(method))"
          @select="onShippingMethodChange"
        />
      </div>
    </fieldset>
  </section>
</template>

<script setup lang="ts">
import { shippingProviderGetters } from '@plentymarkets/shop-api';
import { SfSelect } from '@storefront-ui/vue';
import { useGlasJenaCartShipping } from '../composables/useGlasJenaCartShipping';
import GlasJenaShippingMethodTile from './GlasJenaShippingMethodTile.vue';

const { t: tLocal } = useI18n({ useScope: 'local' });
const { send } = useNotification();
const { format } = usePriceFormatter();
const {
  countries,
  countryId,
  countryLocked,
  shippingMethods,
  shippingMethodId,
  loading,
  load,
  watchCartContent,
  changeCountry,
  changeShippingMethod,
} = useGlasJenaCartShipping();

/* Before the `await`, so the watcher belongs to this component and stops with it */
watchCartContent();
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
    "countryLocked": "Please change your address in the checkout in order to change the country of delivery.",
    "countryNotChanged": "The country of delivery could not be changed. Please try again."
  },
  "de": {
    "country": "Lieferland",
    "countryLocked": "Bitte ändern Sie Ihre Adresse in der Kasse, um das Lieferland zu wechseln.",
    "countryNotChanged": "Das Lieferland konnte nicht geändert werden. Bitte versuchen Sie es noch einmal."
  }
}
</i18n>
