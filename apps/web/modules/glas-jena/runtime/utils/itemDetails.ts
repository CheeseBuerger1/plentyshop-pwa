import type { Product } from '@plentymarkets/shop-api';
import { productGetters } from '@plentymarkets/shop-api';
import type { ItemDetailRow, ManufacturerCountry, ManufacturerWithCountry } from './types';

/** Editor block "Weitere Details" of the product page (the name is also the component's file name). */
export const ITEM_DETAILS_BLOCK_NAME = 'GlasJenaItemDetails';

/*
 * "Weitere Details" like the LTS shop (wish of the shop owner, 2026-10-15): item number, content, dimensions,
 * availability and manufacturer with address and website. Lines without a value are left out.
 */

/** A capacity in the variation name: a number, in millilitres (all variations, as of 2026-10-15). */
const CAPACITY = /^\d+(?:[.,]\d+)?$/;

/** Content from the variation name, which holds the capacity in ml ("1200" → "1200 ml"); empty otherwise. */
export const getItemContent = (variationName: string | undefined) => {
  const name = variationName?.trim() ?? '';
  return CAPACITY.test(name) ? `${name} ml` : '';
};

/**
 * Dimensions in the LTS order "H | B | T": height, length, width of the variation in mm. Empty while none is set.
 * (The LTS shop shows the length as "B", e.g. NOVA+ 114 mm | 225 mm | 170 mm.)
 */
export const formatDimensions = (height?: number, length?: number, width?: number) => {
  const values = [height, length, width].map((value) => Number(value) || 0);
  return values.some(Boolean) ? values.map((value) => `${value} mm`).join(' | ') : '';
};

const getCountryName = (country: ManufacturerCountry | undefined, locale: string) =>
  country?.names?.find((entry) => entry.language === locale)?.name || country?.name || '';

/** Name and address of the manufacturer, one line each, like the LTS shop. */
export const getManufacturerLines = (manufacturer: ManufacturerWithCountry | undefined, locale: string) => {
  if (!manufacturer) {
    return [];
  }
  const street = [manufacturer.street, manufacturer.houseNo].filter(Boolean).join(' ');
  const town = [manufacturer.postcode, manufacturer.town].filter(Boolean).join(' ');
  const country = getCountryName(manufacturer.countryObject ?? manufacturer.country, locale);
  return [manufacturer.externalName || manufacturer.name, street, town, country]
    .map((line) => line?.trim() ?? '')
    .filter(Boolean);
};

/** The lines of "Weitere Details" for the item, in the LTS order. */
export const getItemDetailRows = (product: Product, locale: string): ItemDetailRow[] => {
  const manufacturer = productGetters.getManufacturer(product) as ManufacturerWithCountry | undefined;
  const manufacturerLines = getManufacturerLines(manufacturer, locale);
  const rows: ItemDetailRow[] = [
    { key: 'itemNumber', lines: [productGetters.getVariationNumber(product)] },
    { key: 'content', lines: [getItemContent(product.variation?.name)] },
    {
      key: 'dimensions',
      lines: [
        formatDimensions(
          productGetters.getHeightMM(product),
          productGetters.getLengthMM(product),
          productGetters.getWidthMM(product),
        ),
      ],
    },
    /* The getter fails on a variation without availability */
    {
      key: 'availability',
      lines: [product.variation?.availability ? productGetters.getAvailabilityName(product) : ''],
    },
    {
      key: 'manufacturer',
      lines: manufacturerLines,
      url: (manufacturerLines.length && manufacturer?.url?.trim()) || undefined,
    },
  ];
  return rows
    .map((row) => ({ ...row, lines: row.lines.map((line) => line?.toString().trim() ?? '').filter(Boolean) }))
    .filter((row) => row.lines.length > 0);
};
