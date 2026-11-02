import {
  toModuleAccountAddressForm,
  toModuleAddressForm,
  toModuleRegisterForm,
  toModuleRegisterPage,
} from './addressFormCopy';
import { toModuleContactInformation, toModuleOrderAddressData } from './displayCopy';
import type { ModuleCopy } from './types';

/**
 * The module's copies of original files and how each is made from its original (the address forms per country, see
 * docs/adressformate.md). upstreamContractAddress.spec.ts checks every copy against its original; after an update of
 * the shop, `npx jiti modules/glas-jena/copies/generate.ts` (in apps/web) makes them again.
 */
export const MODULE_COPIES: ModuleCopy[] = [
  {
    file: 'components/GlasJenaAddressFormShipping.vue',
    original: 'components/AddressFormShipping/AddressFormShipping.vue',
    make: (original) => toModuleAddressForm(original, 'Shipping'),
  },
  {
    file: 'components/GlasJenaAddressFormBilling.vue',
    original: 'components/AddressFormBilling/AddressFormBilling.vue',
    make: (original) => toModuleAddressForm(original, 'Billing'),
  },
  {
    file: 'components/GlasJenaAddressForm.vue',
    original: 'components/AddressForm/AddressForm.vue',
    make: toModuleAccountAddressForm,
  },
  {
    file: 'components/GlasJenaOrderAddressData.vue',
    original: 'components/OrderAddressData/OrderAddressData.vue',
    make: toModuleOrderAddressData,
  },
  {
    file: 'components/GlasJenaContactInformation.vue',
    original: 'components/ContactInformation/ContactInformation.vue',
    make: toModuleContactInformation,
  },
  { file: 'pages/GlasJenaRegister.vue', original: 'pages/register.vue', make: toModuleRegisterPage },
  {
    file: 'composables/useGlasJenaRegisterForm.ts',
    original: 'composables/useRegisterForm/useRegisterForm.ts',
    make: toModuleRegisterForm,
  },
];

/** The header comment of a copy (kept when the copy is made again). */
export const getCopyHeader = (copy: string) =>
  copy.replace(/\r\n/g, '\n').match(/^(<!--[\s\S]*?-->\n|\/\*[\s\S]*?\*\/\n)/)?.[0] ?? '';
