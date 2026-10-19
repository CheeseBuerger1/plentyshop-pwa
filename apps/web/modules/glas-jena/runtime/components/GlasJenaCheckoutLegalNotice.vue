<!--
  Legal notes right above the buy button of the checkout (wish of the shop owner, 2026-10-20), in this order:
  "Ihre gesetzlichen Gewährleistungsrechte" (the original's GuaranteeNotice: link to the window with the EU notice,
  when the shop shows it as a window) and "Es gelten unsere AGB. Bitte nehmen Sie unser Widerrufsrecht und unsere
  Datenschutzerklärung zur Kenntnis." – as a note, without the original's checkbox (see GlasJenaCheckoutGeneralTerms.vue).
  The links open in a new tab like in the original, so the checkout keeps its entries.
-->
<template>
  <div class="gj-checkout-legal" data-testid="gj-checkout-legal">
    <OriginalGuaranteeNotice v-if="withGuaranteeNotice && showGuaranteeNotice" />
    <i18n-t keypath="terms" tag="p" class="gj-checkout-legal__terms" data-testid="gj-checkout-terms">
      <template #terms>
        <UiLink :href="localePath(paths.termsAndConditions)" target="_blank">{{
          t('legal.termsAndConditions')
        }}</UiLink>
      </template>
      <template #cancellationRights>
        <UiLink :href="localePath(paths.cancellationRights)" target="_blank">{{
          t('legal.cancellationRights')
        }}</UiLink>
      </template>
      <template #privacyPolicy>
        <UiLink :href="localePath(paths.privacyPolicy)" target="_blank">{{ t('legal.privacyPolicy') }}</UiLink>
      </template>
    </i18n-t>
  </div>
</template>

<script setup lang="ts">
import OriginalGuaranteeNotice from '~/components/GuaranteeNotice/GuaranteeNotice.vue';
import type { GlasJenaCheckoutLegalNoticeProps } from './types';

const { withGuaranteeNotice = false } = defineProps<GlasJenaCheckoutLegalNoticeProps>();

/* Own text of the terms note (below); the link texts come from the shop's global `t` */
useI18n({ useScope: 'local' });
const localePath = useLocalizedPath();

/* The same conditions as the checkout page for the window mode of the guarantee notice (pages/checkout.vue) */
const isGuaranteeNoticeEnabled = useFeatureFlag('shopPwaEnableEu2025-1960', false);
const { getBooleanSetting: getShowGuaranteeNotice } = useSiteSettings('showGuaranteeNotice');
const { getSetting: getGuaranteeNoticeDisplayMode } = useSiteSettings(GUARANTEE_NOTICE_DISPLAY_MODE_SETTING);
const showGuaranteeNotice = computed(
  () =>
    isGuaranteeNoticeEnabled.value &&
    resolveGuaranteeNoticeDisplayMode(getGuaranteeNoticeDisplayMode(), getShowGuaranteeNotice(true)) ===
      GUARANTEE_NOTICE_DISPLAY_MODE.Modal,
);
</script>

<i18n lang="json">
{
  "en": {
    "terms": "Our {terms} apply. Please note our {cancellationRights} and our {privacyPolicy}."
  },
  "de": {
    "terms": "Es gelten unsere {terms}. Bitte nehmen Sie unser {cancellationRights} und unsere {privacyPolicy} zur Kenntnis."
  }
}
</i18n>
