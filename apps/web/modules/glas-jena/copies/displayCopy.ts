/**
 * How the module's copies of the order address and of the checkout's contact information come from the originals,
 * see addressFormCopy.ts (split off because of the maximum length of a file, ESLint `max-lines`).
 */
import { replaceOnce } from './addressFormCopy';

/**
 * The module's copy of the order address (GlasJenaOrderAddressData.vue from components/OrderAddressData/
 * OrderAddressData.vue, without the copy's header comment): address line 2 and state are passed on to the display,
 * the original drops them.
 */
export const toModuleOrderAddressData = (original: string) => {
  let copy = original.replace(/\r\n/g, '\n');
  copy = replaceOnce(
    copy,
    `import type { OrderAddressDataPropsType } from './types';\n`,
    `import type { OrderAddressDataPropsType } from '~/components/OrderAddressData/types';\n`,
  );
  return replaceOnce(
    copy,
    `    apartment: address.address2,\n`,
    `    apartment: address.address2,\n` +
      `    additionalAddressInformation: address.address3,\n` +
      `    state: address.stateId?.toString(),\n`,
  );
};

/**
 * The module's copy of the contact information of the checkout (GlasJenaContactInformation.vue from
 * components/ContactInformation/ContactInformation.vue, without the copy's header comment): the e-mail field marked
 * as required for screen readers too (`aria-required`, wish of the shop owner, 2026-11-03); the star alone is only
 * read as "star".
 */
export const toModuleContactInformation = (original: string) => {
  let copy = original.replace(/\r\n/g, '\n');
  copy = replaceOnce(
    copy,
    `import type { ContactInformationProps } from './types';\n`,
    `import type { ContactInformationProps } from '~/components/ContactInformation/types';\n`,
  );
  return replaceOnce(
    copy,
    `          name="customerEmail"\n          type="email"\n`,
    `          name="customerEmail"\n          aria-required="true"\n          type="email"\n`,
  );
};
