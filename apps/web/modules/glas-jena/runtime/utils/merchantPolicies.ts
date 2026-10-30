import type { MerchantReturnPolicy, OfferShippingDetails, ShippingConditions, ShippingService } from 'schema-dts';
import { safeSerializeJsonLd } from '~/utils/jsonLdHelper';
import type { ProductJsonLd } from './types';

/*
 * Shipping and returns of the shop for search engines: for the whole shop in the Organization JSON-LD (see
 * getOrganizationJsonLd) and for each item in the offer of its Product JSON-LD (see completeProductJsonLd; the Rich
 * Results Test and the Search Console only look there). Copied from PlentyONE and the shop pages "Versand" and
 * "Widerrufsbelehrung" (checked 2026-10-29 with guest baskets): when the shipping costs in PlentyONE change, change
 * them here too.
 */

const CURRENCY = 'EUR';

/** DHL parcel within Germany by the gross weight of the parcel, up to kilograms (Google takes whole kilograms only) */
export const SHIPPING_RATES_DE = [
  { maxKg: 1, rate: 7.8 },
  { maxKg: 3, rate: 8.5 },
  { maxKg: 5, rate: 9.8 },
  { maxKg: 10, rate: 12.5 },
  { maxKg: 31.5, rate: 23.8 },
];

/** Orders from this item value on are shipped free within Germany (150.00 € is free already), unless the editor says else */
export const FREE_SHIPPING_DE_DEFAULT = 150;

/** Editor setting (Checkout » Other settings » Free Shipping) with the limit of free shipping within Germany */
export const FREE_SHIPPING_FROM_SETTING = 'glasJenaFreeShippingFrom';

/**
 * The limit of free shipping within Germany from the editor setting: the default while the setting is empty or not a
 * number, null (no free shipping) for 0 or less.
 * @example toFreeShippingFrom('') // 150
 * @example toFreeShippingFrom('200') // 200
 * @example toFreeShippingFrom('0') // null
 */
export const toFreeShippingFrom = (value: unknown) => {
  const limit = value === '' || value === null || value === undefined ? Number.NaN : Number(value);
  if (Number.isNaN(limit)) {
    return FREE_SHIPPING_DE_DEFAULT;
  }
  return limit > 0 ? limit : null;
};

/** Shipped within 3 working days after payment ("Versand"), DHL takes 1–2 days */
const HANDLING_DAYS = { minValue: 0, maxValue: 3 };
const TRANSIT_DAYS = { minValue: 1, maxValue: 2 };

/** Withdrawal within 14 days, the customer pays the return shipping ("Widerrufsbelehrung") */
const RETURN_DAYS = 14;

/** The countries of the return policy (EU, EEA, Switzerland, United Kingdom); Google takes up to 50 */
export const RETURN_COUNTRIES = [
  'DE',
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
  'IS',
  'LI',
  'NO',
  'CH',
  'GB',
];

const toGermany = { '@type': 'DefinedRegion', addressCountry: 'DE' } as const;
const amount = (value: number) => ({ '@type': 'MonetaryAmount', value, currency: CURRENCY }) as const;
const transitTime = {
  '@type': 'ServicePeriod',
  duration: { '@type': 'QuantitativeValue', ...TRANSIT_DAYS, unitCode: 'DAY' },
} as const;

/**
 * Shipping within Germany. Where several conditions apply Google takes the lowest rate, so the weight ranges may share
 * their limits (exactly 1 kg costs 7.80 €) and the free shipping (from `freeFrom`, none for null) needs no upper
 * weight. No conditions for other countries: their rates depend on the country, the shop shows them in the checkout.
 */
export const getShippingServiceJsonLd = (freeFrom: number | null = FREE_SHIPPING_DE_DEFAULT): ShippingService => ({
  '@type': 'ShippingService',
  fulfillmentType: 'https://schema.org/FulfillmentTypeDelivery',
  handlingTime: {
    '@type': 'ServicePeriod',
    duration: { '@type': 'QuantitativeValue', ...HANDLING_DAYS, unitCode: 'DAY' },
    businessDays: [
      'https://schema.org/Monday',
      'https://schema.org/Tuesday',
      'https://schema.org/Wednesday',
      'https://schema.org/Thursday',
      'https://schema.org/Friday',
    ],
  },
  shippingConditions: [
    ...SHIPPING_RATES_DE.map(({ maxKg, rate }, index): ShippingConditions => ({
      '@type': 'ShippingConditions',
      shippingDestination: toGermany,
      weight: {
        '@type': 'QuantitativeValue',
        minValue: SHIPPING_RATES_DE[index - 1]?.maxKg ?? 0,
        maxValue: Math.floor(maxKg),
        unitCode: 'KGM',
      },
      shippingRate: amount(rate),
      transitTime,
    })),
    ...(freeFrom === null
      ? []
      : [
          {
            '@type': 'ShippingConditions',
            shippingDestination: toGermany,
            orderValue: { '@type': 'MonetaryAmount', minValue: freeFrom, currency: CURRENCY },
            shippingRate: amount(0),
            transitTime,
          } as const,
        ]),
  ],
});

/** Return within 14 days in any way (no `returnMethod`), at the customer's cost, everything paid is refunded */
export const getMerchantReturnPolicyJsonLd = (): MerchantReturnPolicy => ({
  '@type': 'MerchantReturnPolicy',
  applicableCountry: RETURN_COUNTRIES,
  returnPolicyCountry: 'DE',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: RETURN_DAYS,
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  refundType: 'https://schema.org/FullRefund',
});

/**
 * The DHL rate within Germany for one item alone, like in the table above: free from `freeFrom` (none for null),
 * otherwise by the gross weight of the variation in grams; undefined without a weight or above the table.
 */
export const getShippingRateDE = (
  weightG: number,
  price: number,
  freeFrom: number | null = FREE_SHIPPING_DE_DEFAULT,
) => {
  if (freeFrom !== null && price >= freeFrom) {
    return 0;
  }
  if (!(weightG > 0)) {
    return undefined;
  }
  return SHIPPING_RATES_DE.find(({ maxKg }) => weightG <= maxKg * 1000)?.rate;
};

/** Shipping of one item within Germany for its offer */
export const getOfferShippingDetailsJsonLd = (rate: number): OfferShippingDetails => ({
  '@type': 'OfferShippingDetails',
  shippingRate: amount(rate),
  shippingDestination: toGermany,
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', ...HANDLING_DAYS, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', ...TRANSIT_DAYS, unitCode: 'DAY' },
  },
});

const PRODUCT_JSON_LD_RE = /"@type"\s*:\s*"Product"/;

/** UN/CEFACT code of grams: the shop gives the weight of the variation in grams but without a unit */
const GRAM_UNIT_CODE = 'GRM';

/**
 * The shop's Product JSON-LD (useStructuredData.ts, serialized) with shipping and returns in its offer and the unit of
 * its weight: the shop builds them itself, so the module completes the resolved head tag. Without the unit Google has
 * no shipping weight for the weight ranges of the shipping (Merchant Center "missing shipping weight", 2026-10-29).
 * The rate comes from the weight and the price of the JSON-LD (gross weight of the variation in grams, price of the
 * offer), free from `freeFrom` (see getShippingRateDE). Other JSON-LD stays as it is.
 */
export const completeProductJsonLd = (jsonLd: string, freeFrom: number | null = FREE_SHIPPING_DE_DEFAULT) => {
  if (!PRODUCT_JSON_LD_RE.test(jsonLd)) {
    return jsonLd;
  }
  const product = JSON.parse(jsonLd) as ProductJsonLd;
  if (product['@type'] !== 'Product' || !product.offers) {
    return jsonLd;
  }

  const weightG = Number(product.weight?.value);
  if (product.weight && weightG > 0 && !product.weight.unitCode) {
    product.weight.unitCode = GRAM_UNIT_CODE;
  }
  for (const offer of [product.offers].flat()) {
    const rate = getShippingRateDE(weightG, Number(offer.price), freeFrom);
    if (rate !== undefined) {
      offer.shippingDetails = getOfferShippingDetailsJsonLd(rate);
    }
    offer.hasMerchantReturnPolicy = getMerchantReturnPolicyJsonLd();
  }
  return safeSerializeJsonLd(product, 4);
};
