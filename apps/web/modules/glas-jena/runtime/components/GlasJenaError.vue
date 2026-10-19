<!--
  Error page (replaces the error component, see `app:resolve` in index.ts): the original error.vue inside the shop's
  formatting. Nuxt shows the error page instead of app.vue, which puts the class `font-body` and the font of the shop
  settings on <body> – so far the error page had neither (system font, "Fehler 404" at 400 instead of 300, the text
  below at 600). This wrapper sets them like app.vue and renders the original unchanged. White instead of app.vue's
  editor background (`bg-editor-body-bg`): there the white content area lies above it, the error page has none.
-->
<template>
  <Body class="font-body bg-white" :style="currentFont" />
  <OriginalError :error="error" />
</template>

<script setup lang="ts">
import OriginalError from '~/error.vue';
import type { GlasJenaErrorProps } from './types';

const { error } = defineProps<GlasJenaErrorProps>();
const { currentFont } = useSiteConfiguration();
</script>
