<!--
  Cart page (replaces pages/cart.vue, see PAGE_OVERRIDES). Copy of the original with these changes, like the LTS cart
  (wish of the shop owner, 2026-10-18):
  - a short introduction above the articles: what can be done here and that the order is only sent in the last step
  - below the articles the country of delivery and, if there is more than one, the shipping method
    (GlasJenaCartShipping.vue); on phones below the coupon field, before the order summary
  - no "Zurück" button of the checkout layout above the cart (glas-jena.css, the banner shows the page title)
  Everything else is the original; upstreamContractCart.spec.ts shows when the original changes.
-->
<template>
  <NuxtLayout
    name="checkout"
    :back-label-desktop="t('common.actions.back')"
    :back-label-mobile="t('common.actions.back')"
    :heading="t('cart.myCart')"
  >
    <div v-if="!cartIsEmpty" data-testid="cart-page-content">
      <p class="gj-cart-intro mt-8 mb-8" data-testid="gj-cart-intro">
        {{ tLocal('intro', { checkout: t('common.actions.goToCheckout') }) }}
      </p>
      <div class="@md:grid @md:grid-cols-12 @md:gap-x-6">
        <div class="col-span-7 mb-2 @md:mb-0">
          <div v-for="(cartItem, index) in cart?.items" :key="cartItem.id">
            <UiCartProductCard :cart-item="cartItem" :class="{ 'border-t': index === 0 }" />
          </div>
          <Coupon v-if="viewport.isLessThan('lg')" class="mb-2" />
          <GlasJenaCartShipping class="mb-8 @md:mb-0" />
        </div>
        <div
          class="relative col-span-5 @md:sticky @md:top-10 h-fit"
          :class="{ 'pointer-events-none opacity-50': loading || shippingLoading }"
        >
          <SfLoaderCircular
            v-if="loading || shippingLoading"
            class="absolute top-[130px] right-0 left-0 m-auto z-loader"
            size="2xl"
          />
          <OrderSummary :cart="cart">
            <Coupon v-if="viewport.isGreaterOrEquals('lg')" class="mb-5" />
            <UiButton
              data-testid="checkout-button"
              :tag="NuxtLink"
              :to="goToCheckout()"
              size="lg"
              class="w-full mb-4 @md:mb-0"
            >
              {{ t('common.actions.goToCheckout') }}
            </UiButton>
            <client-only>
              <PayPalExpressButton :disabled="loading" location="cartPage" class="mt-4" type="CartPreview" />
              <PayPalPayLaterBanner
                placement="cart"
                location="cartPage"
                :amount="cartGetters.getTotal(cartGetters.getTotals(cart))"
              />
            </client-only>
          </OrderSummary>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center flex-col pt-24 pb-32" data-testid="cart-page-content">
      <h2 class="mt-8 typography-headline-3 font-bold">{{ t('cart.empty') }}</h2>
      <ModuleComponentRendering area="cart.empty" class="mt-6" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { SfLoaderCircular } from '@storefront-ui/vue';
import { cartGetters } from '@plentymarkets/shop-api';
import type { Locale } from '#i18n';
import GlasJenaCartShipping from '../components/GlasJenaCartShipping.vue';
import { useGlasJenaCartShipping } from '../composables/useGlasJenaCartShipping';

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const { setPageMeta } = usePageMeta();

definePageMeta({ pageType: 'static' });

/* Own text of the introduction (below); shop texts come from the global `t` */
const { t: tLocal } = useI18n({ useScope: 'local' });

const NuxtLink = resolveComponent('NuxtLink');
const viewport = useViewport();
const localePath = useLocalizedPath();
const { isAuthorized } = useCustomer();
const { data: cart, cartIsEmpty, loading } = useCart();
/* While the country or shipping method changes, the order summary is dimmed like while the cart loads */
const { loading: shippingLoading } = useGlasJenaCartShipping();
const goToCheckout = () => (isAuthorized.value ? localePath(paths.checkout) : localePath(paths.guestLogin));

const icon = 'page';
setPageMeta(t('common.labels.cart'), icon);
</script>

<i18n lang="json">
{
  "en": {
    "intro": "Here you can change quantities, remove items and choose the country of delivery. Your order starts with “{checkout}”; before sending it, you will see all details once more."
  },
  "de": {
    "intro": "Hier können Sie Mengen ändern, Artikel entfernen und das Lieferland wählen. Mit „{checkout}“ beginnen Sie die Bestellung; vor dem Absenden sehen Sie noch einmal alle Angaben."
  }
}
</i18n>
