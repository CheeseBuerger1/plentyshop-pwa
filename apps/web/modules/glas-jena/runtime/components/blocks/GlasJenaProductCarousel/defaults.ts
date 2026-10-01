import { v4 as uuid } from 'uuid';
import type { Block } from '@plentymarkets/shop-api';
import type { GlasJenaProductCarouselContent } from './types';
import {
  PRODUCT_CAROUSEL_BLOCK_NAME,
  PRODUCT_CAROUSEL_MAX_ITEMS,
  PRODUCT_CAROUSEL_SORT_RANDOM,
  TOP_SELLER_CATEGORY_ID,
} from '../../../utils/home';

const createContent = (title: string, categoryId: string): GlasJenaProductCarouselContent => ({
  text: { title },
  source: { categoryId, sort: PRODUCT_CAROUSEL_SORT_RANDOM, itemsPerPage: PRODUCT_CAROUSEL_MAX_ITEMS },
});

const createCarousel = (content: GlasJenaProductCarouselContent): Block => ({
  name: PRODUCT_CAROUSEL_BLOCK_NAME,
  type: 'content',
  meta: { uuid: uuid() },
  configuration: {
    visible: true,
  },
  content,
});

/* Own category key, so the block keeps its own access control (see DidYouKnow/defaults.ts) */
export const getBlocksList = (): BlocksList => ({
  glasJenaProductCarousel: {
    category: 'glasJenaProductCarousel',
    accessControl: ['content', 'productCategory'],
    title: 'Item carousel (GLAS IN JENA)',
    blockName: PRODUCT_CAROUSEL_BLOCK_NAME,
    variations: [
      {
        title: 'Unsere Topseller',
        template: {
          en: createCarousel(createContent('Our top sellers', TOP_SELLER_CATEGORY_ID)),
          de: createCarousel(createContent('Unsere Topseller', TOP_SELLER_CATEGORY_ID)),
        },
      },
    ],
  },
});

export const createDefault = (): Block => createCarousel(createContent('', ''));
