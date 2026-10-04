import type { Order } from '@plentymarkets/shop-api';
import { buildPurchaseEvent, pushPurchaseOnce, TRACKED_ORDER_KEY_PREFIX } from '../purchaseTracking';

const createOrder = (id: number, totalGross: unknown, email?: string, billingEmail?: string) =>
  ({
    order: {
      id,
      deliveryAddress: { options: email === undefined ? [] : [{ typeId: 5, value: email }] },
      billingAddress: { options: billingEmail === undefined ? [] : [{ typeId: 5, value: billingEmail }] },
    },
    totals: { totalGross, currency: 'EUR' },
  }) as unknown as Order;

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
};

describe('buildPurchaseEvent', () => {
  it('should build the event with id as string, gross total as number and the e-mail in lower case', () => {
    expect(buildPurchaseEvent(createOrder(54743, 11.3, '  Kunde@Example.DE '))).toEqual({
      event: 'purchase',
      ecommerce: { transaction_id: '54743', value: 11.3, currency: 'EUR' },
      user_data: { email: 'kunde@example.de' },
    });
  });

  it('should round the total to cents', () => {
    expect(buildPurchaseEvent(createOrder(1, 11.299999999))?.ecommerce.value).toBe(11.3);
  });

  it('should leave out user_data without e-mail', () => {
    const event = buildPurchaseEvent(createOrder(1, 20, ''));
    expect(event).not.toHaveProperty('user_data');
    expect(event?.ecommerce.value).toBe(20);
  });

  it('should take the e-mail of the billing address if the delivery address has none', () => {
    expect(buildPurchaseEvent(createOrder(1, 20, undefined, 'Rechnung@Example.de'))?.user_data).toEqual({
      email: 'rechnung@example.de',
    });
  });

  it('should return null without order id or total', () => {
    expect(buildPurchaseEvent({ totals: { totalGross: 20, currency: 'EUR' } } as unknown as Order)).toBeNull();
    expect(buildPurchaseEvent(createOrder(1, undefined))).toBeNull();
    expect(buildPurchaseEvent({ order: { id: 1 } } as unknown as Order)).toBeNull();
  });
});

describe('pushPurchaseOnce', () => {
  it('should push the event once per order and set the flag', () => {
    const dataLayer: unknown[] = [];
    const storage = createStorage();

    expect(pushPurchaseOnce(createOrder(100, 11.3), dataLayer, storage)).toBe(true);
    expect(pushPurchaseOnce(createOrder(100, 11.3), dataLayer, storage)).toBe(false);

    expect(dataLayer).toHaveLength(1);
    expect(storage.values.has(`${TRACKED_ORDER_KEY_PREFIX}100`)).toBe(true);
  });

  it('should not push an order flagged before (reload of the confirmation page)', () => {
    const dataLayer: unknown[] = [];
    const storage = createStorage();
    storage.setItem(`${TRACKED_ORDER_KEY_PREFIX}200`, '1');

    expect(pushPurchaseOnce(createOrder(200, 11.3), dataLayer, storage)).toBe(false);
    expect(dataLayer).toHaveLength(0);
  });

  it('should push once even if the storage is blocked', () => {
    const dataLayer: unknown[] = [];
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };

    expect(pushPurchaseOnce(createOrder(300, 11.3), dataLayer, blocked)).toBe(true);
    expect(pushPurchaseOnce(createOrder(300, 11.3), dataLayer, blocked)).toBe(false);
    expect(dataLayer).toHaveLength(1);
  });
});
