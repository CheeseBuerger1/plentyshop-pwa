import { v4 as uuid } from 'uuid';
import type { Block } from '@plentymarkets/shop-api';
import { ITEM_DETAILS_BLOCK_NAME } from '../../../utils/itemDetails';

const createItemDetails = (title: string): Block => ({
  name: ITEM_DETAILS_BLOCK_NAME,
  type: 'content',
  meta: { uuid: uuid() },
  configuration: {
    visible: true,
  },
  content: { text: { title } },
});

/* Own category key, so the block keeps its own access control (see DidYouKnow/defaults.ts); product pages only */
export const getBlocksList = (): BlocksList => ({
  glasJenaItemDetails: {
    category: 'glasJenaItemDetails',
    accessControl: ['product'],
    title: 'More details (GLAS IN JENA)',
    blockName: ITEM_DETAILS_BLOCK_NAME,
    variations: [
      {
        title: 'Weitere Details',
        template: { en: createItemDetails('More details'), de: createItemDetails('Weitere Details') },
      },
    ],
  },
});

export const createDefault = (): Block => createItemDetails('');
