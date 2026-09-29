import { toTypedSchema } from '@vee-validate/yup';
import { userGetters } from '@plentymarkets/shop-api';
import { boolean, object, string } from 'yup';

/**
 * Validation of the contact form, the same rules as the shop's pages/contact.vue (see the upstream contract test):
 * email and message required, name optional (3+ characters), subject required (3+ characters), order number
 * optional (digits only), privacy policy confirmed, the spam check answered when Turnstile is set up.
 */
export const createContactValidationSchema = (turnstileRequired: boolean) =>
  toTypedSchema(
    object({
      email: string()
        .trim()
        .required(t('error.email.required'))
        .test('is-valid-email', t('storefrontError.contactMail.emailInvalid'), (mail: string) =>
          userGetters.isValidEmailAddress(mail),
        )
        .default(''),
      message: string()
        .required(t('error.contact.messageRequired'))
        .test('min-clean-length', t('storefrontError.contactMail.messageInvalid'), (value: string | undefined) => {
          if (!value) {
            return false;
          }
          return value.replace(/\n/g, '').trim().length >= 3;
        })
        .default(''),
      name: string()
        .trim()
        .notRequired()
        .default('')
        .test('min-if-not-empty', t('storefrontError.contactMail.nameInvalid'), (value) => {
          if (!value || value.length === 0) {
            return true;
          }
          return value.length >= 3;
        }),
      subject: string()
        .trim()
        .required(t('error.contact.subjectRequired'))
        .default('')
        .test('min-length', t('storefrontError.contactMail.subjectInvalid'), (value) => !!(value && value.length >= 3)),
      orderId: string()
        .trim()
        .notRequired()
        .default('')
        .test(
          'digits-if-not-empty',
          t('storefrontError.contactMail.orderIdInvalid'),
          (value) => !value || /^[1-9][0-9]*$/.test(value),
        ),
      privacyPolicy: boolean().oneOf([true], t('error.contact.termsRequired')).default(false),
      turnstile: turnstileRequired
        ? string().required(t('error.contact.turnstileRequired')).default('')
        : string().optional().default(''),
    }),
  );

/** Contact data of the shop like the LTS contact page (the shop interface does not provide them). */
export const SHOP_CONTACT = {
  name: 'OnlineMarket -GLAS in JENA-',
  street: 'Westbahnhofstr. 8',
  city: '07745 Jena',
  phone: '+49 (0)3641 320026',
  phoneHref: 'tel:+493641320026',
  fax: '+49 (0)3641 236218',
  email: 'shop@glas-jena.de',
};
