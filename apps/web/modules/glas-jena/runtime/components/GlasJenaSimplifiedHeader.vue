<template>
  <SimplifiedHeader v-if="isEditing" />
  <!-- Header and page banner ("Kasse") as siblings, so the layout's `main` follows the banner (see glas-jena.css) -->
  <GlasJenaHeaderBlocks v-else />
</template>

<script setup lang="ts">
import SimplifiedHeader from '~/components/ui/SimplifiedHeader.vue';
import GlasJenaHeaderBlocks from './GlasJenaHeaderBlocks.vue';

/**
 * Header of the checkout (and offer) layout. The LTS shop has no reduced checkout header: the checkout shows the
 * same header as all other pages, with the banner "Kasse" below it. The block editor keeps the original simplified
 * header, like it keeps the original full header.
 */
const { isEditing } = useEditor();
</script>
