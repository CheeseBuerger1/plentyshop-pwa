<!--
  Buy button of the checkout (replaces PaymentButtons, see COMPONENT_OVERRIDES): the original unchanged, with the legal
  notes right above it ("Ihre gesetzlichen Gewährleistungsrechte", terms note; wish of the shop owner, 2026-10-20).
  The checkout page's own guarantee link below the button renders nothing instead (GlasJenaNoGuaranteeNotice.vue).

  Payment method (useGlasJenaPaymentGuard): a payment method that is no longer allowed is switched to the first allowed
  one; if none is allowed, a click on the buy button is caught before it reaches the original's handler, and the page
  shows a hint and the payment methods instead of ordering (wish of the shop owner, 2026-10-24).
-->
<template>
  <GlasJenaCheckoutLegalNotice with-guarantee-notice class="mb-4" />
  <div data-testid="gj-payment-buttons" @click.capture="stopOrderWithoutAllowedPayment">
    <OriginalPaymentButtons />
  </div>
</template>

<script setup lang="ts">
import OriginalPaymentButtons from '~/components/PaymentButtons/PaymentButtons.vue';
import GlasJenaCheckoutLegalNotice from './GlasJenaCheckoutLegalNotice.vue';
import { useGlasJenaPaymentGuard } from '../composables/useGlasJenaPaymentGuard';
import { CHECKOUT_PAYMENT_SELECTOR } from '../utils/checkoutPayment';

const { t: tLocal } = useI18n({ useScope: 'local' });
const { send } = useNotification();
const { isOrderPaymentAllowed } = useGlasJenaPaymentGuard();

const stopOrderWithoutAllowedPayment = (event: MouseEvent) => {
  /* Only clicks on a button order; a click beside it changes nothing */
  if (isOrderPaymentAllowed.value || !(event.target as Element | null)?.closest('button')) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  send({ message: tLocal('choosePaymentMethod'), type: 'warning' });
  scrollToHTMLObject(CHECKOUT_PAYMENT_SELECTOR);
};
</script>

<i18n lang="json">
{
  "en": { "choosePaymentMethod": "Please choose a payment method." },
  "de": { "choosePaymentMethod": "Bitte wählen Sie eine Zahlungsart." }
}
</i18n>
