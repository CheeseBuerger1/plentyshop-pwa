import { v4 as uuid } from 'uuid';
import type { Block } from '@plentymarkets/shop-api';
import type { GlasJenaCrossSellingRelation, GlasJenaProductCarouselContent } from './types';
import {
  CROSS_SELLING_ACCESSORY,
  CROSS_SELLING_REPLACEMENT_PART,
  PRODUCT_CAROUSEL_BLOCK_NAME,
  PRODUCT_CAROUSEL_MAX_ITEMS,
  PRODUCT_CAROUSEL_SORT_RANDOM,
  PRODUCT_CAROUSEL_SORT_RECOMMENDED,
  PRODUCT_CAROUSEL_SOURCE_CROSS_SELLING,
  TOP_SELLER_CATEGORY_ID,
} from '../../../utils/home';

const createContent = (title: string, categoryId: string): GlasJenaProductCarouselContent => ({
  text: { title },
  source: { categoryId, sort: PRODUCT_CAROUSEL_SORT_RANDOM, itemsPerPage: PRODUCT_CAROUSEL_MAX_ITEMS },
});

const createCrossSellingContent = (
  title: string,
  crossSellingRelation: GlasJenaCrossSellingRelation,
): GlasJenaProductCarouselContent => ({
  text: { title },
  source: {
    type: PRODUCT_CAROUSEL_SOURCE_CROSS_SELLING,
    crossSellingRelation,
    sort: PRODUCT_CAROUSEL_SORT_RECOMMENDED,
    itemsPerPage: PRODUCT_CAROUSEL_MAX_ITEMS,
  },
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

/*
 * Own category key, so the block keeps its own access control (see DidYouKnow/defaults.ts). On product pages the
 * cross-selling items of the item: "Ersatzteile" and "Zubehör" like the LTS shop.
 */
export const getBlocksList = (): BlocksList => ({
  glasJenaProductCarousel: {
    category: 'glasJenaProductCarousel',
    accessControl: ['content', 'productCategory', 'product'],
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
      {
        title: 'Ersatzteile (product page)',
        template: {
          en: createCarousel(createCrossSellingContent('Spare parts', CROSS_SELLING_REPLACEMENT_PART)),
          de: createCarousel(createCrossSellingContent('Ersatzteile', CROSS_SELLING_REPLACEMENT_PART)),
        },
      },
      {
        title: 'Zubehör (product page)',
        template: {
          en: createCarousel(createCrossSellingContent('Accessories', CROSS_SELLING_ACCESSORY)),
          de: createCarousel(createCrossSellingContent('Zubehör', CROSS_SELLING_ACCESSORY)),
        },
      },
    ],
  },
});

export const createDefault = (): Block => createCarousel(createContent('', ''));
