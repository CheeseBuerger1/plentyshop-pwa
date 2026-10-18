import { getProductOpenGraph, correctSeoTags } from '../utils/seo';
import type { SeoHeadTag } from '../utils/types';

/** Key of the head plugin that corrects the resolved tags (unhead loads a plugin of the same key only once) */
const SEO_HEAD_PLUGIN_KEY = 'glas-jena-seo';

/*
 * Head tags for search engines and shared links, see utils/seo.ts:
 * - item pages: og:type "product" with the price, og:title/og:description/og:image from the item data (the shop puts
 *   its defaults there: shop name, home page text, title picture); high priority so they win over app.vue
 * - all pages: canonical, hreflang, prev/next and og:url without tracking or filter parameters, and the module's
 *   breadcrumbs for search engines instead of the shop's ones
 */
export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute();
  const { currentProduct } = useProducts();
  /* The current item stays in the state after leaving its page, so only product pages count */
  const openGraph = computed(() => {
    if (route.meta.type !== 'product' || !currentProduct.value?.variation) {
      return undefined;
    }
    const { price } = useProductPrice(currentProduct.value);
    return getProductOpenGraph(currentProduct.value, price.value);
  });

  useSeoMeta(
    {
      ogTitle: () => openGraph.value?.title,
      ogDescription: () => openGraph.value?.description,
      ogImage: () => openGraph.value?.image,
    },
    { tagPriority: 'high' },
  );
  /* og:type "product" is not among the types of useSeoMeta */
  useHead(
    {
      meta: () => {
        if (!openGraph.value) {
          return [];
        }
        const { type, priceAmount, priceCurrency } = openGraph.value;
        return [
          { property: 'og:type', content: type },
          ...(priceAmount && priceCurrency
            ? [
                { property: 'product:price:amount', content: priceAmount },
                { property: 'product:price:currency', content: priceCurrency },
              ]
            : []),
        ];
      },
    },
    { tagPriority: 'high' },
  );

  injectHead(nuxtApp).use({
    key: SEO_HEAD_PLUGIN_KEY,
    hooks: { 'tags:resolve': ({ tags }: { tags: SeoHeadTag[] }) => correctSeoTags(tags) },
  });
});
