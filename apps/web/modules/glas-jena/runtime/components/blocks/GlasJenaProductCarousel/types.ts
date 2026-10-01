export type GlasJenaProductCarouselContent = {
  text: {
    /** Heading in the blue bar above the items, e.g. "Unsere Topseller". */
    title?: string;
  };
  source: {
    /** Category whose items are shown (e.g. the hidden category "Topseller"). */
    categoryId?: string;
    /** Sort key of the shop's item search, see PRODUCT_CAROUSEL_SORT_OPTIONS. */
    sort?: string;
    /** Maximum number of items (1–50). */
    itemsPerPage?: number;
  };
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
  source: { categoryId: string; sort: string; itemsPerPage: number };
};

/** One choice of the sort select in the editor form (label: translation key of the form). */
export type GlasJenaProductCarouselSortOption = {
  value: string;
  label: string;
};
