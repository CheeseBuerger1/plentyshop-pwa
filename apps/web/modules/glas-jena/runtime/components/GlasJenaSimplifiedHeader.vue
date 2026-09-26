<template>
  <SimplifiedHeader />
  <!-- Next to the header, not inside it, so the layout's `main` follows it (see the banner rules in glas-jena.css) -->
  <GlasJenaPageBanner v-if="!isEditing" />
</template>

<script setup lang="ts">
import SimplifiedHeader from '~/components/ui/SimplifiedHeader.vue';
import GlasJenaPageBanner from './GlasJenaPageBanner.vue';

/**
 * The simplified header of the checkout (and offer) layout with the page banner below it, like the LTS shop.
 * In the block editor it stays the original header only, like the full header.
 */
const { isEditing } = useEditor();
</script>
