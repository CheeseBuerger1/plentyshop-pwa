import { v4 as uuid } from 'uuid';
import type { Block } from '@plentymarkets/shop-api';
import type { GlasJenaHeroImageContent } from './types';
import {
  HERO_IMAGE_BLOCK_NAME,
  HERO_SLIDER_DEFAULT_INTERVAL,
  LTS_HERO_IMAGE_URLS,
  getHeroSliderImageUrls,
} from '../../../utils/home';

/** Alternative texts of the eight images in the webspace folder `Grafiken/slider`, in their order. */
const SLIDER_ALTS = {
  de: [
    'Teekanne mit Edelstahlfilter und zwei Teetassen aus Glas auf einer Küchenarbeitsplatte',
    'Teekanne mit Glasfilter, Teetasse mit Untertasse, Zitronen und Limetten',
    'Flache Teekanne mit Glasfilter, Teetasse, Zitronen und Limetten',
    'Teetasse mit Edelstahlsieb und Glasdeckel auf einer Untertasse mit Kandiszucker',
    'Glastasse mit Salat neben einer Teetasse mit Edelstahlsieb',
    'Wasserkessel aus Glas mit kochendem Wasser',
    'Glasschalen mit geschnittenem Gemüse, dahinter Karaffen mit Öl und Essig',
    'Glastasse mit gemischtem Salat auf einer Untertasse',
  ],
  en: [
    'Glass tea pot with stainless steel filter and two glass tea cups on a kitchen counter',
    'Glass tea pot with glass filter, tea cup with saucer, lemons and limes',
    'Flat glass tea pot with glass filter, tea cup, lemons and limes',
    'Tea cup with stainless steel strainer and glass lid on a saucer with rock sugar',
    'Glass cup with salad next to a tea cup with stainless steel strainer',
    'Glass kettle with boiling water',
    'Glass bowls with sliced vegetables, carafes with oil and vinegar behind them',
    'Glass cup with mixed salad on a saucer',
  ],
};

const createSingleImage = (alt: string): GlasJenaHeroImageContent => ({
  slides: [{ large: LTS_HERO_IMAGE_URLS.large, medium: '', small: LTS_HERO_IMAGE_URLS.mobile, alt }],
  interval: HERO_SLIDER_DEFAULT_INTERVAL,
});

const createSequence = (alts: string[]): GlasJenaHeroImageContent => ({
  slides: alts.map((alt, index) => ({ ...getHeroSliderImageUrls(index + 1), alt })),
  interval: HERO_SLIDER_DEFAULT_INTERVAL,
});

const createHeroImage = (content: GlasJenaHeroImageContent): Block => ({
  name: HERO_IMAGE_BLOCK_NAME,
  type: 'content',
  meta: { uuid: uuid() },
  configuration: {
    visible: true,
  },
  content,
});

/* Own category key, so the block keeps its own access control (see DidYouKnow/defaults.ts) */
export const getBlocksList = (): BlocksList => ({
  glasJenaHeroImage: {
    category: 'glasJenaHeroImage',
    accessControl: ['content', 'productCategory'],
    title: 'Hero image (GLAS IN JENA)',
    blockName: HERO_IMAGE_BLOCK_NAME,
    variations: [
      {
        title: 'Image sequence',
        template: {
          en: createHeroImage(createSequence(SLIDER_ALTS.en)),
          de: createHeroImage(createSequence(SLIDER_ALTS.de)),
        },
      },
      {
        title: 'Hero image',
        template: {
          en: createHeroImage(createSingleImage('Glass tea pot and tea glasses on a kitchen counter')),
          de: createHeroImage(createSingleImage('Teekanne und Teegläser aus Glas auf einer Küchenarbeitsplatte')),
        },
      },
    ],
  },
});

export const createDefault = (): Block => createHeroImage(createSingleImage(''));
