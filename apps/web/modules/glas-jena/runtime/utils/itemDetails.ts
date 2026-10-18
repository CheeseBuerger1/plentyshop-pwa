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
/** Locale of the English shop, which adds US units like the English LTS shop. */
const ENGLISH = 'en';
const ML_PER_US_FLUID_OUNCE = 29.5735295625;
const MM_PER_INCH = 25.4;

/** A converted value with two decimals, like the English LTS shop ("40.58", "4.49"). */
const formatConverted = (value: number) => value.toFixed(2);

/**
 * Content from the variation name, which holds the capacity in ml ("1200" → "1200 ml"); empty otherwise. In English
 * also in US fluid ounces, like the English LTS shop ("1200 ml / 40.58 US fl.oz."). Items without a capacity have the
 * name "0" (72 of 344 as of 2026-10-15) or none: the line is left out (wish of the shop owner; the LTS shop shows
 * "n/a" there).
 */
export const getItemContent = (variationName: string | undefined, locale = '') => {
  const name = variationName?.trim() ?? '';
  const millilitres = Number(name.replace(',', '.'));
  if (!CAPACITY.test(name) || millilitres <= 0) {
    return '';
  }
  if (locale !== ENGLISH) {
    return `${name} ml`;
  }
  const ounces = millilitres / ML_PER_US_FLUID_OUNCE;
  return `${name} ml / ${formatConverted(ounces)} US fl.oz.`;
};

/**
 * Dimensions in the LTS order "H | B | T": height, length, width of the variation in mm, one line; in English a
 * second line in inches, like the English LTS shop ("4.49 in | 8.86 in | 6.69 in"). None while no size is set.
 * (The LTS shop shows the length as "B", e.g. NOVA+ 114 mm | 225 mm | 170 mm.)
 */
export const formatDimensions = (height?: number, length?: number, width?: number, locale = '') => {
  const values = [height, length, width].map((value) => Number(value) || 0);
  if (!values.some(Boolean)) {
    return [];
  }
  const millimetres = values.map((value) => `${value} mm`).join(' | ');
  if (locale !== ENGLISH) {
    return [millimetres];
  }
  return [millimetres, values.map((value) => `${formatConverted(value / MM_PER_INCH)} in`).join(' | ')];
};

const getCountryName = (country: ManufacturerCountry | undefined, locale: string) =>
  country?.names?.find((entry) => entry.language === locale)?.name || country?.name || '';

/**
 * Name and address of the manufacturer, one line each, like the LTS shop. The name is the company name (`name`), not
 * the external name: that one is the brand for search engines ("trendglas JENA", see the editor's SEO settings).
 */
export const getManufacturerLines = (manufacturer: ManufacturerWithCountry | undefined, locale: string) => {
  if (!manufacturer) {
    return [];
  }
  const street = [manufacturer.street, manufacturer.houseNo].filter(Boolean).join(' ');
  const town = [manufacturer.postcode, manufacturer.town].filter(Boolean).join(' ');
  const country = getCountryName(manufacturer.countryObject ?? manufacturer.country, locale);
  return [manufacturer.name || manufacturer.externalName, street, town, country]
    .map((line) => line?.trim() ?? '')
    .filter(Boolean);
};

/** The lines of "Weitere Details" for the item, in the LTS order. */
export const getItemDetailRows = (product: Product, locale: string): ItemDetailRow[] => {
  const manufacturer = productGetters.getManufacturer(product) as ManufacturerWithCountry | undefined;
  const manufacturerLines = getManufacturerLines(manufacturer, locale);
  const rows: ItemDetailRow[] = [
    { key: 'itemNumber', lines: [productGetters.getVariationNumber(product)] },
    { key: 'content', lines: [getItemContent(product.variation?.name, locale)] },
    {
      key: 'dimensions',
      lines: formatDimensions(
        productGetters.getHeightMM(product),
        productGetters.getLengthMM(product),
        productGetters.getWidthMM(product),
        locale,
      ),
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
