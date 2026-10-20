<!--
  Logo of a shipping method in the shipping choice of the cart (GlasJenaCartShipping.vue) and the checkout
  (GlasJenaShippingMethod.vue), like the LTS shop (wish of the shop owner, 2026-10-20), see getShippingMethodLogo: the
  shop's own logo of the shipping profile (the cards of the LTS plugin "Ceres Beautifier Shipping Icons", 980 × 680),
  otherwise the icon of PlentyONE (DHL: 256 × 57). The name of the shipping method stands next to it, so the image
  needs no text of its own (empty alt). Nothing without a logo.
-->
<template>
  <img
    v-if="logo"
    :src="logo.src"
    alt=""
    class="gj-shipping-method-logo"
    :class="{ 'gj-shipping-method-logo--card': logo.own }"
    :width="logo.own ? 980 : 256"
    :height="logo.own ? 680 : 57"
    loading="lazy"
    data-testid="gj-shipping-method-logo"
  />
</template>

<script setup lang="ts">
import { getShippingMethodLogo } from '../utils/cartShipping';
import { SHIPPING_METHOD_LOGOS } from '../utils/shippingLogos';
import type { GlasJenaShippingMethodLogoProps } from './types';

const props = defineProps<GlasJenaShippingMethodLogoProps>();

const logo = computed(() => getShippingMethodLogo(props.method, SHIPPING_METHOD_LOGOS));
</script>
