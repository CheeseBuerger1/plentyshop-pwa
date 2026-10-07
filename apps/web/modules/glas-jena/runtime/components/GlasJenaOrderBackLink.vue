<template>
  <!-- Instead of "buy again" (see OrderAgainButton in index.ts): back to "My orders", like the back link of the account pages -->
  <UiButton
    :tag="NuxtLink"
    :to="localePath(paths.accountMyOrders)"
    class="-ml-4 min-h-11 whitespace-nowrap"
    variant="tertiary"
    data-testid="gj-order-back-link"
  >
    <template #prefix>
      <SfIconArrowBack aria-hidden="true" />
    </template>
    {{ t('backToOverview') }}
  </UiButton>
</template>

<script setup lang="ts">
import { SfIconArrowBack } from '@storefront-ui/vue';
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
  "en": { "backToOverview": "To overview" },
  "de": { "backToOverview": "Zur Übersicht" }
}
</i18n>
