import { formatShippingAmount } from '../shippingAmount';

const formatPrice = (value: number) => `${value.toFixed(2)} EUR`;

describe('formatShippingAmount', () => {
  it('should show the free text for zero, as a string or a number', () => {
    expect(formatShippingAmount('0', 'Kostenlos', formatPrice)).toBe('Kostenlos');
    expect(formatShippingAmount(0, 'Kostenlos', formatPrice)).toBe('Kostenlos');
  });

  it('should format other amounts as a price', () => {
    expect(formatShippingAmount('4.9', 'Kostenlos', formatPrice)).toBe('4.90 EUR');
    expect(formatShippingAmount(12.5, 'Kostenlos', formatPrice)).toBe('12.50 EUR');
  });

  it('should only count exactly zero as free, like the original', () => {
    expect(formatShippingAmount('0.00', 'Kostenlos', formatPrice)).toBe('0.00 EUR');
  });
});
