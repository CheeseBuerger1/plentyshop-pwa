<!--
  One shipping method as a tile like the payment methods of the checkout (CheckoutPayment.vue), in the cart
  (GlasJenaCartShipping.vue) and the checkout (GlasJenaShippingMethod.vue); wish of the shop owner, 2026-10-20: no
  radio button to see, the chosen tile framed, the logo first and the name after it. The name without the parcel
  service ("Warenpost International" instead of "POST - Warenpost International"), which the logo shows (and its
  alternative text tells screen readers). The radio button stays for keyboards and screen readers, hidden like the
  payment methods' (`sr-only`), so the tiles still are one choice.
-->
<template>
  <label class="relative block" data-testid="gj-shipping-method-tile">
    <input
      type="radio"
      :name="group"
      class="peer sr-only"
      :value="presetId"
      :checked="checked"
      :disabled="disabled"
      :data-testid="`gj-shipping-method-${presetId}`"
      @click.prevent="onSelect"
    />
    <span
      class="h-full min-h-20 flex items-center gap-4 py-3 px-4 cursor-pointer rounded-md border border-neutral-200 -outline-offset-2 hover:border-primary-50 hover:bg-primary-50 active:border-primary-100 active:bg-primary-50 peer-focus:border-primary-50 peer-focus:bg-primary-50 peer-checked:outline peer-checked:outline-2 peer-checked:outline-primary-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
    >
      <GlasJenaShippingMethodLogo :method="method" />
      <span class="flex flex-col min-w-0">
        <span>{{ presetName }}</span>
        <span class="font-medium whitespace-nowrap" data-testid="gj-shipping-method-amount">{{ amount }}</span>
        <span v-if="deliveryDays" class="text-xs text-neutral-500">{{ deliveryDays }}</span>
      </span>
    </span>
  </label>
</template>

<script setup lang="ts">
import { shippingProviderGetters } from '@plentymarkets/shop-api';
import GlasJenaShippingMethodLogo from './GlasJenaShippingMethodLogo.vue';
import type { GlasJenaShippingMethodTileEmits, GlasJenaShippingMethodTileProps } from './types';

const props = defineProps<GlasJenaShippingMethodTileProps>();
const emit = defineEmits<GlasJenaShippingMethodTileEmits>();

const presetId = computed(() => shippingProviderGetters.getParcelServicePresetId(props.method));
/* The second part of the name; the whole name if the shipping profile has no name of its own */
const presetName = computed(
  () => props.method.parcelServicePresetName || shippingProviderGetters.getShippingMethodName(props.method),
);

const onSelect = () => {
  if (!props.disabled) {
    emit('select', presetId.value);
  }
};
</script>
