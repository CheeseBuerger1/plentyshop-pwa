/** The sorting "Empfohlen" (recommended) as the shop sends it to PlentyONE. */
export const RECOMMENDED_SORTING = 'default.recommended_sorting';

/** First level of "Empfohlen" when the editor gives none: variation position ascending, like the LTS shop. */
export const RECOMMENDED_SORTING_FALLBACK = 'variation.position_asc';

/**
 * The sorting PlentyONE gets for a list of items. PlentyONE does not apply the editor's levels of "Empfohlen"
 * (category » sorting » recommended sorting) to `default.recommended_sorting`: the items came back unordered, e.g. the
 * mixing bowls (positions 70–100) in the middle of the bowls instead of at the end (found by the shop owner,
 * 2026-10-24). "Empfohlen" is therefore sent as its first level from the editor; any other sorting stays as it is.
 *
 * @param sort Sorting of the request, e.g. `default.recommended_sorting` or `texts.name1_asc`.
 * @param firstLevel First level of "Empfohlen" from the editor (`recommendedFirstSortingOption`).
 */
export const resolveRecommendedSorting = (sort: unknown, firstLevel: unknown) => {
  if (sort !== RECOMMENDED_SORTING) {
    return sort;
  }
  return typeof firstLevel === 'string' && firstLevel && firstLevel !== RECOMMENDED_SORTING
    ? firstLevel
    : RECOMMENDED_SORTING_FALLBACK;
};
