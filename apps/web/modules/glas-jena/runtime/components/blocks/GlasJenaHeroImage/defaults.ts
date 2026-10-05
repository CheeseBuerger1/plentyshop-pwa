import { v4 as uuid } from 'uuid';
import type { Block } from '@plentymarkets/shop-api';
import type { GlasJenaHeroImageContent } from './types';
import {
  HERO_IMAGE_BLOCK_NAME,
  HERO_SLIDER_DEFAULT_INTERVAL,
  LTS_HERO_IMAGE_URLS,
  getHeroSliderImageUrls,
} from '../../../utils/home';

/** Alternative texts of the nine images in the webspace folder `Grafiken/slider`, in their order. */
const SLIDER_ALTS = {
  de: [
    'Teekanne mit Edelstahlfilter und zwei Teetassen aus Glas auf einer Küchenarbeitsplatte',
    'Teekanne auf einem Stövchen mit Teelicht, daneben eine kleine Teekanne mit Glasfilter, Teetasse, Teedose und Limette',
    'Teekanne mit Edelstahlfilter auf einem Stövchen, davor Teetassen, Milchkännchen, Zuckerschale und Gebäck',
    'Teetasse mit Edelstahlsieb und Glasdeckel auf einer Untertasse mit Kandiszucker',
    'Teekanne mit Edelstahlfilter und Teebecher aus Glas, beide mit Tee gefüllt',
    'Wasserkessel aus Glas mit kochendem Wasser',
    'Glasschalen mit geschnittenem Gemüse, dahinter Karaffen mit Öl und Essig',
    'Glastasse mit gemischtem Salat auf einer Untertasse',
    'Doppelwandige Gläser mit blauer, gelber und roter Flüssigkeit, in eines wird eingeschenkt',
  ],
  en: [
    'Glass tea pot with stainless steel filter and two glass tea cups on a kitchen counter',
    'Glass tea pot on a warmer with tea light, next to it a small glass tea pot with glass filter, tea cup, tea tin and lime',
    'Glass tea pot with stainless steel filter on a warmer, tea cups, milk jug, sugar bowl and biscuits in front',
    'Tea cup with stainless steel strainer and glass lid on a saucer with rock sugar',
    'Glass tea pot with stainless steel filter and glass tea mug, both filled with tea',
    'Glass kettle with boiling water',
    'Glass bowls with sliced vegetables, carafes with oil and vinegar behind them',
    'Glass cup with mixed salad on a saucer',
    'Double-walled glasses with blue, yellow and red liquid, one being filled',
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
