import type { ShippingConditions } from 'schema-dts';
import {
  RETURN_COUNTRIES,
  getMerchantReturnPolicyJsonLd,
  getShippingRateDE,
  getShippingServiceJsonLd,
  completeProductJsonLd,
} from '../merchantPolicies';

type Range = { minValue?: number; maxValue?: number };

const inRange = (range: Range | undefined, value: number) =>
  !range || ((range.minValue ?? -Infinity) <= value && value <= (range.maxValue ?? Infinity));

/** The rate Google takes for one parcel: the lowest of all conditions that apply, undefined without any */
const rateFor = (country: string, kg: number, orderValue: number) => {
  const conditions = getShippingServiceJsonLd().shippingConditions as Exclude<ShippingConditions, string>[];
  const rates = conditions
    .filter((condition) => (condition.shippingDestination as { addressCountry: string }).addressCountry === country)
    .filter((condition) => inRange(condition.weight as Range, kg) && inRange(condition.orderValue as Range, orderValue))
    .map((condition) => (condition.shippingRate as { value: number }).value);

  return rates.length > 0 ? Math.min(...rates) : undefined;
};

describe('merchantPolicies', () => {
  it('should charge the DHL rates of the shop within Germany by the weight of the parcel', () => {
    /* Guest basket 2026-10-29: dish 2l (variation 1623, 1.1 kg) 8.50 € */
    expect(rateFor('DE', 0.4, 21.9)).toBe(7.8);
    expect(rateFor('DE', 1, 21.9)).toBe(7.8);
    expect(rateFor('DE', 1.1, 27.9)).toBe(8.5);
    expect(rateFor('DE', 4, 60)).toBe(9.8);
    expect(rateFor('DE', 8, 60)).toBe(12.5);
    /* Google takes whole kilograms only, the last range ends at 31 instead of 31.5 kg */
    expect(rateFor('DE', 31, 60)).toBe(23.8);
  });

  it('should ship free within Germany from 150 € on', () => {
    expect(rateFor('DE', 2, 149.99)).toBe(8.5);
    expect(rateFor('DE', 2, 150)).toBe(0);
    expect(rateFor('DE', 40, 300)).toBe(0);
  });

  it('should give no shipping for other countries', () => {
    expect(rateFor('AT', 1, 21.9)).toBeUndefined();
    expect(rateFor('AT', 1, 200)).toBeUndefined();
  });

  it('should take back items within 14 days at the customer cost, in any way', () => {
    const policy = getMerchantReturnPolicyJsonLd();

    expect(policy).toMatchObject({
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 14,
      returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      returnPolicyCountry: 'DE',
      refundType: 'https://schema.org/FullRefund',
    });
    expect(policy).not.toHaveProperty('returnMethod');
  });

  it('should name each return country once and no more than Google takes', () => {
    expect(new Set(RETURN_COUNTRIES).size).toBe(RETURN_COUNTRIES.length);
    expect(RETURN_COUNTRIES.length).toBeLessThanOrEqual(50);
    expect(RETURN_COUNTRIES).toContain('DE');
  });

  it('should give the rate of one item alone by its weight in grams and its price', () => {
    expect(getShippingRateDE(1100, 27.9)).toBe(8.5);
    expect(getShippingRateDE(1000, 21.9)).toBe(7.8);
    expect(getShippingRateDE(4200, 149.99)).toBe(9.8);
    expect(getShippingRateDE(4200, 150)).toBe(0);
    expect(getShippingRateDE(0, 21.9)).toBeUndefined();
    expect(getShippingRateDE(40000, 60)).toBeUndefined();
  });

  it("should add shipping and returns to the offer and grams to the weight of the shop's Product JSON-LD", () => {
    /* As the shop serializes it (dish 2l, variation 1623) */
    const productJsonLd = JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Schüssel 2l <Glas>',
        offers: { '@type': 'Offer', priceCurrency: 'EUR', price: 27.9 },
        weight: { '@type': 'QuantitativeValue', value: 1100 },
      },
      null,
      4,
    ).replaceAll('<', String.raw`\u003C`);

    const result = completeProductJsonLd(productJsonLd);
    const { offers: offer, weight } = JSON.parse(result);

    expect(weight).toEqual({ '@type': 'QuantitativeValue', value: 1100, unitCode: 'GRM' });
    expect(offer).toMatchObject({
      price: 27.9,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 8.5, currency: 'EUR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'DE' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { minValue: 0, maxValue: 3, unitCode: 'DAY' },
          transitTime: { minValue: 1, maxValue: 2, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: getMerchantReturnPolicyJsonLd(),
    });
    expect(result).not.toContain('<');
  });

  it('should leave out the shipping of an item without weight and leave other JSON-LD as it is', () => {
    const noWeight = JSON.stringify({ '@type': 'Product', offers: { '@type': 'Offer', price: 20 } });
    const offer = JSON.parse(completeProductJsonLd(noWeight)).offers;
    expect(offer).not.toHaveProperty('shippingDetails');
    expect(offer).toHaveProperty('hasMerchantReturnPolicy');

    const organization = '{"@type":"Organization","name":"-GLAS in JENA-"}';
    expect(completeProductJsonLd(organization)).toBe(organization);
    const noOffer = '{"@type":"Product"}';
    expect(completeProductJsonLd(noOffer)).toBe(noOffer);
  });
});
