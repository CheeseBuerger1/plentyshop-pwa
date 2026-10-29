import type { MerchantReturnPolicy, ShippingConditions, ShippingService } from 'schema-dts';

/*
 * Shipping and returns of the shop for search engines (Organization JSON-LD, see getOrganizationJsonLd). Google takes
 * them for the offers of all item pages, so the items need no `shippingDetails` / `hasMerchantReturnPolicy` of their
 * own. Copied from PlentyONE and the shop pages "Versand" and "Widerrufsbelehrung" (checked 2026-10-29 with guest
 * baskets): when the shipping costs in PlentyONE change, change them here too.
 */

const CURRENCY = 'EUR';

/** DHL parcel within Germany by the gross weight of the parcel, up to kilograms */
export const SHIPPING_RATES_DE = [
  { maxKg: 1, rate: 7.8 },
  { maxKg: 3, rate: 8.5 },
  { maxKg: 5, rate: 9.8 },
  { maxKg: 10, rate: 12.5 },
  { maxKg: 31.5, rate: 23.8 },
];

/** Orders from this item value on are shipped free within Germany (150.00 € is free already) */
export const FREE_SHIPPING_DE_FROM = 150;

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
 * their limits (exactly 1 kg costs 7.80 €) and the free shipping needs no upper weight. No conditions for other
 * countries: their rates depend on the country, the shop shows them in the checkout.
 */
export const getShippingServiceJsonLd = (): ShippingService => ({
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
        maxValue: maxKg,
        unitCode: 'KGM',
      },
      shippingRate: amount(rate),
      transitTime,
    })),
    {
      '@type': 'ShippingConditions',
      shippingDestination: toGermany,
      orderValue: { '@type': 'MonetaryAmount', minValue: FREE_SHIPPING_DE_FROM, currency: CURRENCY },
      shippingRate: amount(0),
      transitTime,
    },
  ],
});

/** Return within 14 days in any way (no `returnMethod`), at the customer's cost */
export const getMerchantReturnPolicyJsonLd = (): MerchantReturnPolicy => ({
  '@type': 'MerchantReturnPolicy',
  applicableCountry: RETURN_COUNTRIES,
  returnPolicyCountry: 'DE',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: RETURN_DAYS,
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
});
