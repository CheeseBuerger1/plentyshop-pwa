/** Image URLs per screen size of the first version of the block (one image); read as a single slide. */
export type GlasJenaHeroImageSources = {
  wideScreen?: string;
  desktop?: string;
  tablet?: string;
  mobile?: string;
};

/** One image of the sequence: the same picture about 1000, 800 and 500 px wide, and its alternative text. */
export type GlasJenaHeroSlide = {
  large?: string;
  medium?: string;
  small?: string;
  alt?: string;
};

export type GlasJenaHeroImageContent = {
  /** Images shown one after the other, cross-fading */
  slides?: GlasJenaHeroSlide[];
  /** Seconds each image stays before the next one fades in */
  interval?: number;
  /** First version of the block (one image); used while `slides` is empty */
  image?: GlasJenaHeroImageSources & {
    alt?: string;
  };
};

export type GlasJenaHeroImageProps = {
  name: string;
  type: string;
  meta: {
    uuid: string;
  };
  configuration?: {
    visible?: boolean;
  };
  content: GlasJenaHeroImageContent;
  index?: number;
};

export type GlasJenaHeroImageFormProps = {
  uuid?: string;
};

/** A slide ready to render: the image for `src` (largest), the `srcset` with the widths and the alternative text. */
export type GlasJenaHeroSlideImage = {
  src: string;
  srcset: string;
  alt: string;
};
