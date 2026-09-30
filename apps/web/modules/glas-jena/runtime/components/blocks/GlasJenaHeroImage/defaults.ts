import { v4 as uuid } from 'uuid';
import type { Block } from '@plentymarkets/shop-api';
import type { GlasJenaHeroImageContent } from './types';
import { HERO_IMAGE_BLOCK_NAME, LTS_HERO_IMAGE_URLS } from '../../../utils/home';

const createContent = (alt: string): GlasJenaHeroImageContent => ({
  image: {
    wideScreen: LTS_HERO_IMAGE_URLS.large,
    desktop: LTS_HERO_IMAGE_URLS.large,
    tablet: LTS_HERO_IMAGE_URLS.large,
    mobile: LTS_HERO_IMAGE_URLS.mobile,
    alt,
  },
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
        title: 'Hero image',
        template: {
          en: createHeroImage(createContent('Glass tea pot and tea glasses on a kitchen counter')),
          de: createHeroImage(createContent('Teekanne und Teegläser aus Glas auf einer Küchenarbeitsplatte')),
        },
      },
    ],
  },
});

export const createDefault = (): Block => createHeroImage(createContent(''));
