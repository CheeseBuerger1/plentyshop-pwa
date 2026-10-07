<template>
  <div class="px-4 @md:px-0 flex items-center flex-col" data-testid="order-success-page">
    <div class="w-full @md:w-auto @lg:w-3/4 flex flex-col">
      <!-- Signed in: the way back to "My orders", top left like the back link of the account pages (see OrderAgainButton) -->
      <div v-if="isAuthorized" class="mt-4 self-start">
        <OrderAgainButton :order="order" />
      </div>

      <div class="px-4 pt-4 pb-4 @md:px-6 @md:pb-6 flex flex-col max-w-2xl mx-auto">
        <template v-if="showThanks">
          <h1 class="mb-1 text-2xl text-center" data-testid="success-header">
            {{ !orderGetters.isReturn(order) ? t('order.successHeader') : t('order.successReturnHeader') }}
          </h1>
          <div v-if="!orderGetters.isReturn(order)" class="font-medium text-center">
            {{ t('order.successMessage') }}
          </div>
          <div v-if="order?.order?.deliveryAddress?.options?.length" class="font-medium text-center">
            {{ t('orderConfirmation.confirmationSendTo', { email: orderGetters.getOrderEmail(order) }) }}
          </div>
        </template>
        <template v-else>
          <h1 class="mb-1 text-2xl text-center" data-testid="gj-order-heading">
            {{ tLocal('orderHeading', { id: orderGetters.getId(order) }) }}
          </h1>
          <div class="font-normal text-center" data-testid="gj-order-placed">
            {{ tLocal('orderPlaced', { date: orderGetters.getDate(order, locale) }) }}
          </div>
        </template>
      </div>

      <div class="flex flex-col @md:flex-row flex-wrap gap-x-6">
        <div class="flex-1">
          <div class="border border-1 border-neutral-200 rounded bg-neutral-100 p-4 w-full my-4 text-sm">
            <OrderDetails :order="order" />
          </div>

          <div v-if="order?.order" id="order-items" class="flex flex-col my-4">
            <div v-for="(item, index) in orderGetters.getItems(order)" :key="item.id">
              <OrderSummaryProductCard
                v-if="!orderGetters.isBundleItem(item) && !orderGetters.isCouponItem(item)"
                :order="order"
                :order-item="item"
                :index="index"
                :class="{ 'border-t': index === 0 }"
              />
            </div>
          </div>

          <div class="border border-1 border-neutral-200 rounded bg-neutral-100 p-4 w-full my-4 text-sm">
            <OrderTotals :order="order" />
          </div>
        </div>
        <div class="flex-1">
          <div class="border border-1 border-neutral-200 rounded bg-neutral-100 p-4 w-full my-4 text-sm">
            <OrderShippingSummary :order="order" />
            <OrderPaymentSummary :order="order" />
            <OrderBankDetails v-if="bankDetails && !isCancelled" :bank-details="bankDetails" />
            <PayPalInvoiceDetails :order="order" />
          </div>

          <div
            v-if="!isAuthorized"
            class="border border-1 border-neutral-200 rounded bg-neutral-100 p-4 w-full mt-4 text-sm items-center flex flex-col"
          >
            <div class="font-bold text-primary-700 @md:text-lg text-center mt-5">
              {{ t('orderConfirmation.saveOrderToAccount') }}
            </div>
            <div class="font-bold text-center mt-3">{{ t('orderConfirmation.createAccountForBenefits') }}</div>
            <UiButton variant="primary" class="mt-5 mb-5" @click="isAuthenticationOpen = true">
              {{ t('orderConfirmation.signUp') }}
            </UiButton>
          </div>

          <OrderDocumentsList :order="order" />

          <OrderReturnItems
            v-if="orderGetters.isReturnable(order) && orderGetters.hasReturnableItems(order)"
            :order="order"
          />
        </div>
      </div>
    </div>

    <UiButton :tag="NuxtLink" :href="localePath(paths.home)" class="@max-md:w-full mt-6 mb-8" variant="secondary">
      {{ t('common.actions.continueShopping') }}
    </UiButton>
  </div>

  <UiModal
    v-if="isAuthenticationOpen"
    v-model="isAuthenticationOpen"
    tag="section"
    class="h-full @md:w-[500px] @md:h-fit m-0 p-0 overflow-y-auto"
    aria-labelledby="login-modal"
  >
    <header>
      <UiButton
        :aria-label="t('common.navigation.closeAuthentication')"
        square
        variant="tertiary"
        class="absolute right-2 top-2"
        @click="closeAuthentication()"
      >
        <SfIconClose />
      </UiButton>
    </header>
    <Register
      :order="order"
      :email-address="orderGetters.getOrderEmail(order)"
      :is-modal="true"
      :changeable-view="false"
      @registered="closeAuthentication"
    />
  </UiModal>
</template>

<script setup lang="ts">
/*
 * Copy of ConfirmationPageContent (see COMPONENT_OVERRIDES in index.ts) – the page is also the order details page of
 * "My orders", so it must not greet every old order with "Vielen Dank für Ihre Bestellung!". Changes:
 * - Thank-you text and confirmation hint only for orders of the last 24 hours (utils/orderStatus.ts); older orders
 *   get the heading "Bestellung <id>" with the order date instead.
 * - No bank details for cancelled orders: the transfer is no longer expected.
 * Everything else is the original; the contract test (upstreamContract.spec.ts) names what to adopt after an update.
 */
import { orderGetters } from '@plentymarkets/shop-api';
import { SfIconClose, useDisclosure } from '@storefront-ui/vue';
import type { ConfirmationPageContentProps } from '~/components/ConfirmationPageContent/types';
import { isCancelledOrder, isRecentOrder } from '../utils/orderStatus';
const NuxtLink = resolveComponent('NuxtLink');
const { order } = defineProps<ConfirmationPageContentProps>();
const { isOpen: isAuthenticationOpen, toggle: closeAuthentication } = useDisclosure();
const { isAuthorized } = useCustomer();
const { getActiveShippingCountries } = useActiveShippingCountries();
const localePath = useLocalizedPath();
/* The shop's global t() applies the texts of the translation editor; the module's own texts come from the local scope */
const { t: tLocal, locale } = useI18n({ useScope: 'local' });
const bankDetails = computed(() => orderGetters.getOrderPaymentBankDetails(order));
const showThanks = computed(() => isRecentOrder(order?.order?.createdAt));
const isCancelled = computed(() => isCancelledOrder(order));
useDynamicPaymentButtons().createOrderLoading.value = false;

await getActiveShippingCountries();
</script>

<i18n lang="json">
{
  "en": { "orderHeading": "Order {id}", "orderPlaced": "ordered on {date}" },
  "de": { "orderHeading": "Bestellung {id}", "orderPlaced": "bestellt am {date}" }
}
</i18n>
