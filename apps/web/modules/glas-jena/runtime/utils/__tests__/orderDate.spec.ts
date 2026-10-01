import type { Order } from '@plentymarkets/shop-api';
import { formatOrderDate } from '../orderDate';

const order = { order: { createdAt: '2026-10-01T10:22:05+02:00' } } as unknown as Order;

describe('formatOrderDate', () => {
  it('should return the date without the time of day', () => {
    expect(formatOrderDate(order, 'de')).toBe(new Date('2026-10-01T10:22:05+02:00').toLocaleDateString('de'));
    expect(formatOrderDate(order, 'de')).not.toContain(':');
  });

  it('should return an empty string without a creation date', () => {
    expect(formatOrderDate({} as Order, 'de')).toBe('');
  });
});
