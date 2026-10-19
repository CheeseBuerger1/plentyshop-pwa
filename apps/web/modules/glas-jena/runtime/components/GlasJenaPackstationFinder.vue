<!--
  DHL Packstation search of the checkout (replaces PreferredDelivery/PackstationFinder.vue, see COMPONENT_OVERRIDES):
  the original unchanged, but closed when it appears (wish of the shop owner, 2026-10-20) – the original opens it,
  so its search fields and map take much space although only a few customers want a Packstation.
  The original keeps the state in a ref of its own (`packstationAccordionOpen = ref(true)`); this wrapper closes it the
  way a customer would, with a click on its heading (SfAccordionItem toggles on the summary), once each time the box
  appears – it only appears when the shipping country has Packstations, after the shipping profiles are loaded.
-->
<template>
  <div ref="root" class="contents">
    <OriginalPackstationFinder />
  </div>
</template>

<script setup lang="ts">
import OriginalPackstationFinder from '~/components/PreferredDelivery/PackstationFinder.vue';

const root = ref<HTMLElement | null>(null);
const { deliveryLocationAvailable } = usePackstationFinder();

const close = async () => {
  await nextTick();
  root.value
    ?.querySelector<HTMLElement>("[data-testid='preferred-delivery-location-finder'] details[open] > summary")
    ?.click();
};

onMounted(close);
watch(deliveryLocationAvailable, (available) => {
  if (available) {
    close();
  }
});
</script>
