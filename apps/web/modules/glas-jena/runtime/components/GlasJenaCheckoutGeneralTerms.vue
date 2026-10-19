<!--
  Terms of the checkout (replaces CheckoutGeneralTerms, see COMPONENT_OVERRIDES) without the checkbox (wish of the shop
  owner, 2026-10-20): "Es gelten unsere AGB …" is a note, not a consent to tick. The checkout only places an order with
  the terms "accepted" (useCheckout, readonly-checkout), so this component sets that value itself.
  Where the note stands: on the checkout page above the buy button (GlasJenaPaymentButtons.vue), so here nothing; on the
  page after PayPal Express (readonly-checkout), which has no such place, here where the checkbox stood.
-->
<template>
  <GlasJenaCheckoutLegalNotice v-if="isReadonlyCheckout" class="mx-4" />
</template>

<script setup lang="ts">
import GlasJenaCheckoutLegalNotice from './GlasJenaCheckoutLegalNotice.vue';

const route = useRoute();
const isReadonlyCheckout = computed(() => route.path.includes(paths.readonlyCheckout));

const { setCheckboxValue } = useAgreementCheckbox('checkoutGeneralTerms');
setCheckboxValue(true);
</script>
