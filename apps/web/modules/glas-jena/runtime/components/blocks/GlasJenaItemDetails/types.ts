export type GlasJenaItemDetailsContent = {
  text: {
    /** Heading of the tile, e.g. "Weitere Details". */
    title?: string;
  };
};

export type GlasJenaItemDetailsProps = {
  name: string;
  type: string;
  meta: {
    uuid: string;
  };
  configuration?: {
    visible?: boolean;
  };
  content: GlasJenaItemDetailsContent;
  index?: number;
};

export type GlasJenaItemDetailsFormProps = {
  uuid?: string;
};
