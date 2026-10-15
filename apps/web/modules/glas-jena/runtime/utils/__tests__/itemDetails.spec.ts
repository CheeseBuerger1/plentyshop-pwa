import type { Product } from '@plentymarkets/shop-api';
import type { ItemDetailRow } from '../types';
import { formatDimensions, getItemContent, getItemDetailRows, getManufacturerLines } from '../itemDetails';

/* The NOVA+ teapot as the item search delivers it (shortened) */
const manufacturer = {
  name: 'Trendglas Jena GmbH',
  externalName: 'Trendglas Jena GmbH',
  street: 'Westbahnhofstr.',
  houseNo: '8',
  postcode: '07745',
  town: 'Jena',
  url: 'https://www.trendglas-jena.com',
  countryObject: {
    name: 'Deutschland',
    names: [
      { language: 'de', name: 'Deutschland' },
      { language: 'en', name: 'Germany' },
    ],
  },
};

const createProduct = (overrides: { variation?: object; manufacturer?: object | null } = {}) =>
  ({
    item: {
      id: 105075,
      manufacturer: overrides.manufacturer === null ? undefined : (overrides.manufacturer ?? manufacturer),
    },
    variation: {
      id: 1016,
      number: '105075',
      name: '1200',
      heightMM: 114,
      lengthMM: 225,
      widthMM: 170,
      availability: { names: { name: 'lieferbar' } },
      ...overrides.variation,
    },
  }) as unknown as Product;

const keysOf = (rows: ItemDetailRow[]) => rows.map(({ key }) => key);
const linesOf = (rows: ItemDetailRow[], key: ItemDetailRow['key']) => rows.find((row) => row.key === key)?.lines;

describe('itemDetails', () => {
  describe('getItemContent', () => {
    it('should show the capacity of the variation name in ml', () => {
      expect(getItemContent('1200')).toBe('1200 ml');
      expect(getItemContent(' 400 ')).toBe('400 ml');
    });

    it('should show nothing for an empty or non-numeric variation name', () => {
      expect(getItemContent('')).toBe('');
      expect(getItemContent(undefined)).toBe('');
      expect(getItemContent('Glaskörper')).toBe('');
      expect(getItemContent('', 'en')).toBe('');
    });

    it('should leave out the capacity 0 (items without a capacity) in German and English', () => {
      expect(getItemContent('0', 'de')).toBe('');
      expect(getItemContent('0', 'en')).toBe('');
    });

    it('should add US fluid ounces in English like the English LTS shop', () => {
      expect(getItemContent('1200', 'en')).toBe('1200 ml / 40.58 US fl.oz.');
      expect(getItemContent('1200', 'de')).toBe('1200 ml');
    });
  });

  describe('formatDimensions', () => {
    it('should list height, length and width in mm like the LTS shop', () => {
      expect(formatDimensions(114, 225, 170, 'de')).toEqual(['114 mm | 225 mm | 170 mm']);
    });

    it('should add a line in inches in English like the English LTS shop', () => {
      expect(formatDimensions(114, 225, 170, 'en')).toEqual([
        '114 mm | 225 mm | 170 mm',
        '4.49 in | 8.86 in | 6.69 in',
      ]);
    });

    it('should show nothing without any dimension', () => {
      expect(formatDimensions(0, 0, 0, 'en')).toEqual([]);
      expect(formatDimensions()).toEqual([]);
    });
  });

  describe('getManufacturerLines', () => {
    it('should list name, street, town and the country in the language of the shop', () => {
      expect(getManufacturerLines(manufacturer, 'de')).toEqual([
        'Trendglas Jena GmbH',
        'Westbahnhofstr. 8',
        '07745 Jena',
        'Deutschland',
      ]);
      expect(getManufacturerLines(manufacturer, 'en').at(-1)).toBe('Germany');
    });

    it('should leave out missing parts of the address', () => {
      expect(getManufacturerLines({ name: 'Glashütte', town: 'Jena' }, 'de')).toEqual(['Glashütte', 'Jena']);
      expect(getManufacturerLines(undefined, 'de')).toEqual([]);
    });
  });

  describe('getItemDetailRows', () => {
    it('should give the LTS details in the LTS order', () => {
      expect(getItemDetailRows(createProduct(), 'de')).toEqual([
        { key: 'itemNumber', lines: ['105075'] },
        { key: 'content', lines: ['1200 ml'] },
        { key: 'dimensions', lines: ['114 mm | 225 mm | 170 mm'] },
        { key: 'availability', lines: ['lieferbar'] },
        {
          key: 'manufacturer',
          lines: ['Trendglas Jena GmbH', 'Westbahnhofstr. 8', '07745 Jena', 'Deutschland'],
          url: 'https://www.trendglas-jena.com',
        },
      ]);
    });

    it('should give content and dimensions with US units and the country in English', () => {
      const rows = getItemDetailRows(createProduct(), 'en');

      expect(linesOf(rows, 'content')).toEqual(['1200 ml / 40.58 US fl.oz.']);
      expect(linesOf(rows, 'dimensions')).toEqual(['114 mm | 225 mm | 170 mm', '4.49 in | 8.86 in | 6.69 in']);
      expect(linesOf(rows, 'manufacturer')?.at(-1)).toBe('Germany');
    });

    it('should leave out lines without a value', () => {
      const rows = getItemDetailRows(
        createProduct({ variation: { name: '', heightMM: 0, lengthMM: 0, widthMM: 0 }, manufacturer: null }),
        'de',
      );

      expect(keysOf(rows)).toEqual(['itemNumber', 'availability']);
    });
  });
});
