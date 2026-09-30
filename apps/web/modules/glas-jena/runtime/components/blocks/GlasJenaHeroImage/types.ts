/** Image URLs per screen size (like the shop's Image block); missing sizes fall back to the next larger one. */
export type GlasJenaHeroImageSources = {
  wideScreen?: string;
  desktop?: string;
  tablet?: string;
  mobile?: string;
};

export type GlasJenaHeroImageContent = {
  image: GlasJenaHeroImageSources & {
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

/** One `<source>` of the picture: the image for windows up to `maxWidth` pixels wide. */
export type GlasJenaHeroImageSource = {
  maxWidth: number;
  url: string;
};
