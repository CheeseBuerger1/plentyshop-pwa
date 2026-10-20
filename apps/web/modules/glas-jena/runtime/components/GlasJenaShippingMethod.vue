<!--
  Shipping methods of the checkout (replaces ShippingMethod, see COMPONENT_OVERRIDES). Copy of the original with three
  changes (wishes of the shop owner, 2026-10-20):
  - each method with the logo of its parcel service, like the LTS shop (GlasJenaShippingMethodLogo.vue);
  - the price on one line: after a long name ("POST - Warenpost International") the "€" wrapped onto a line of its own;
  - the methods are fetched again when the articles change, which the checkout's article lines allow: a cart reduced to
    one light article kept showing only DHL (useGlasJenaShippingRefresh, as on the cart page).
-->
<template>
  <div data-testid="shipping-method" class="@md:px-4 my-6">
    <h3 class="text-neutral-900 text-lg font-bold">{{ t('shipping.method.heading') }}</h3>
    <div v-if="hasCheckoutAddress">
      <div v-if="!loading" class="mt-4">
        <ul
          v-if="shippingMethods && shippingMethods.length > 0"
          class="grid gap-y-4 @md:grid-cols-2 @md:gap-x-4"
          role="radiogroup"
          data-testid="shipping-method-list"
        >
          <SfListItem
            v-for="(method, index) in shippingMethods"
            :key="`shipping-method-${index}`"
            :disabled="disabled"
            tag="label"
            children-tag="div"
            class="border rounded-md items-start select-none"
            @click.prevent="updateShippingMethod(shippingProviderGetters.getParcelServicePresetId(method))"
          >
            <template #prefix>
              <SfRadio
                v-model="radioModel"
                :checked="
                  shippingProviderGetters.getShippingProfileId(cart).toString() ===
                  shippingProviderGetters.getParcelServicePresetId(method)
                "
                :value="shippingProviderGetters.getParcelServicePresetId(method)"
                class="flex items-center"
              />
            </template>
            <GlasJenaShippingMethodLogo :method="method" class="mb-2" />
            <div class="flex items-center flex-row gap-2">
              <span>{{ shippingProviderGetters.getShippingMethodName(method) }}</span>
              <span class="ml-auto whitespace-nowrap" data-testid="gj-shipping-method-amount">{{
                getShippingAmount(shippingProviderGetters.getShippingAmount(method))
              }}</span>
            </div>
            <div v-if="getDeliveryDays(shippingProviderGetters.getParcelServicePresetId(method))">
              <span class="text-sm">
                {{
                  t('shipping.method.maxDeliveryDays', {
                    days: getDeliveryDays(shippingProviderGetters.getParcelServicePresetId(method)),
                  })
                }}</span
              >
            </div>
          </SfListItem>
        </ul>

        <div
          v-else
          class="flex items-start bg-warning-100 shadow-md pr-2 pl-4 ring-1 ring-warning-200 typography-text-sm @md:typography-text-base py-1 rounded-md"
          data-testid="no-shipping-method-available"
        >
          <SfIconWarning class="mt-2 mr-2 text-warning-700 shrink-0" />
          <div class="py-2 mr-2">
            {{ t('shipping.method.noMethodsAvailable') }}
          </div>
        </div>
      </div>
      <ShippingMethodSkeleton v-else />

      <ShippingPrivacy v-if="showShippingPrivacy" />
    </div>
    <div
      v-else
      data-testid="shipping-method-no-address-set"
      class="mt-4 bg-gray-200 shadow-md p-4 ring-1 ring-gray-300 text-gray-700 typography-text-sm @md:typography-text-base rounded-md"
    >
      {{ t('shipping.noShippingMethodsNoAddress') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { AddressType, shippingProviderGetters, cartGetters } from '@plentymarkets/shop-api';
import { SfIconWarning, SfListItem, SfRadio } from '@storefront-ui/vue';
import type { CheckoutShippingEmits, ShippingMethodProps } from '~/components/ShippingMethod/types';
import { useGlasJenaShippingRefresh } from '../composables/useGlasJenaShippingRefresh';
import GlasJenaShippingMethodLogo from './GlasJenaShippingMethodLogo.vue';

const { disabled = false, loading = false } = defineProps<ShippingMethodProps>();
const { hasCheckoutAddress } = useCheckoutAddress(AddressType.Shipping);
const emit = defineEmits<CheckoutShippingEmits>();

const { data: cart } = useCart();
const { format } = usePriceFormatter();
const { selectedMethod } = useCartShippingMethods();
const { shippingMethods } = useCheckoutPagePaymentAndShipping();
const radioModel = ref(shippingProviderGetters.getShippingProfileId(cart.value));

/* Like the checkout page, which fetches the shipping methods only once there is an address */
useGlasJenaShippingRefresh(() => hasCheckoutAddress.value);

const showShippingPrivacy = computed(
  () =>
    shippingMethods.value.length > 0 &&
    selectedMethod.value &&
    shippingProviderGetters.getDataPrivacyAgreementHint(selectedMethod.value),
);

const getDeliveryDays = (method: string) => {
  return cartGetters.getMaxDeliveryDays(cart.value, Number(method));
};

const updateShippingMethod = (shippingId: string) => {
  if (disabled) {
    return;
  }
  radioModel.value = shippingId;
  emit('update:shippingMethod', radioModel.value);
};

const getShippingAmount = (amount: string) => {
  return amount === '0' ? t('shipping.method.free') : format(Number(amount));
};
</script>
