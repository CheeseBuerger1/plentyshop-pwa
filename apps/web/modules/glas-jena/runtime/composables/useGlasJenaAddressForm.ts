import {
  type ActiveShippingCountry,
  AddressType,
  cartGetters,
  type GeoRegulatedCountry,
} from '@plentymarkets/shop-api';
import { toTypedSchema } from '@vee-validate/yup';
import { boolean, object, string } from 'yup';
import { useAddressForm as useShopAddressForm } from '~/composables/useAddressForm/useAddressForm';
import { getAddressFormat, normalizePostalCode } from '../utils/addressFormats';

/** Length of a phone number, as in the account's address form (`minlength`/`maxlength`). */
const PHONE_LENGTH = /^.{7,18}$/;

/**
 * The shop's `useAddressForm` with a validation schema per country of delivery, for the module's address forms of the
 * checkout (GlasJenaAddressFormShipping.vue, GlasJenaAddressFormBilling.vue), see utils/addressFormats.ts and
 * docs/adressformate.md. Only those forms read the schema; its state is the original's. Changes to the original schema:
 * - the house number (`apartment`) is not required in Great Britain, whose address is one line (PlentyONE requires
 *   it everywhere else)
 * - the postal code is trimmed and capitalised before PlentyONE's rule of the country checks it; countries without
 *   postal codes have POSTAL_CODE_NONE in the hidden field
 * - the state is required in the countries of STATE_REQUIRED_COUNTRIES (PlentyONE's list), optional elsewhere
 * - new: address line 2 (`additionalAddressInformation`, PlentyONE `address3`) and an optional phone number
 * Everything else (saving, refreshing shipping and payment) is the original.
 */
export const useGlasJenaAddressForm = (type: AddressType) => {
  const form = useShopAddressForm(type);
  const { hasCompany, defaultFormValues } = form;
  const { data: cartData } = useCart();
  const { default: shippingCountries, billingCountries, getCountryZipCodeRegex } = useAggregatedCountries();

  const formatOf = (countryId: string | undefined) => {
    const countries = type === AddressType.Billing ? billingCountries.value : shippingCountries.value;
    const country = countries.find(
      (entry: ActiveShippingCountry | GeoRegulatedCountry) => entry.id === Number(countryId),
    );
    return getAddressFormat(country);
  };
  const required = t('error.requiredField');

  const validationSchema = toTypedSchema(
    object({
      firstName: string().when([], {
        is: () => !hasCompany.value,
        then: () => string().required(required).default(defaultFormValues.value.firstName),
        otherwise: () => string().optional().default(defaultFormValues.value.firstName),
      }),
      lastName: string().when([], {
        is: () => !hasCompany.value,
        then: () => string().required(required).default(defaultFormValues.value.lastName),
        otherwise: () => string().optional().default(defaultFormValues.value.lastName),
      }),
      country: string()
        .required(required)
        .default(defaultFormValues.value.country ?? cartGetters.getShippingCountryId(cartData.value).toString()),
      streetName: string().required(required).default(defaultFormValues.value.streetName),
      apartment: string()
        .when('country', ([countryId], schema) =>
          formatOf(countryId).singleLine ? schema.optional() : schema.required(required),
        )
        .default(defaultFormValues.value.apartment),
      additionalAddressInformation: string()
        .optional()
        .default(defaultFormValues.value.additionalAddressInformation ?? ''),
      city: string().required(required).default(defaultFormValues.value.city),
      state: string()
        .when('country', ([countryId], schema) =>
          formatOf(countryId).state === 'required' ? schema.required(required) : schema.optional(),
        )
        .default(defaultFormValues.value.state ?? ''),
      zipCode: string()
        .transform(normalizePostalCode)
        .when('country', ([countryId], schema) => {
          const checked = schema.required(required);
          const zipCodeRegex = getCountryZipCodeRegex(Number(countryId), type);
          return zipCodeRegex
            ? checked.matches(zipCodeRegex, {
                message: t('PreferredDelivery.packstation.zipcodeInvalid'),
                excludeEmptyString: true,
              })
            : checked;
        })
        .default(defaultFormValues.value.zipCode),
      phoneNumber: string()
        .trim()
        .optional()
        .matches(PHONE_LENGTH, { message: t('glasJenaAddress.phoneInvalid'), excludeEmptyString: true })
        .default(defaultFormValues.value.phoneNumber ?? ''),
      primary: boolean().default(false),
      companyName: string().when([], {
        is: () => hasCompany.value,
        then: () => string().required(required).default(defaultFormValues.value.companyName),
        otherwise: () => string().optional().default(defaultFormValues.value.companyName),
      }),
      vatNumber: string().when([], {
        is: () => hasCompany.value,
        then: () => string().default(defaultFormValues.value.vatNumber),
        otherwise: () => string().optional().default(defaultFormValues.value.vatNumber),
      }),
    }),
  );

  return { ...form, validationSchema };
};
