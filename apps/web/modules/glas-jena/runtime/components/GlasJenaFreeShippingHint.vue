<!--
  Free shipping in the cart (GlasJenaCart.vue, below the country of delivery) and the window after "Add to cart"
  (GlasJenaQuickCheckout.vue, below the subtotal): "Gratis Versand" with how much is still missing, or that it is
  reached, and a bar of the way to it (wish of the shop owner, 2026-10-30, after the example of another shop). Only for
  Germany as country of delivery, the only country with such a limit, so the texts need not name the country. The
  limit comes from the editor setting (Checkout » Other settings » Free Shipping, 150 € by default, none for 0); see
  utils/freeShipping.ts.
-->
<template>
  <div v-if="remainder !== undefined" class="text-sm" data-testid="gj-free-shipping-hint">
    <div class="flex justify-between gap-2" aria-live="polite">
      <span id="gj-free-shipping-label">{{ tLocal('label') }}</span>
      <span :class="{ 'text-positive-700': reached }" data-testid="gj-free-shipping-remainder">
        {{ reached ? tLocal('reached') : tLocal('missing', { amount: format(remainder) }) }}
      </span>
    </div>
    <div
      class="mt-1 h-2 rounded-full bg-neutral-200 overflow-hidden"
      role="progressbar"
      aria-labelledby="gj-free-shipping-label"
      aria-valuemin="0"
      :aria-valuemax="limit"
      :aria-valuenow="Math.min(itemSum, limit)"
      :aria-valuetext="reached ? tLocal('reached') : tLocal('missing', { amount: format(remainder) })"
      data-testid="gj-free-shipping-bar"
    >
      <div
        class="h-full rounded-full"
        :class="reached ? 'bg-positive-700' : 'bg-primary-500'"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFreeShippingRemainder } from '../utils/freeShipping';
import { useGlasJenaFreeShippingFrom } from '../composables/useGlasJenaFreeShippingFrom';

const { t: tLocal } = useI18n({ useScope: 'local' });
const { format } = usePriceFormatter();
const { data: cart } = useCart();
const freeShippingFrom = useGlasJenaFreeShippingFrom();

const itemSum = computed(() => cart.value?.itemSum ?? 0);
const remainder = computed(() =>
  getFreeShippingRemainder(cart.value?.shippingCountryId, itemSum.value, freeShippingFrom.value),
);
/* Only used while there is a limit (the note is hidden without one) */
const limit = computed(() => freeShippingFrom.value ?? 0);
const reached = computed(() => remainder.value === 0);
/* At least a sliver, so the bar shows where it starts (like the example) */
const progress = computed(() => Math.max(3, Math.min(100, (itemSum.value / (limit.value || 1)) * 100)));
</script>

<i18n lang="json">
{
  "en": {
    "label": "Free shipping",
    "missing": "{amount} to go",
    "reached": "reached"
  },
  "de": {
    "label": "Gratis Versand",
    "missing": "noch {amount}",
    "reached": "erreicht"
  }
}
</i18n>
