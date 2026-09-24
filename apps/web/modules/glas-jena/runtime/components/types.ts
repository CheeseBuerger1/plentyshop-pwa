import type { CategoryTreeItem } from '@plentymarkets/shop-api';

export interface GlasJenaNavigationProps {
  /** Categories from the header's Navigation block; falls back to the fetched category tree when empty. */
  categories?: CategoryTreeItem[];
}

/** Views of the mobile menu (see VIEW_* in utils/navigation.ts). */
export type GlasJenaMobileNavigationView = 'categories' | 'account' | 'language';

export interface GlasJenaNavigationMenuProps {
  /** Categories shown in this dropdown level. */
  nodes: CategoryTreeItem[];
  /** Nesting level, 2 for the first dropdown below the main bar. */
  level: number;
  /** Builds the localized link for a category. */
  buildLink: (category: CategoryTreeItem) => string;
  /** Whether the category is the current page or one of its ancestors. */
  isActive: (category: CategoryTreeItem) => boolean;
  /** Whether this level is currently shown; hidden levels stay in the HTML for search engines. */
  isOpen: boolean;
}
