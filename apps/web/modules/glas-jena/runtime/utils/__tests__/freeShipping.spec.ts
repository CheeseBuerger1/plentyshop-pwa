import { GERMANY_COUNTRY_ID, getFreeShippingRemainder } from '../freeShipping';

const AUSTRIA_COUNTRY_ID = 2;

describe('getFreeShippingRemainder', () => {
  it('should give what is missing to 150 € within Germany, rounded to cents', () => {
    expect(getFreeShippingRemainder(GERMANY_COUNTRY_ID, 27.9)).toBe(122.1);
    expect(getFreeShippingRemainder(GERMANY_COUNTRY_ID, 149.99)).toBe(0.01);
  });

  it('should give 0 from 150 € on (150.00 € is free already)', () => {
    expect(getFreeShippingRemainder(GERMANY_COUNTRY_ID, 150)).toBe(0);
    expect(getFreeShippingRemainder(GERMANY_COUNTRY_ID, 167.4)).toBe(0);
  });

  it('should give nothing for other countries, an empty cart or a cart not loaded yet', () => {
    expect(getFreeShippingRemainder(AUSTRIA_COUNTRY_ID, 27.9)).toBeUndefined();
    expect(getFreeShippingRemainder(GERMANY_COUNTRY_ID, 0)).toBeUndefined();
    expect(getFreeShippingRemainder(null, 27.9)).toBeUndefined();
    expect(getFreeShippingRemainder(GERMANY_COUNTRY_ID, undefined)).toBeUndefined();
  });
});
