import { defaults as shopDefaults } from '~/composables/defaults';
import { ITEMS_PER_PAGE, defaults } from '../shopDefaults';

describe('shopDefaults', () => {
  it('should raise the articles per page to the highest step of the shop', () => {
    expect(defaults.DEFAULT_ITEMS_PER_PAGE).toBe(ITEMS_PER_PAGE);
    expect(Math.max(...shopDefaults.PER_PAGE_STEPS)).toBe(ITEMS_PER_PAGE);
  });

  it('should keep every other default of the shop', () => {
    expect({ ...defaults, DEFAULT_ITEMS_PER_PAGE: shopDefaults.DEFAULT_ITEMS_PER_PAGE }).toEqual(shopDefaults);
  });
});
