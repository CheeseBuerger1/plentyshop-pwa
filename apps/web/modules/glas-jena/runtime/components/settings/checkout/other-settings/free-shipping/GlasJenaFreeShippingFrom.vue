<!--
  Editor setting "Free shipping from" (Checkout » Other settings » Free Shipping; found by the settings loader of the
  shop, utils/settings-groups-imports): the item value from which orders within Germany are shipped free. Used by the
  note "Gratis Versand – noch X €" in the cart and the shipping for search engines (see useGlasJenaFreeShippingFrom).
  Empty: 150 €; 0: no free shipping. It does not change what PlentyONE charges, that is set in the shipping profiles.
-->
<template>
  <div class="py-2 mb-2" data-testid="gj-free-shipping-setting">
    <p class="mb-4">{{ getEditorTranslation('description') }}</p>
    <UiFormLabel for="gj-free-shipping-from">{{ getEditorTranslation('label') }}</UiFormLabel>
    <SfInput
      id="gj-free-shipping-from"
      v-model="freeShippingFrom"
      type="number"
      min="0"
      step="0.01"
      :placeholder="String(FREE_SHIPPING_DE_DEFAULT)"
      data-testid="gj-free-shipping-from"
    />
    <p class="mt-2 typography-text-xs text-neutral-700">{{ getEditorTranslation('hint') }}</p>
  </div>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import { FREE_SHIPPING_DE_DEFAULT, FREE_SHIPPING_FROM_SETTING } from '../../../../../utils/merchantPolicies';

const { updateSetting, getSetting } = useSiteSettings(FREE_SHIPPING_FROM_SETTING);

const freeShippingFrom = computed({
  get: () => getSetting(),
  set: (value) => updateSetting(String(value ?? '')),
});
</script>

<i18n lang="json">
{
  "en": {
    "description": "Item value (gross, in €) from which orders within Germany are shipped free. The cart shows how much is still missing (\"Gratis Versand – noch X €\"), and search engines get it with the shipping costs.",
    "label": "Free shipping within Germany from (€)",
    "hint": "Empty: 150 €. 0: no free shipping. Set the same value in the shipping profiles of PlentyONE and on the page \"Versand\": this setting does not change what the order costs."
  },
  "de": {
    "description": "Item value (gross, in €) from which orders within Germany are shipped free. The cart shows how much is still missing (\"Gratis Versand – noch X €\"), and search engines get it with the shipping costs.",
    "label": "Free shipping within Germany from (€)",
    "hint": "Empty: 150 €. 0: no free shipping. Set the same value in the shipping profiles of PlentyONE and on the page \"Versand\": this setting does not change what the order costs."
  }
}
</i18n>
