export type GlasJenaTileContent = {
  text: {
    title?: string;
    htmlDescription?: string;
  };
  /** "Mehr" link in the lower right corner; hidden while the link is empty. */
  button: {
    label?: string;
    link?: string;
    openInNewTab?: boolean;
    /** The whole tile opens the link (category tiles). */
    linkWholeTile?: boolean;
  };
  /** Picture centred below the title (category tiles). */
  image?: {
    url?: string;
    alt?: string;
  };
  layout: {
    backgroundColor?: string;
    textColor?: string;
    /** Colour of the title; empty: the text colour. */
    titleColor?: string;
    /** Picture on the right edge of the tile (e.g. the carafe of "Werksverkauf"). */
    backgroundImage?: string;
  };
  /** Below 992 px window width only the title shows, a click on it opens the text (like the LTS shop). */
  collapsibleOnMobile?: boolean;
};

export type GlasJenaTileProps = {
  name: string;
  type: string;
  meta: {
    uuid: string;
  };
  configuration?: {
    visible?: boolean;
  };
  content: GlasJenaTileContent;
  index?: number;
};

export type GlasJenaTileFormProps = {
  uuid?: string;
};

/** Content as the editor form works with it: every optional setting filled in. */
export type NormalizedGlasJenaTileContent = {
  text: { title: string; htmlDescription: string };
  button: { label: string; link: string; openInNewTab: boolean; linkWholeTile: boolean };
  image: { url: string; alt: string };
  layout: { backgroundColor: string; textColor: string; titleColor: string; backgroundImage: string };
  collapsibleOnMobile: boolean;
};

/** Texts of a tile template in one language (see defaults.ts). */
export type GlasJenaTileTexts = { title: string; html: string; more: string };
