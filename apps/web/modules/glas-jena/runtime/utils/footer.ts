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

/**
 * Payment methods shown as icons in the footer bar, where the LTS shop shows its payment icons. `id` selects the
 * icon (`assets/payment/<id>.svg`, drawn in the footer's text colour via a CSS mask in `GlasJenaFooterBlocks.vue`),
 * `labelKey` the name read by screen readers in the footer's own translations.
 */
export const PAYMENT_METHODS = [
  { id: 'paypal', labelKey: 'paymentPaypal' },
  { id: 'kreditkarte', labelKey: 'paymentCreditCard' },
  { id: 'vorkasse', labelKey: 'paymentPrepayment' },
  { id: 'apple-pay', labelKey: 'paymentApplePay' },
  { id: 'google-pay', labelKey: 'paymentGooglePay' },
] as const;
