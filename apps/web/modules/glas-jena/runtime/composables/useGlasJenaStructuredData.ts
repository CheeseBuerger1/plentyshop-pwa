import { useStructuredData as useShopStructuredData } from '~/composables/useStructuredData/useStructuredData';
import { openGraph } from '~/configuration/app.config';
import {
  GLAS_JENA_ORGANIZATION_KEY,
  ITEM_CONDITION_SETTINGS,
  JSON_LD_TYPE,
  SEO_AVAILABILITY_SETTINGS,
  getOrganizationJsonLd,
  withGtin13,
  withMetaDescription,
  withSeoFallback,
} from '../utils/seo';

/**
 * The shop's `useStructuredData` (replaces the auto-import, see IMPORT_OVERRIDES in the module's index.ts), with
 * these changes:
 * - the Product JSON-LD takes the item's meta description as `description` instead of the long HTML description,
 *   and its GTIN-13 from the variation's barcodes when PlentyONE delivers none (see `withGtin13`); availability and
 *   condition of the offer from the editor settings when PlentyONE delivers no SEO data (see `withSeoFallback`)
 * - the Organization JSON-LD of the layouts (`setLogoMeta`) has the shop name of the page titles and the header logo
 *   of the shop settings, see `getOrganizationJsonLd`
 */
export const useStructuredData: typeof useShopStructuredData = () => {
  const structuredData = useShopStructuredData();
  /* Read here, not in setProductMetaData: the product page also calls it after an `await` (variation change) */
  const { getSetting: getGtin13Source } = useSiteSettings('seoRichSnippetBarcodeGtin13');
  const { getSetting: getGtin13BarcodeId } = useSiteSettings('seoRichSnippetBarcodeGtin13Id');
  const seoFallbackSettings = new Map(
    [...SEO_AVAILABILITY_SETTINGS, ...ITEM_CONDITION_SETTINGS].map((key) => [key, useSiteSettings(key).getSetting]),
  );
  const getSeoFallbackSetting = (key: string) => seoFallbackSettings.get(key)?.();

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
    setProductMetaData: (product) =>
      structuredData.setProductMetaData(
        withSeoFallback(
          withGtin13(withMetaDescription(product), getGtin13Source(), getGtin13BarcodeId()),
          getSeoFallbackSetting,
        ),
      ),
  };
};
