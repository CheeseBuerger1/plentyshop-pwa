<template>
  <div class="font-bold text-primary-500 @md:text-lg mb-3">
    {{ t('account.ordersAndReturns.shippingSummary.heading') }}
  </div>
  <h2 class="font-medium text-base">{{ t('account.ordersAndReturns.shippingSummary.shipTo') }}</h2>
  <OrderAddressData v-if="shippingAddress" :address="shippingAddress" />

  <template v-if="shippingMethod">
    <h2 class="font-medium text-base mt-4">
      {{ t('account.ordersAndReturns.shippingSummary.shippingMethod') }}
    </h2>
    <p>{{ shippingMethod }}</p>
  </template>

  <template v-if="shippingDate">
    <h2 class="font-medium text-base mt-4" data-testid="gj-order-shipping-date-label">
      {{ t('account.ordersAndReturns.shippingDate') }}
    </h2>
    <p data-testid="gj-order-shipping-date">{{ shippingDate }}</p>
  </template>

  <OrderTracking :order="order" />

  <template v-if="preferredDeliveryServices">
    <h2 class="font-medium text-base mt-4">
      {{ t('PreferredDelivery.general.assistantName') }}
    </h2>

    <ul class="space-y-1">
      <li v-for="(serviceValue, serviceName, index) in preferredDeliveryServices" :key="index">
        {{ `${serviceName}: ${serviceValue}` }}
      </li>
    </ul>
  </template>

  <template v-if="orderContactWish">
    <h2 class="font-medium text-base mt-4">{{ t('checkout.fields.customerWish') }}</h2>
    <p>{{ orderContactWish }}</p>
  </template>

  <template v-if="orderCustomerSign">
    <h2 class="font-medium text-base mt-4">{{ t('checkout.fields.customerReference') }}</h2>
    <p>{{ orderCustomerSign }}</p>
  </template>
</template>

<script setup lang="ts">
/*
 * Copy of OrderShippingSummary (see COMPONENT_OVERRIDES in index.ts) with the shipping date of the order ("Lieferdatum",
 * as in "My orders") below the shipping method, before the tracking number. Only shown if PlentyONE has one. The rest
 * is the original; the contract test (upstreamContract.spec.ts) names what to adopt after an update.
 */
import { orderGetters } from '@plentymarkets/shop-api';
import type { OrderShippingSummaryPropsType } from '~/components/OrderShippingSummary/types';

const props = defineProps<OrderShippingSummaryPropsType>();
const { locale } = useI18n();

const shippingAddress = orderGetters.getShippingAddress(props.order);
const shippingMethod = orderGetters.getShippingProvider(props.order);
const shippingDate = computed(() => orderGetters.getShippingDate(props.order, locale.value));
const preferredDeliveryServices = orderGetters.getPreferredDeliveryServices(props.order);
const orderContactWish = orderGetters.getOrderContactWish(props.order);
const orderCustomerSign = orderGetters.getOrderCustomerSign(props.order);
</script>
