<!--
  Consent to pass the e-mail address on to the parcel service (replaces ShippingPrivacy, see COMPONENT_OVERRIDES).
  Copy of the original with a short label like the LTS shop (wish of the shop owner, 2026-10-20): "Aktuellen
  Paketstatus per E-Mail vom Dienstleister erhalten." The full consent text of the original (with the note that it
  can be revoked) stays one click away: the LTS shop shows it as a tooltip of an info button, here the button opens
  it below the label – a tooltip is out of reach by keyboard and on touch screens. The consent stays voluntary as in
  the original (no check prevents the order without it); without it the address is not passed on.
-->
<template>
  <div class="mt-6 @md:col-span-3" :class="[!showErrors ? 'mb-6' : 'mb-2']" data-testid="gj-shipping-privacy">
    <div class="flex items-start gap-2">
      <SfCheckbox
        id="shipping-agreement-checkbox"
        :value="shippingPrivacyAgreement"
        :selected="shippingPrivacyAgreement"
        :invalid="showErrors"
        class="mt-1"
        name="Shipping Privacy"
        aria-describedby="gj-shipping-privacy-details"
        @update:model-value="(event) => setShippingPrivacyAgreement(Boolean(event))"
      />
      <label for="shipping-agreement-checkbox" class="cursor-pointer select-none">{{ tLocal('label') }}</label>
      <button
        type="button"
        class="gj-shipping-privacy__info"
        :aria-expanded="detailsOpen"
        aria-controls="gj-shipping-privacy-details"
        :aria-label="tLocal('details')"
        data-testid="gj-shipping-privacy-info"
        @click="detailsOpen = !detailsOpen"
      >
        <SfIconInfo size="sm" />
      </button>
    </div>
    <p
      v-show="detailsOpen"
      id="gj-shipping-privacy-details"
      class="gj-shipping-privacy__details"
      data-testid="gj-shipping-privacy-details"
    >
      {{ t('shipping.method.showDataPrivacyAgreementHint', { parcelServiceInformation }) }}
    </p>
  </div>
  <div v-if="showErrors" class="text-negative-700 text-sm mb-4">{{ t('legal.privacyPolicyRequired') }}</div>
</template>

<script lang="ts" setup>
import { shippingProviderGetters } from '@plentymarkets/shop-api';
import { SfCheckbox, SfIconInfo } from '@storefront-ui/vue';

const { t: tLocal } = useI18n({ useScope: 'local' });
const { shippingPrivacyAgreement, showErrors, setShippingPrivacyAgreement } = useAdditionalInformation();
const { selectedMethod } = useCartShippingMethods();
const parcelServiceInformation = computed(() =>
  selectedMethod.value ? shippingProviderGetters.getShippingMethodName(selectedMethod.value) : '',
);
const detailsOpen = ref(false);
</script>

<i18n lang="json">
{
  "en": {
    "label": "Receive current status by email from the parcel service provider.",
    "details": "Details of the consent"
  },
  "de": {
    "label": "Aktuellen Paketstatus per E-Mail vom Dienstleister erhalten.",
    "details": "Einzelheiten zur Einwilligung"
  }
}
</i18n>
