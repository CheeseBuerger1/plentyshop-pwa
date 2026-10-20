<!--
  Logo of a shipping method in the shipping choice of the cart (GlasJenaCartShipping.vue) and the checkout
  (GlasJenaShippingMethod.vue), like the LTS shop (wish of the shop owner, 2026-10-20), see getShippingMethodLogo. The
  name of the shipping method stands next to it, so the image needs no text of its own (empty alt). Nothing without a
  logo.
-->
<template>
  <img
    v-if="logo"
    :src="logo"
    alt=""
    class="gj-shipping-method-logo"
    width="256"
    height="57"
    loading="lazy"
    data-testid="gj-shipping-method-logo"
  />
</template>

<script setup lang="ts">
import { getShippingMethodLogo } from '../utils/cartShipping';
import type { GlasJenaShippingMethodLogoProps } from './types';

const props = defineProps<GlasJenaShippingMethodLogoProps>();

const logo = computed(() => getShippingMethodLogo(props.method));
</script>
