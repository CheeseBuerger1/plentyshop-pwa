import { useStructuredData as useShopStructuredData } from '~/composables/useStructuredData/useStructuredData';
import { withMetaDescription } from '../utils/seo';

/**
 * The shop's `useStructuredData` (replaces the auto-import, see IMPORT_OVERRIDES in the module's index.ts), but the
 * Product JSON-LD takes the item's meta description as `description` instead of the long HTML description.
 */
export const useStructuredData: typeof useShopStructuredData = () => {
  const structuredData = useShopStructuredData();

  return {
    ...structuredData,
    setProductMetaData: (product) => structuredData.setProductMetaData(withMetaDescription(product)),
  };
};
