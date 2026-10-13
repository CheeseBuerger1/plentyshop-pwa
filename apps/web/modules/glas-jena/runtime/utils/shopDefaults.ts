import { defaults as shopDefaults } from '~/composables/defaults';

/** Articles per page of item lists: the highest step of the shop (see `PER_PAGE_STEPS`). */
export const ITEMS_PER_PAGE = 100;

/**
 * The shop's `defaults` with 100 instead of 50 articles per page (replaces the auto-import `defaults`, see the
 * module's `imports:extend` hook). No category comes near 100 articles, so item lists need neither the "per page"
 * selection nor a pagination (as requested by the shop owner); a pagination with a single page is hidden in
 * glas-jena.css and still appears if a list ever has more than 100 articles.
 */
export const defaults = { ...shopDefaults, DEFAULT_ITEMS_PER_PAGE: ITEMS_PER_PAGE };
