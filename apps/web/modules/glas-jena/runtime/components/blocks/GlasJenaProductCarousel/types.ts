/** Where the items come from, see PRODUCT_CAROUSEL_SOURCE_OPTIONS (missing: a category). */
export type GlasJenaProductCarouselSourceType = 'category' | 'cross_selling';

/** Cross-selling relation of PlentyONE, see CROSS_SELLING_RELATION_OPTIONS. */
export type GlasJenaCrossSellingRelation = 'ReplacementPart' | 'Accessory' | 'Similar';

export type GlasJenaProductCarouselSource = {
  /** Items of a category or the cross-selling items of the product page's item. */
  type?: GlasJenaProductCarouselSourceType;
  /** Category whose items are shown (e.g. the hidden category "Topseller"). */
  categoryId?: string;
  /** Cross-selling: which related items of the item are shown ("Ersatzteile", "Zubehör"). */
  crossSellingRelation?: GlasJenaCrossSellingRelation;
  /** Sort key of the shop's item search, see PRODUCT_CAROUSEL_SORT_OPTIONS. */
  sort?: string;
  /** Maximum number of items (1–50). */
  itemsPerPage?: number;
};

export type GlasJenaProductCarouselContent = {
  text: {
    /** Heading in the blue bar above the items, e.g. "Unsere Topseller". */
    title?: string;
  };
  source: GlasJenaProductCarouselSource;
};

export type GlasJenaProductCarouselProps = {
  name: string;
  type: string;
  meta: {
    uuid: string;
  };
  configuration?: {
    visible?: boolean;
  };
  content: GlasJenaProductCarouselContent;
  index?: number;
};

export type GlasJenaProductCarouselFormProps = {
  uuid?: string;
};

/** Content as the editor form works with it: every optional setting filled in. */
export type NormalizedGlasJenaProductCarouselContent = {
  text: { title: string };
  source: {
    type: GlasJenaProductCarouselSourceType;
    categoryId: string;
    crossSellingRelation: GlasJenaCrossSellingRelation;
    sort: string;
    itemsPerPage: number;
  };
};

/** One choice of the sort select in the editor form (label: translation key of the form). */
export type GlasJenaProductCarouselSortOption = {
  value: string;
  label: string;
};
