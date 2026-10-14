<template>
  <ProductCard ref="cardRef" :product="product" :data-gj-not-orderable="notOrderable || undefined" />
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import type { Product } from '@plentymarkets/shop-api';
import ProductCard from '~/components/ui/ProductCard/ProductCard.vue';
import { isNotOrderable } from '../utils/notOrderable';

/** Add-to-cart button of the shop's item card (list button and the triangle in carousels). */
const ADD_TO_CART_SELECTOR = '[data-testid="add-to-basket-short"]';

/*
 * The shop's item card with one change: an item that cannot be ordered ("Aktuell nicht lieferbar", see
 * utils/notOrderable.ts) gets a disabled add-to-cart button. The original card only disables it while it loads, so
 * the button is disabled from here after each render; the card itself stays the original (all other props pass
 * through). Vue only touches `disabled` when the card's loading state changes, which a disabled button cannot start.
 */
const props = defineProps<{ product: Product }>();

const { t } = useI18n({ useScope: 'local' });
const cardRef = ref<ComponentPublicInstance | null>(null);
const notOrderable = computed(() => isNotOrderable(props.product));

const syncButton = () => {
  const root = cardRef.value?.$el as HTMLElement | undefined;
  const button = root?.querySelector?.<HTMLButtonElement>(ADD_TO_CART_SELECTOR);
  if (!button) {
    return;
  }
  button.disabled = notOrderable.value;
  if (notOrderable.value) {
    button.title = t('notOrderable');
  } else {
    button.removeAttribute('title');
  }
};

onMounted(syncButton);
onUpdated(syncButton);
watch(notOrderable, () => nextTick(syncButton));
</script>

<i18n lang="json">
{
  "en": { "notOrderable": "Currently not available" },
  "de": { "notOrderable": "Aktuell nicht lieferbar" }
}
</i18n>
