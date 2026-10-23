import type { Ref } from 'vue';
import type { ShippingMethod } from '@plentymarkets/shop-api';
import { shippingProviderGetters } from '@plentymarkets/shop-api';
import {
  getShippingChoiceKey,
  getShippingPreselection,
  readShippingChoiceKey,
  writeShippingChoiceKey,
} from '../utils/cartShipping';
import type { FlagStorage } from '../utils/types';

const getSessionStorage = (): FlagStorage | undefined => {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

/**
 * Chooses the cheapest shipping method whenever the methods on offer change, see getShippingPreselection in
 * utils/cartShipping.ts: in the cart (GlasJenaCartShipping.vue) and the checkout (GlasJenaShippingMethod.vue).
 *
 * `methods`: the shipping methods shown; `select`: saves a method like a click on its tile; `when`: choose only if it
 * returns true (the checkout shows shipping methods only once there is an address, and not while it loads or is busy);
 * checked again when it changes. Watches
 * the country of the cart as well: the checkout fetches the cart and the methods at the same time after a new address.
 * Only in the browser. Call it in the setup of a component before any `await`, so the watcher stops with it.
 */
export const useGlasJenaShippingPreselect = (
  methods: Ref<ShippingMethod[]>,
  select: (shippingMethodId: string) => unknown,
  when: () => boolean = () => true,
) => {
  if (import.meta.server) {
    return;
  }
  const { data: cart } = useCart();
  const countryId = computed(() => cart.value?.shippingCountryId);

  watch(
    [methods, countryId, when],
    async ([list, country, active]) => {
      if (!active || list.length === 0) {
        return;
      }
      const storage = getSessionStorage();
      const key = getShippingChoiceKey(country, list);
      const selectedId = String(shippingProviderGetters.getShippingProfileId(cart.value));
      const preselection = getShippingPreselection(key, readShippingChoiceKey(storage), list, selectedId);
      writeShippingChoiceKey(storage, key);
      if (preselection) {
        await select(preselection);
      }
    },
    { immediate: true },
  );
};
