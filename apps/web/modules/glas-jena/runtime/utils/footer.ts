/**
 * Links of the footer bar, like the LTS shop: AGB, Widerruf, Datenschutz, Versand, Kontakt, Impressum.
 * `pathKey` is the page in `paths`, `labelKey` the text in the footer's own translations.
 */
export const FOOTER_LINKS: { pathKey: keyof typeof paths; labelKey: string }[] = [
  { pathKey: 'termsAndConditions', labelKey: 'termsAndConditions' },
  { pathKey: 'cancellationRights', labelKey: 'cancellationRights' },
  { pathKey: 'privacyPolicy', labelKey: 'privacyPolicy' },
  { pathKey: 'shipping', labelKey: 'shipping' },
  { pathKey: 'contact', labelKey: 'contact' },
  { pathKey: 'legalDisclosure', labelKey: 'legalDisclosure' },
];
