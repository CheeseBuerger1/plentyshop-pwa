/** Which of the two address forms of the checkout, see addressFormCopy.ts. */
export type AddressFormKind = 'Shipping' | 'Billing';

/** One copy of an original: its file in the module's runtime and how it is made from the original. */
export interface ModuleCopy {
  /** Path below `modules/glas-jena/runtime/`. */
  file: string;
  /** Path of the original below `app/`. */
  original: string;
  make: (original: string) => string;
}
