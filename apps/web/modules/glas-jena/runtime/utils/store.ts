import type { Store, WithContext } from 'schema-dts';

/** Key of the Store JSON-LD in the head, see useGlasJenaStructuredData.ts */
export const GLAS_JENA_STORE_KEY = 'glas-jena-store';

/** The factory outlet as on the home page (block "Werksverkauf"), opening hours confirmed by the shop owner 2026-11-11 */
export const STORE = {
  name: 'GLAS in JENA',
  streetAddress: 'Westbahnhofstraße 8',
  postalCode: '07745',
  addressLocality: 'Jena',
  addressCountry: 'DE',
  openingHours: [
    { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' },
    { dayOfWeek: ['Saturday'], opens: '10:00', closes: '13:00' },
  ],
} as const;

/**
 * The factory outlet for search engines (local search, Google Maps): a Store with address and opening hours. The
 * shop only had an Organization (SEO check, 2026-11-11). Only on the home page, which shows the outlet; `image` is
 * the header logo of the shop settings (left out without one).
 */
export const getStoreJsonLd = (url: string, image?: string): WithContext<Store> => ({
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: STORE.name,
  url,
  ...(image ? { image } : {}),
  address: {
    '@type': 'PostalAddress',
    streetAddress: STORE.streetAddress,
    postalCode: STORE.postalCode,
    addressLocality: STORE.addressLocality,
    addressCountry: STORE.addressCountry,
  },
  openingHoursSpecification: STORE.openingHours.map(({ dayOfWeek, opens, closes }) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [...dayOfWeek],
    opens,
    closes,
  })),
});
