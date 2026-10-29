import type { ShippingConditions } from 'schema-dts';
import { RETURN_COUNTRIES, getMerchantReturnPolicyJsonLd, getShippingServiceJsonLd } from '../merchantPolicies';

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
    expect(rateFor('DE', 31.5, 60)).toBe(23.8);
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
    });
    expect(policy).not.toHaveProperty('returnMethod');
  });

  it('should name each return country once and no more than Google takes', () => {
    expect(new Set(RETURN_COUNTRIES).size).toBe(RETURN_COUNTRIES.length);
    expect(RETURN_COUNTRIES.length).toBeLessThanOrEqual(50);
    expect(RETURN_COUNTRIES).toContain('DE');
  });
});
