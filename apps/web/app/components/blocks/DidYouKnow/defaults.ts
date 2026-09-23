import { v4 as uuid } from 'uuid';
import type { Block } from '@plentymarkets/shop-api';
import type { DidYouKnowContent } from './types';

export const DID_YOU_KNOW_DEFAULT_BACKGROUND_COLOR = '#4B6A82';
export const DID_YOU_KNOW_DEFAULT_TEXT_COLOR = '#FFFFFF';

const createContent = (title: string, fact: string): DidYouKnowContent => ({
  text: {
    title,
    facts: [fact],
    showIcon: true,
    textAlignment: 'center',
  },
  autoplay: {
    interval: 0,
  },
  layout: {
    backgroundColor: DID_YOU_KNOW_DEFAULT_BACKGROUND_COLOR,
    textColor: DID_YOU_KNOW_DEFAULT_TEXT_COLOR,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 24,
    paddingRight: 24,
    fullWidth: false,
  },
});

const createDidYouKnow = (content: DidYouKnowContent): Block => ({
  name: 'DidYouKnow',
  type: 'content',
  meta: { uuid: uuid() },
  configuration: {
    visible: true,
  },
  content,
});

/*
 * Own category key: blocks sharing a key are merged into one category that keeps the access control of the first
 * block, so sharing "text" with TextCard would also allow this block on product pages.
 */
export const getBlocksList = (): BlocksList => ({
  didYouKnow: {
    category: 'didYouKnow',
    accessControl: ['content', 'productCategory'],
    title: 'Did you know',
    blockName: 'DidYouKnow',
    variations: [
      {
        title: 'Did you know',
        template: {
          en: createDidYouKnow(
            createContent(
              'Did you know that...',
              '... all our heat-resistant items are heated to approx. 600 °C and slowly cooled down before packing. This prevents tension in the glass.',
            ),
          ),
          de: createDidYouKnow(
            createContent(
              'Wussten Sie schon, dass...',
              '... alle unsere hitzebeständigen Artikel vor dem Verpacken auf ca. 600 °C aufgeheizt und langsam abgekühlt werden. Damit werden Spannungen im Glas vermieden.',
            ),
          ),
        },
      },
    ],
  },
});

export const createDefault = (): Block =>
  createDidYouKnow(createContent('Did you know that...', '... this is an example fact.'));
