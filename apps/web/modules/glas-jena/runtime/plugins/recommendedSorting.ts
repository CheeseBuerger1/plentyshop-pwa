import { resolveRecommendedSorting } from '../utils/recommendedSorting';

/** The item list request of the shop's SDK whose sorting is resolved, see utils/recommendedSorting.ts. */
const FACET_METHOD = 'getFacet';

/*
 * "Empfohlen" as its first level from the editor (variation position): wraps the SDK module `plentysystems` so that
 * `getFacet` – categories, search, the module's carousels – sends that sorting instead of `default.recommended_sorting`.
 * The menu keeps "Empfohlen". The module is replaced as a whole because its methods come from a proxy and cannot be
 * overwritten one by one. Appended, so it runs after the SDK plugin of shop-core.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const sdk = nuxtApp.$sdk as { plentysystems: Record<string, (...args: unknown[]) => unknown> } | undefined;
  if (!sdk?.plentysystems) {
    return;
  }
  const { getSetting: recommendedFirstSortingOption } = useSiteSettings('recommendedFirstSortingOption');
  const original = sdk.plentysystems;

  sdk.plentysystems = new Proxy(original, {
    get(target, property, receiver) {
      const method = Reflect.get(target, property, receiver);
      if (property !== FACET_METHOD || typeof method !== 'function') {
        return method;
      }
      return (params: unknown, ...rest: unknown[]) => {
        if (!params || typeof params !== 'object') {
          return method(params, ...rest);
        }
        const request = params as { sort?: unknown };
        const sort = resolveRecommendedSorting(request.sort, recommendedFirstSortingOption());
        return method(sort === request.sort ? params : { ...request, sort }, ...rest);
      };
    },
  });
});
