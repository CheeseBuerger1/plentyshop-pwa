/** Consent type of Google's consent mode that the banner choice switches, see googleTagManager.ts. */
export type ConsentType = 'ad_storage' | 'ad_user_data' | 'ad_personalization' | 'analytics_storage';

export type ConsentState = Record<ConsentType, 'granted' | 'denied'>;

/** The `gtag` command function: pushes its `arguments` object into the data layer. */
export type Gtag = (...args: unknown[]) => void;

/**
 * The globals of the head script (the shop declares `window.dataLayer` with gtag-only types); `glasJenaLoadGtm` loads
 * the container once, see googleTagManager.ts.
 */
export type GtagWindow = { dataLayer?: unknown[]; gtag?: Gtag; glasJenaLoadGtm?: () => void };

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

/** The parts of the shop's Product JSON-LD that completeProductJsonLd reads and completes (merchantPolicies.ts). */
export type ProductJsonLd = {
  '@type'?: string;
  weight?: QuantityJsonLd;
  depth?: QuantityJsonLd;
  width?: QuantityJsonLd;
  height?: QuantityJsonLd;
  offers?: OfferJsonLd | OfferJsonLd[];
};
export type QuantityJsonLd = { '@type'?: string; value?: number; unitCode?: string; unitText?: string };
export type OfferJsonLd = { price?: number; [property: string]: unknown };

/** The shop for search engines: its name, home page and logo (absolute or relative to the home page). */
export type OrganizationEntry = { name: string; url: string; logo?: string; freeShippingFrom?: number | null };

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

/**
 * Address form of a country of delivery, see addressFormats.ts and docs/adressformate.md: A the German form (DE, AT,
 * CH, NL), B number behind the street, C number in front of the street, D area-based (postal code, prefecture and
 * town first), E all other countries.
 */
export type AddressGroup = 'A' | 'B' | 'C' | 'D' | 'E';

/** Whether a field of the address form is shown, and whether it has to be filled. */
export type AddressFieldRule = 'required' | 'optional' | 'none';

/** Label of the postal code field: the usual word of the country within German and English. */
export type PostalCodeLabel = 'postalCode' | 'zipCode' | 'postcode' | 'eircode';

/** Label of the state field (PlentyONE `stateId`). */
export type StateLabel = 'state' | 'province' | 'prefecture' | 'region';

/** The address form of one country, see getAddressFormat in addressFormats.ts. */
export interface AddressFormat {
  group: AddressGroup;
  /** One address line without house number (PlentyONE's English form, GB only). */
  singleLine: boolean;
  postalCode: AddressFieldRule;
  state: AddressFieldRule;
  postalCodeLabel: PostalCodeLabel;
  stateLabel: StateLabel;
  /** Label key of the house number ("block" in Japan). */
  houseNumberLabel: string;
  /** States listed by their abbreviation (US, CA, AU). */
  stateCodes: boolean;
}

/**
 * A row of the address part, see getAddressRows in addressFormats.ts: one field in the form's columns, or street and
 * house number together with the number narrow (in front of the street in group C).
 */
export interface AddressFieldRow {
  key: string;
  fields: AddressFieldSlot[];
  numberFirst: boolean;
}

/** A state of PlentyONE's list of a country (`states` of the shop's countries). */
export interface AddressState {
  id: number;
  name: string;
  isoCode3166?: string | null;
}

/** One choice of the state field. */
export interface AddressStateOption {
  value: string;
  label: string;
}

/** What getAddressFormat needs of a country of the shop (ActiveShippingCountry or GeoRegulatedCountry). */
export type AddressCountry = { isoCode2?: string | null; states?: unknown[] | null } | null | undefined;

/** Field names of the address part of the forms (those of the shop's `Address`). */
export type AddressFieldName =
  'streetName' | 'apartment' | 'additionalAddressInformation' | 'zipCode' | 'city' | 'state' | 'phoneNumber';

/** One field of the address part in the order of the country's form, see getAddressFields in addressFormats.ts. */
export interface AddressFieldSlot {
  name: AddressFieldName;
  /** Key of the label in GlasJenaAddressFields.vue (the field's words differ per group and country). */
  label: string;
  required: boolean;
  /** Columns in the forms' grid `@md:grid-cols-[50%_1fr_120px]`. */
  span: 1 | 2 | 3;
}

/** A value of an address field: text, or a number (the account's getter gives the house number as one). */
export type AddressValue = string | number | null | undefined;
