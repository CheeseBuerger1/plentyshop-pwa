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
 * the button is disabled from here; the card itself stays the original (all other props pass through). The card can
 * render its button again after this component has mounted (item lists hydrate their cards later), so an observer
 * disables it again on every change inside the card, and a click on it is stopped in any case.
 * Look and text ("Nicht lieferbar") come from glas-jena.css via `data-gj-not-orderable`.
 */
const props = defineProps<{ product: Product }>();

const cardRef = ref<ComponentPublicInstance | null>(null);
const notOrderable = computed(() => isNotOrderable(props.product));

const getRoot = () => cardRef.value?.$el as HTMLElement | undefined;

const syncButton = () => {
  const button = getRoot()?.querySelector?.<HTMLButtonElement>(ADD_TO_CART_SELECTOR);
  if (button && button.disabled !== notOrderable.value) {
    button.disabled = notOrderable.value;
  }
};

const stopNotOrderableClick = (event: Event) => {
  if (notOrderable.value && (event.target as Element | null)?.closest?.(ADD_TO_CART_SELECTOR)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};

let observer: MutationObserver | null = null;

onMounted(() => {
  const root = getRoot();
  if (!root?.querySelector) {
    return;
  }
  syncButton();
  root.addEventListener('click', stopNotOrderableClick, true);
  observer = new MutationObserver(syncButton);
  observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled'] });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  getRoot()?.removeEventListener?.('click', stopNotOrderableClick, true);
});

onUpdated(syncButton);
watch(notOrderable, () => nextTick(syncButton));
</script>
