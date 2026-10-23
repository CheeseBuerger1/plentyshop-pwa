<!--
  Shipping methods of the checkout (replaces ShippingMethod, see COMPONENT_OVERRIDES). Copy of the original with three
  changes (wishes of the shop owner, 2026-10-20 and 2026-10-23):
  - the methods as tiles like the payment methods below, with the logo of the parcel service like the LTS shop and the
    price on one line (GlasJenaShippingMethodTile.vue) instead of list items with radio buttons;
  - the methods are fetched again when the articles change, which the checkout's article lines allow: a cart reduced to
    one light article kept showing only DHL (useGlasJenaShippingRefresh, as on the cart page);
  - the cheapest method is chosen when the methods on offer change, e.g. after an address abroad: PlentyONE kept DHL
    (useGlasJenaShippingPreselect, as on the cart page).
-->
<template>
  <div data-testid="shipping-method" class="@md:px-4 my-6">
    <h3 class="text-neutral-900 text-lg font-bold">{{ t('shipping.method.heading') }}</h3>
    <div v-if="hasCheckoutAddress">
      <div v-if="!loading" class="mt-4">
        <div
          v-if="shippingMethods && shippingMethods.length > 0"
          class="grid gap-4 @md:grid-cols-2"
          role="radiogroup"
          :aria-label="t('shipping.method.heading')"
          data-testid="shipping-method-list"
        >
          <GlasJenaShippingMethodTile
            v-for="(method, index) in shippingMethods"
            :key="`shipping-method-${index}`"
            :method="method"
            group="shipping_method"
            :checked="
              shippingProviderGetters.getShippingProfileId(cart).toString() ===
              shippingProviderGetters.getParcelServicePresetId(method)
            "
            :disabled="disabled"
            :amount="getShippingAmount(shippingProviderGetters.getShippingAmount(method))"
            :delivery-days="getDeliveryDaysText(shippingProviderGetters.getParcelServicePresetId(method))"
            @select="updateShippingMethod"
          />
        </div>

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
import { SfIconWarning } from '@storefront-ui/vue';
import type { CheckoutShippingEmits, ShippingMethodProps } from '~/components/ShippingMethod/types';
import { useGlasJenaShippingPreselect } from '../composables/useGlasJenaShippingPreselect';
import { useGlasJenaShippingRefresh } from '../composables/useGlasJenaShippingRefresh';
import GlasJenaShippingMethodTile from './GlasJenaShippingMethodTile.vue';
import { formatShippingAmount } from '../utils/shippingAmount';

const { disabled = false, loading = false } = defineProps<ShippingMethodProps>();
const { hasCheckoutAddress } = useCheckoutAddress(AddressType.Shipping);
const emit = defineEmits<CheckoutShippingEmits>();

const { data: cart } = useCart();
const { format } = usePriceFormatter();
const { selectedMethod } = useCartShippingMethods();
const { shippingMethods } = useCheckoutPagePaymentAndShipping();

/* Like the checkout page, which fetches the shipping methods only once there is an address */
useGlasJenaShippingRefresh(() => hasCheckoutAddress.value);

const showShippingPrivacy = computed(
  () =>
    shippingMethods.value.length > 0 &&
    selectedMethod.value &&
    shippingProviderGetters.getDataPrivacyAgreementHint(selectedMethod.value),
);

const getDeliveryDaysText = (method: string) => {
  const days = cartGetters.getMaxDeliveryDays(cart.value, Number(method));
  return days ? t('shipping.method.maxDeliveryDays', { days }) : undefined;
};

const updateShippingMethod = (shippingId: string) => {
  if (disabled) {
    return;
  }
  emit('update:shippingMethod', shippingId);
};

/*
 * The cheapest method when the methods on offer change, through the checkout page like a click on a tile; not while
 * the page loads or is busy (the read-only checkout is always `disabled`)
 */
useGlasJenaShippingPreselect(
  shippingMethods,
  updateShippingMethod,
  () => hasCheckoutAddress.value && !loading && !disabled,
);

const getShippingAmount = (amount: string) => formatShippingAmount(amount, t('shipping.method.free'), format);
</script>
