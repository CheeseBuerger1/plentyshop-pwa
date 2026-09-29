<template>
  <svg
    class="gj-line-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    :data-testid="`gj-line-icon-${name}`"
  >
    <template v-if="name === 'person'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </template>
    <path v-else-if="name === 'close'" d="M6 6l12 12M18 6 6 18" />
    <template v-else-if="name === 'cart'">
      <path d="M2.5 3.5h2.8l2.4 11.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L21 7.5H6.2" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17.5" cy="19.5" r="1.3" />
    </template>
    <path v-else-if="name === 'menu'" d="M4 7h16M4 12h16M4 17h16" />
  </svg>
</template>

<script setup lang="ts">
import type { GlasJenaLineIconProps } from './types';

/*
 * Thin line icons for the header tiles, like the LTS shop's outline icons (person, magnifier, cart) – the shop's
 * Material icons are filled and look heavier. 28 px, 1.5 px lines, in the tile's text colour. Decorative: the
 * tiles carry the accessible names.
 */
defineProps<GlasJenaLineIconProps>();
</script>

<style scoped>
.gj-line-icon {
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
}
</style>
