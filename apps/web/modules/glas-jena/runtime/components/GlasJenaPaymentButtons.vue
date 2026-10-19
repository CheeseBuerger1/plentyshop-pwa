<!--
  Buy button of the checkout (replaces PaymentButtons, see COMPONENT_OVERRIDES): the original unchanged, with the legal
  notes right above it ("Ihre gesetzlichen Gewährleistungsrechte", terms note; wish of the shop owner, 2026-10-20).
  The checkout page's own guarantee link below the button renders nothing instead (GlasJenaNoGuaranteeNotice.vue).
-->
<template>
  <GlasJenaCheckoutLegalNotice with-guarantee-notice class="mb-4" />
  <OriginalPaymentButtons />
</template>

<script setup lang="ts">
import OriginalPaymentButtons from '~/components/PaymentButtons/PaymentButtons.vue';
import GlasJenaCheckoutLegalNotice from './GlasJenaCheckoutLegalNotice.vue';
</script>
