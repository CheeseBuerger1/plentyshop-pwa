<template>
  <div v-for="(additionalCost, index) in additionalCostsWithoutTax" :key="index" class="grid grid-cols-2">
    <p class="text-base">{{ orderGetters.getOrderItemOrderPropertyName(additionalCost) }}:</p>
    <p class="text-right">
      {{
        showNetPrices
          ? format(orderGetters.getOrderItemOrderPropertyNetSurcharge(additionalCost))
          : format(orderGetters.getOrderItemOrderPropertySurcharge(additionalCost))
      }}
    </p>
  </div>
  <UiDivider v-if="additionalCostsWithoutTax.length > 0" class="mt-2 mb-2" />
  <div class="grid grid-cols-2">
    <p class="font-medium text-base">{{ t('orderConfirmation.subTotal') }}:</p>
    <p v-if="showNetPrices" class="text-right">{{ format(order.totals.itemSumNet) }}</p>
    <p v-else class="text-right">{{ format(orderGetters.getSubTotal(order.totals)) }}</p>
  </div>
  <div class="grid grid-cols-2 mt-2">
    <p class="font-medium text-base">{{ t('orderConfirmation.shipping') }}:</p>
    <p v-if="showNetPrices" class="text-right">
      {{ getShippingAmount(orderGetters.getOriginalShippingCostNet(order)) }}
    </p>
    <p v-else class="text-right">{{ getShippingAmount(orderGetters.getOriginalShippingCost(order)) }}</p>
  </div>
  <div v-if="orderGetters.getCouponValue(order.totals) < 0" class="grid grid-cols-2 mt-2">
    <p class="font-medium text-base">{{ t('coupon.name') }}:</p>
    <p class="text-right">{{ format(orderGetters.getCouponValue(order.totals)) }}</p>
  </div>
  <div v-if="orderGetters.getRebateValue(order.totals, showNetPrices) > 0" class="grid grid-cols-2 mt-2">
    <p class="font-medium text-base">{{ t('order.rebate') }}:</p>
    <p class="text-right">{{ format(orderGetters.getRebateValue(order.totals, showNetPrices) * -1) }}</p>
  </div>
  <div v-for="(vat, index) in vatRows" :key="index" class="grid grid-cols-2 mt-2">
    <p class="font-medium text-base" data-testid="gj-order-vat-label">
      {{ getVatPrefix(vat) }}
      {{ t('orderConfirmation.vat') }} ({{ orderGetters.getOrderVatRate(vat) }}%):
    </p>
    <p class="text-right" data-testid="gj-order-vat-value">{{ format(orderGetters.getOrderVatValue(vat)) }}</p>
  </div>
  <UiDivider v-if="additionalCostsWithTax.length > 0" class="mt-2 mb-2" />
  <div v-for="(additionalCost, index) in additionalCostsWithTax" :key="index" class="grid grid-cols-2">
    <p class="text-base">{{ orderGetters.getOrderItemOrderPropertyName(additionalCost) }}:</p>
    <p class="text-right">
      {{
        showNetPrices
          ? format(orderGetters.getOrderItemOrderPropertyNetSurcharge(additionalCost))
          : format(orderGetters.getOrderItemOrderPropertySurcharge(additionalCost))
      }}
    </p>
  </div>
  <UiDivider class="mt-2 mb-2" />
  <div class="grid grid-cols-2">
    <p class="font-medium text-base" :class="{ 'font-bold text-xl': isOrderTypeOffer }">
      {{ t('orderConfirmation.total') }}:
    </p>
    <p class="text-right" :class="{ 'font-bold text-xl': isOrderTypeOffer }">
      {{
        showNetPrices ? format(orderGetters.getTotalNet(originalTotals)) : format(orderGetters.getTotal(originalTotals))
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
/*
 * Copy of OrderTotals (see COMPONENT_OVERRIDES in index.ts): "inkl." stands in front of "MwSt." on the left
 * ("inkl. MwSt. (19%): 3,55 EUR") instead of in front of the amount on the right. Orders without VAT (net orders, whose
 * data still holds a VAT amount that is not charged) show "MwSt. (0%): 0,00 EUR" instead of "exkl. 1,78 EUR". The rest is
 * the original; the contract test (upstreamContract.spec.ts) names what to adopt after an update.
 */
import { orderGetters, offerGetters } from '@plentymarkets/shop-api';
import type { OrderTotalsPropsType } from '~/components/OrderTotals/types';

const props = defineProps<OrderTotalsPropsType>();
const { formatWithSymbol } = usePriceFormatter();
const originalTotals = orderGetters.getTotals(props.order);
const currency = orderGetters.getCurrency(props.order);
const showNetPrices = originalTotals.isNet;

/** No VAT charged (net order, or no VAT in the data): one row "MwSt. (0%): 0,00 EUR" instead of "exkl." and an amount. */
const NO_VAT = { rate: 0, value: 0 };

const vatRows = computed(() => {
  const vats = showNetPrices ? [] : (orderGetters.getOriginalOrderVats(props.order) ?? []);
  return vats.length ? vats : [NO_VAT];
});

/** "inkl." in front of the label; a row without VAT (0%) has none. */
const getVatPrefix = (vat: { rate: number; value: number }) =>
  orderGetters.getOrderVatRate(vat) === 0 ? '' : t('orderProperties.vat.incl');

const format = (value: number) => {
  return formatWithSymbol(value, currency);
};

const getShippingAmount = (amount: number) => {
  return amount === 0 ? t('shipping.method.free') : formatWithSymbol(Number(amount), currency);
};

const isOrderTypeOffer = offerGetters.isTypeOffer(props.order);
const additionalCostsWithoutTax = orderGetters.getAdditionalCostsWithTax(props.order);
const additionalCostsWithTax = orderGetters.getAdditionalCostsWithoutTax(props.order);
</script>
