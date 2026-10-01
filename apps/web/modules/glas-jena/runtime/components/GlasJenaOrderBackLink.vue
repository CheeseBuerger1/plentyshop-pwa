<template>
  <!-- Instead of "buy again" (see OrderAgainButton in index.ts): back to "My orders" -->
  <UiButton
    :tag="NuxtLink"
    :to="localePath(paths.accountMyOrders)"
    variant="secondary"
    class="mt-4 w-full"
    data-testid="gj-order-back-link"
  >
    {{ t('backToOverview') }}
  </UiButton>
</template>

<script setup lang="ts">
/*
 * Replaces OrderAgainButton on the order confirmation, as requested by the shop owner: no "buy again", and instead of
 * "continue shopping" (hidden in glas-jena.css) a way back to "My orders". The confirmation page renders it only for
 * signed-in customers, the only ones with an order list; it also serves as the order details page of "My orders".
 */
/* The confirmation page passes the order, which the link does not need (no stray `order` attribute) */
defineOptions({ inheritAttrs: false });

const NuxtLink = resolveComponent('NuxtLink');
const localePath = useLocalizedPath();
const { t } = useI18n({ useScope: 'local' });
</script>

<i18n lang="json">
{
  "en": { "backToOverview": "Back to overview" },
  "de": { "backToOverview": "Zurück zur Übersicht" }
}
</i18n>
