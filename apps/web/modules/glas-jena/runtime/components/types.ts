import type { CategoryTreeItem } from '@plentymarkets/shop-api';

export interface GlasJenaNavigationProps {
  /** Categories from the header's Navigation block; falls back to the fetched category tree when empty. */
  categories?: CategoryTreeItem[];
}

export interface GlasJenaNavigationMenuProps {
  /** Categories shown in this dropdown level. */
  nodes: CategoryTreeItem[];
  /** Nesting level, 2 for the first dropdown below the main bar. */
  level: number;
  /** Builds the localized link for a category. */
  buildLink: (category: CategoryTreeItem) => string;
}
