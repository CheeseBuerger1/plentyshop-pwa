<!--
  Window after "Add to cart" (replaces components/QuickCheckout/QuickCheckout.vue, see COMPONENT_OVERRIDES).
  Copy of the original with three changes (wish of the shop owner):
  - new button "Einkauf fortsetzen" above the cart button: closes the window, like the ✕
  - the cart button says "Zum Warenkorb" instead of "Warenkorb prüfen"
  - no short description of the article; the VAT/shipping note sits directly under the price, followed by the cart
    summary ("Ihr Warenkorb enthält … Artikel", subtotal), which moves here from the top of the right column, so that
    column starts with the buttons
  - spacing of the right column: narrow view (columns stacked) less space between the summary and the buttons; wide
    view the buttons start where "Warenkorb prüfen" used to be (112 px from the top)
  - "Anzahl" in the size and colour of the summary; the window is a named dialog and handles the focus (see script)
  Everything else is the original; upstreamContract.spec.ts shows when the original changes.
-->
<template>
  <UiModal
    v-if="isOpen"
    v-model="isOpen"
    tag="section"
    class="h-full @md:h-fit m-0 p-0 @lg:w-[1000px] overflow-y-auto"
    aria-label="quick-checkout-modal"
    role="dialog"
    aria-labelledby="gj-quick-checkout-title"
    @mousemove="endTimer()"
  >
    <header ref="headerRef">
      <h2 id="gj-quick-checkout-title" class="font-bold text-lg leading-6 @md:text-2xl">
        <span>{{ t('quickCheckout.heading') }}</span>
      </h2>
      <div class="absolute right-2 top-2 flex items-center">
        <span v-if="hasTimer" class="mr-2 text-gray-400">{{ timer }}s</span>
        <UiButton
          :aria-label="t('common.navigation.closeDialog')"
          data-testid="quick-checkout-close"
          square
          variant="tertiary"
          @click="close"
        >
          <SfIconClose />
        </UiButton>
      </div>
    </header>

    <div class="@lg:grid @lg:grid-cols-2 @lg:gap-4">
      <!-- Narrow view (columns stacked): less space below, so the buttons follow closer (pb-2, pt-0 below) -->
      <div class="@lg:border-r-2 flex flex-col items-center p-8 pb-2 @lg:pb-8">
        <NuxtImg
          :src="addModernImageExtension(productGetters.getMiddleImage(props.product))"
          :alt="imageAlt"
          :title="
            productImageGetters.getImageName(productImageGetters.getFirstImage(props.product))
              ? productImageGetters.getImageName(productImageGetters.getFirstImage(props.product))
              : null
          "
          width="240"
          height="240"
          loading="lazy"
          class="mb-3"
        />
        <div class="flex mb-1">
          <h1 class="font-bold typography-headline-4 break-word" data-testid="product-name">
            {{ productGetters.getName(props.product) }}
          </h1>
        </div>
        <div class="mb-3">
          <!-- Same size and colour as the cart summary below (the original: 18 px, grey) -->
          <span class="self-center text-base">
            {{ t('account.ordersAndReturns.orderDetails.quantity') }}: {{ quantity }}
          </span>
        </div>

        <ProductPrice :product="props.product" />

        <!-- -mt-2: closer to the price (the price block has a 12 px margin below) -->
        <div class="-mt-2 mb-6 typography-text-xs flex gap-1">
          <span>{{ t('common.labels.asterisk') }}</span>
          <span v-if="showNetPrices">{{ t('product.priceExclVAT') }}</span>
          <span v-else>{{ t('product.priceInclVAT') }}</span>
          <i18n-t keypath="shipping.excludedLabel" scope="global">
            <template #shipping>
              <UiLink
                :href="localePath(paths.shipping)"
                target="_blank"
                class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
              >
                {{ t('common.labels.delivery') }}
              </UiLink>
            </template>
          </i18n-t>
        </div>

        <!-- Same thin line as above the PayPal button (OrDivider), without the "or" -->
        <div class="w-full border-t-2 mb-4" aria-hidden="true" data-testid="gj-quick-checkout-divider" />

        <div class="mb-4 w-full max-w-xs" data-testid="gj-quick-checkout-summary">
          <!-- All three lines in the same weight (the original has 500 / 400 / 500) -->
          <p class="text-base">{{ t('quickCheckout.cartContains', { count: cartItemsCount }) }}</p>
          <div class="grid grid-cols-2">
            <p class="text-base">{{ t('quickCheckout.subTotal') }}:</p>
            <p v-if="showNetPrices" data-testid="subtotal" class="text-base text-right">
              {{ format(cartGetters.getItemSumNet(cart)) }}
            </p>
            <p v-else data-testid="subtotal" class="text-base text-right">{{ format(totals.subTotal) }}</p>
          </div>
        </div>

        <VariationProperties :product="lastUpdatedProduct" />
      </div>
      <!-- Wide view: the buttons start 112 px from the top, where "Warenkorb prüfen" stood below the cart summary -->
      <div class="pt-0 pb-8 px-10 @lg:pt-28">
        <UiButton
          data-testid="gj-quick-checkout-continue-button"
          size="lg"
          class="w-full mb-3"
          variant="secondary"
          @click="close"
        >
          {{ tLocal('continueShopping') }}
        </UiButton>

        <UiButton
          data-testid="quick-checkout-cart-button"
          size="lg"
          class="w-full mb-3"
          variant="secondary"
          @click="goToPage(paths.cart)"
        >
          {{ tLocal('goToCart') }}
        </UiButton>

        <UiButton
          data-testid="quick-checkout-checkout-button"
          size="lg"
          class="w-full mb-4 @md:mb-0"
          @click="goToCheckout()"
        >
          {{ t('common.actions.goToCheckout') }}
        </UiButton>
        <OrDivider v-if="isPaypalAvailable('quickCheckout').value" class="my-4" />
        <PayPalExpressButton
          class="w-full text-center"
          location="quickCheckout"
          type="CartPreview"
          @on-approved="isOpen = false"
        />
        <PayPalPayLaterBanner placement="payment" location="quickCheckout" :amount="totals.total" />

        <GuaranteeBlock :product="product" class="mt-4" />
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { SfIconClose } from '@storefront-ui/vue';
import type { QuickCheckoutProps } from '~/components/QuickCheckout/types';
import type { Product } from '@plentymarkets/shop-api';
import { cartGetters, productGetters, productImageGetters } from '@plentymarkets/shop-api';
import ProductPrice from '~/components/ProductPrice/ProductPrice.vue';
import { getLastInteractiveElement } from '../utils/lastInteractiveElement';
const props = defineProps<QuickCheckoutProps>();

const { format } = usePriceFormatter();
const { showNetPrices } = useCart();
const localePath = useLocalizedPath();
const { data: cart, lastUpdatedCartItem } = useCart();
const { isAvailable: isPaypalAvailable, loadConfig } = usePayPal();
const { addModernImageExtension } = useModernImage();
const { isOpen, timer, startTimer, endTimer, closeQuickCheckout, hasTimer, quantity } = useQuickCheckout();
const cartItemsCount = computed(() => cart.value?.items?.reduce((price, { quantity }) => price + quantity, 0) ?? 0);
const { isAuthorized } = useCustomer();
/* Own short texts (below); shop texts come from the global `t` */
const { t: tLocal } = useI18n({ useScope: 'local' });

/*
 * Keyboard and screen readers: SfModal traps Tab and closes on Escape, but only while the focus is inside the window,
 * and the original never moves it there (`initialFocus: false`). So the focus goes to the window when it opens and back
 * to where it was (the "add to cart" button) when it is closed – not when it is left for the cart or the checkout.
 */
const headerRef = ref<HTMLElement | null>(null);
/* The "add to cart" button is disabled while the item is added and has lost the focus by now: the plugin knows it */
const focusBeforeOpening = import.meta.client
  ? (getLastInteractiveElement() ?? (document.activeElement as HTMLElement | null))
  : null;
let restoreFocus = true;

onMounted(async () => {
  startTimer();
  loadConfig();
  await nextTick();
  headerRef.value?.closest<HTMLElement>('[aria-modal="true"]')?.focus();
});
onUnmounted(() => {
  endTimer();
  if (restoreFocus && focusBeforeOpening?.isConnected && focusBeforeOpening !== document.body) {
    focusBeforeOpening.focus();
  }
});

const lastUpdatedProduct = computed(() => cartGetters.getVariation(lastUpdatedCartItem.value) || ({} as Product));

const totals = computed(() => {
  const totalsData = cartGetters.getTotals(cart.value);
  return {
    total: totalsData.total,
    subTotal: totalsData.subtotal,
    vats: totalsData.totalVats,
  };
});

const imageAlt = computed(() => {
  const image = props.product?.images?.all[0];
  return image ? productImageGetters.getImageAlternate(image) : '';
});

const goToCheckout = () => (isAuthorized.value ? goToPage(paths.checkout) : goToPage(paths.guestLogin));

const goToPage = (path: string) => {
  restoreFocus = false;
  closeQuickCheckout();
  navigateTo(localePath(path));
};

const close = () => {
  closeQuickCheckout();
};
</script>

<i18n lang="json">
{
  "en": {
    "continueShopping": "Continue shopping",
    "goToCart": "Go to cart"
  },
  "de": {
    "continueShopping": "Einkauf fortsetzen",
    "goToCart": "Zum Warenkorb"
  }
}
</i18n>
