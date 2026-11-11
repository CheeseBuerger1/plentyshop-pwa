<template>
  <picture>
    <img id="logo" :src="headerLogo" :alt="LOGO_ALT" :width="LOGO_WIDTH" :height="LOGO_HEIGHT" data-testid="gj-logo" />
  </picture>
</template>

<script setup lang="ts">
/**
 * The header logo like the original's UiLogo (logo image from the shop settings), but with the brand as alternative
 * text: the original writes "<shop name> logo", i.e. "OnlineMarket -GLAS in JENA- logo" (SEO check, 2026-11-11).
 * Width and height are the logo image's own size (136 × 139 px), so its field is reserved before it has loaded.
 */
const LOGO_ALT = 'GLAS in JENA';
const LOGO_WIDTH = 136;
const LOGO_HEIGHT = 139;

const { getSetting: getHeaderLogo } = useSiteSettings('headerLogo');
const headerLogo = computed(() => getHeaderLogo());
</script>
