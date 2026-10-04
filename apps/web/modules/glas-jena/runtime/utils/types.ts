/** Consent type of Google's consent mode that the banner choice switches, see googleTagManager.ts. */
export type ConsentType = 'ad_storage' | 'ad_user_data' | 'ad_personalization' | 'analytics_storage';

export type ConsentState = Record<ConsentType, 'granted' | 'denied'>;

/** The `gtag` command function: pushes its `arguments` object into the data layer. */
export type Gtag = (...args: unknown[]) => void;

/** The globals of the head script (the shop declares `window.dataLayer` with gtag-only types). */
export type GtagWindow = { dataLayer?: unknown[]; gtag?: Gtag };

/** The `purchase` event in the data layer, see purchaseTracking.ts. */
export interface PurchaseEvent {
  event: 'purchase';
  ecommerce: {
    transaction_id: string;
    value: number;
    currency: string;
  };
  user_data?: {
    email: string;
  };
}

/** Address of an order with its options (type 5 is the e-mail address). */
export type AddressWithOptions = { options?: { typeId?: number; value?: string }[] } | null | undefined;

/** Storage for the flag per tracked order (localStorage, or a stand-in in tests). */
export type FlagStorage = Pick<Storage, 'getItem' | 'setItem'>;
