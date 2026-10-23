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

/**
 * Storage for the flag per tracked order (localStorage) and the shipping methods last seen (sessionStorage, see
 * cartShipping.ts), or a stand-in in tests.
 */
export type FlagStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** One line of the category list beside the subcategory tiles (the tree flattened to the open lines). */
export type CategorySidebarRow = {
  category: import('@plentymarkets/shop-api').CategoryTreeItem;
  /** 0 = main category */
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
};

/** One line of "Weitere Details" (GlasJenaItemDetails), see itemDetails.ts. */
export type ItemDetailKey = 'itemNumber' | 'content' | 'dimensions' | 'availability' | 'manufacturer';

export type ItemDetailRow = {
  key: ItemDetailKey;
  /** The value, one entry per line (the manufacturer's address has several). */
  lines: string[];
  /** The manufacturer's website, shown as a link below the lines. */
  url?: string;
};

/** Country as the item search delivers it with the manufacturer (`countryObject`, not in the shop's types). */
export type ManufacturerCountry = {
  name?: string;
  names?: { language?: string; name?: string }[];
};

/** Manufacturer of an item with the country object the API delivers in addition. */
export type ManufacturerWithCountry = {
  name?: string;
  externalName?: string;
  street?: string;
  houseNo?: string;
  postcode?: string;
  town?: string;
  url?: string;
  country?: ManufacturerCountry;
  countryObject?: ManufacturerCountry;
};

/** Open Graph tags of an item page, see seo.ts; `undefined` keeps the shop's default. */
export type ProductOpenGraph = {
  type: 'product';
  title?: string;
  description?: string;
  image?: string;
  priceAmount?: string;
  priceCurrency?: string;
};

/** One entry of the breadcrumbs for search engines: its name and its absolute address. */
export type BreadcrumbListEntry = { name: string; url: string };

/** The parts of a head tag (unhead `HeadTag`) that seo.ts reads and changes. */
export type SeoHeadTag = {
  tag: string;
  key?: string;
  props: Record<string, unknown>;
  innerHTML?: string;
};

/** A logo of the shop for a shipping profile, see shippingLogos.ts: the image and the parcel service it shows. */
export interface ShippingMethodLogo {
  src: string;
  label: string;
}

/** New address of a moved LTS content page per language prefix, `default` for all others, see ltsRedirect.ts. */
export type LtsMovedPage = { default: string } & Partial<Record<string, string>>;

/**
 * Target of an old LTS address, see ltsRedirect.ts: PWA path without language prefix, the language prefix of the old
 * address (not yet checked against the shop's languages) and the query to send along.
 */
export interface LtsRedirect {
  locale?: string;
  path: string;
  query: Record<string, unknown>;
}
