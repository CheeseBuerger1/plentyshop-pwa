import { useStructuredData as useShopStructuredData } from '~/composables/useStructuredData/useStructuredData';
import { openGraph } from '~/configuration/app.config';
import { GLAS_JENA_ORGANIZATION_KEY, JSON_LD_TYPE, getOrganizationJsonLd, withMetaDescription } from '../utils/seo';

/**
 * The shop's `useStructuredData` (replaces the auto-import, see IMPORT_OVERRIDES in the module's index.ts), with two
 * changes:
 * - the Product JSON-LD takes the item's meta description as `description` instead of the long HTML description
 * - the Organization JSON-LD of the layouts (`setLogoMeta`) has the shop name of the page titles and the header logo
 *   of the shop settings, see `getOrganizationJsonLd`
 */
export const useStructuredData: typeof useShopStructuredData = () => {
  const structuredData = useShopStructuredData();

  const setLogoMeta = () => {
    const runtimeConfig = useRuntimeConfig().public;
    const { getSetting: getOgTitle } = useSiteSettings('ogTitle');
    const { getSetting: getHeaderLogo } = useSiteSettings('headerLogo');
    /* The same name as the suffix of the page titles, see usePageTitle */
    const name = getOgTitle() || runtimeConfig.ogTitle || openGraph.title;

    useHead({
      script: [
        {
          key: GLAS_JENA_ORGANIZATION_KEY,
          type: JSON_LD_TYPE,
          innerHTML: safeSerializeJsonLd(
            getOrganizationJsonLd({ name, url: runtimeConfig.domain, logo: getHeaderLogo() || undefined }),
          ),
        },
      ],
    });
  };

  return {
    ...structuredData,
    setLogoMeta,
    setProductMetaData: (product) => structuredData.setProductMetaData(withMetaDescription(product)),
  };
};
