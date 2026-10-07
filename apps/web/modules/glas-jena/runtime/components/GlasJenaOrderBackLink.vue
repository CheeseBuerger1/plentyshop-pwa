<template>
  <!-- Instead of "buy again" (see OrderAgainButton in index.ts): back to "My orders", like the back link of the account pages -->
  <UiButton
    :tag="NuxtLink"
    :to="localePath(isRecent ? paths.home : paths.accountMyOrders)"
    class="-ml-4 min-h-11 whitespace-nowrap"
    variant="tertiary"
    data-testid="gj-order-back-link"
  >
    <template #prefix>
      <SfIconArrowBack aria-hidden="true" />
    </template>
    {{ isRecent ? t('toHome') : t('backToOverview') }}
  </UiButton>
</template>

<script setup lang="ts">
import { SfIconArrowBack } from '@storefront-ui/vue';
import type { OrderAgainButtonProps } from '~/components/OrderAgainButton/types';
import { isRecentOrder } from '../utils/orderStatus';
/*
 * Replaces OrderAgainButton on the order confirmation, as requested by the shop owner: no "buy again", and instead of
 * "continue shopping" (hidden in glas-jena.css) a way back to "My orders". The confirmation page renders it only for
 * signed-in customers, the only ones with an order list; it also serves as the order details page of "My orders".
 */
/* The confirmation page passes the order; no stray `order` attribute on the link */
defineOptions({ inheritAttrs: false });
const { order } = defineProps<OrderAgainButtonProps>();

const NuxtLink = resolveComponent('NuxtLink');
const localePath = useLocalizedPath();
/* Right after the purchase (order confirmation) "To home page", for older orders (order details) "To overview" */
const isRecent = computed(() => isRecentOrder(order?.order?.createdAt));
const { t } = useI18n({ useScope: 'local' });
</script>

<i18n lang="json">
{
  "en": { "backToOverview": "To overview", "toHome": "To home page" },
  "de": { "backToOverview": "Zur Übersicht", "toHome": "Zur Startseite" }
}
</i18n>
