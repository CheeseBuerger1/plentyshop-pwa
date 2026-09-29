<template>
  <div
    v-if="turnstileSiteKey.length === 0 || contactShopEmail.length === 0"
    class="flex items-start bg-warning-100 pr-4 pl-4 ring-1 ring-warning-200 typography-text-sm @md:typography-text-base py-1"
    data-testid="gj-contact-form-misconfigured"
  >
    <SfIconWarning class="mt-2 mr-2 text-warning-700 shrink-0" />
    <div class="py-2">{{ t('contact.misConfigured') }}</div>
  </div>

  <form v-else data-testid="contact-form" class="gj-form flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
    <!-- Name and email side by side from 768 px, like the LTS form -->
    <div class="grid gap-4 @md:grid-cols-2">
      <label for="contact-name">
        <UiFormLabel class="mb-1 flex">
          <span class="mr-1">{{ t('contact.form.nameLabel') }}</span>
          <UiFormHelperText>({{ t('form.optional') }})</UiFormHelperText>
        </UiFormLabel>
        <SfInput
          id="contact-name"
          v-bind="nameAttributes"
          v-model="name"
          name="name"
          type="text"
          autocomplete="name"
          :invalid="Boolean(errors['name'])"
          :disabled="loading"
          aria-describedby="contact-name-error"
        />
        <ErrorMessage id="contact-name-error" as="div" name="name" class="text-negative-700 text-left text-sm pt-1" />
      </label>

      <label for="contact-email">
        <UiFormLabel class="mb-1">{{ t('contact.form.emailLabel') }} {{ t('form.required') }}</UiFormLabel>
        <SfInput
          id="contact-email"
          v-bind="emailAttributes"
          v-model="email"
          name="email"
          type="email"
          autocomplete="email"
          :invalid="Boolean(errors['email'])"
          :disabled="loading"
          aria-describedby="contact-email-error"
        />
        <ErrorMessage id="contact-email-error" as="div" name="email" class="text-negative-700 text-left text-sm pt-1" />
      </label>
    </div>

    <label for="contact-subject">
      <UiFormLabel class="mb-1">{{ t('contact.form.subjectLabel') }} {{ t('form.required') }}</UiFormLabel>
      <SfInput
        id="contact-subject"
        v-bind="subjectAttributes"
        v-model="subject"
        name="subject"
        type="text"
        :invalid="Boolean(errors['subject'])"
        :disabled="loading"
        aria-describedby="contact-subject-error"
      />
      <ErrorMessage
        id="contact-subject-error"
        as="div"
        name="subject"
        class="text-negative-700 text-left text-sm pt-1"
      />
    </label>

    <label for="contact-order-id">
      <UiFormLabel class="mb-1 flex">
        <span class="mr-1">{{ t('contact.form.order-id') }}</span>
        <UiFormHelperText>({{ t('form.optional') }})</UiFormHelperText>
      </UiFormLabel>
      <SfInput
        id="contact-order-id"
        v-bind="orderIdAttributes"
        v-model="orderId"
        name="orderId"
        type="text"
        inputmode="numeric"
        :invalid="Boolean(errors['orderId'])"
        :disabled="loading"
        aria-describedby="contact-order-id-error"
      />
      <ErrorMessage
        id="contact-order-id-error"
        as="div"
        name="orderId"
        class="text-negative-700 text-left text-sm pt-1"
      />
    </label>

    <label for="contact-message" class="flex flex-col">
      <UiFormLabel class="mb-1">{{ t('contact.form.message') }} {{ t('form.required') }}</UiFormLabel>
      <SfTextarea
        id="contact-message"
        v-bind="messageAttributes"
        v-model="message"
        name="message"
        rows="6"
        :invalid="Boolean(errors['message'])"
        :disabled="loading"
        aria-describedby="contact-message-error"
        class="w-full"
      />
      <ErrorMessage
        id="contact-message-error"
        as="div"
        name="message"
        class="text-negative-700 text-left text-sm pt-1"
      />
    </label>

    <p class="text-sm text-neutral-500">{{ t('form.required') }} {{ t('contact.form.asterixHint') }}</p>

    <div>
      <div class="flex items-start">
        <SfCheckbox
          id="contact-privacy-policy"
          v-bind="privacyPolicyAttributes"
          v-model="privacyPolicy"
          :invalid="Boolean(errors['privacyPolicy'])"
          value="value"
          class="peer mt-1"
          aria-describedby="contact-privacy-policy-error"
        />
        <label for="contact-privacy-policy" class="ml-3 cursor-pointer select-none">
          <i18n-t keypath="contact.privacyPolicy" scope="global">
            <template #privacyPolicy>
              <NuxtLink
                :to="localePath(paths.privacyPolicy)"
                target="_blank"
                rel="noopener"
                class="gj-contact-form__link"
                data-testid="gj-contact-form-privacy-link"
              >
                {{ t('legal.privacyPolicy') }}<span class="sr-only"> {{ tLocal('opensInNewTab') }}</span>
              </NuxtLink>
            </template>
          </i18n-t>
          {{ t('form.required') }}
        </label>
      </div>
      <ErrorMessage
        id="contact-privacy-policy-error"
        as="div"
        name="privacyPolicy"
        class="text-negative-700 text-left text-sm pt-1"
      />
    </div>

    <div class="flex flex-col-reverse @md:flex-row @md:items-start @md:justify-between gap-4">
      <div>
        <NuxtTurnstile
          v-if="turnstileSiteKey.length > 0 && turnstileLoad"
          v-bind="turnstileAttributes"
          ref="turnstileElement"
          v-model="turnstile"
          :site-key="turnstileSiteKey"
          :options="{ theme: 'light' }"
        />
        <ErrorMessage as="div" name="turnstile" class="text-negative-700 text-left text-sm pt-1" />
      </div>

      <UiButton data-testid="save-address" type="submit" class="min-w-32" :disabled="loading">
        <SfLoaderCircular v-if="loading" class="flex justify-center items-center" size="sm" />
        <span v-else>{{ t('contact.contactSend') }}</span>
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { CustomerContactEmailParams } from '@plentymarkets/shop-api';
import { SfCheckbox, SfInput, SfLoaderCircular, SfTextarea, SfIconWarning } from '@storefront-ui/vue';
import { useForm, ErrorMessage } from 'vee-validate';
import { createContactValidationSchema } from '../utils/contactForm';

/*
 * The shop's contact form (logic, fields and texts of pages/contact.vue), laid out like the LTS form: name and
 * email side by side, then subject, order number and message, privacy confirmation and "Anfrage senden". Without
 * the original's "clear all" button (decision of the shop owner, like the LTS form).
 */
const { loading, doCustomerContactMail } = useCustomerContact();
const localePath = useLocalizedPath();
const { getSetting: getTurnstileSiteKey } = useSiteSettings('cloudflareTurnstileApiSiteKey');
const { getSetting: getContactShopEmail } = useSiteSettings('contactShopEmail');
const { send } = useNotification();
/* Own texts; the shop's texts come from the global `t()` */
const { t: tLocal } = useI18n({ useScope: 'local' });

const contactShopEmail = getContactShopEmail() ?? '';
const turnstileSiteKey = getTurnstileSiteKey() ?? '';
const turnstileElement = ref();
const turnstileLoad = ref(false);

const { errors, meta, defineField, handleSubmit, resetForm } = useForm({
  validationSchema: createContactValidationSchema(turnstileSiteKey.length > 0),
});

const [rawName, nameAttributes] = defineField('name');
const name = rawName as Ref<string>;
const [email, emailAttributes] = defineField('email');
const [rawSubject, subjectAttributes] = defineField('subject');
const subject = rawSubject as Ref<string>;
const [rawOrderId, orderIdAttributes] = defineField('orderId');
const orderId = rawOrderId as Ref<string>;
const [message, messageAttributes] = defineField('message');
const [privacyPolicy, privacyPolicyAttributes] = defineField('privacyPolicy');
const [turnstile, turnstileAttributes] = defineField('turnstile');

const submitForm = async () => {
  if (!meta.value.valid || !turnstile.value) {
    return;
  }

  const params: CustomerContactEmailParams = {
    subject: subject.value || '',
    email: email.value || '',
    message: message.value || '',
    'cf-turnstile-response': turnstile.value,
  };

  if (name.value) {
    params.name = name.value;
  }
  if (orderId.value) {
    params.orderId = Number(orderId.value);
  }

  if (await doCustomerContactMail(params)) {
    send({ type: 'positive', message: t('contact.success') });
    resetForm();
  }

  turnstile.value = '';
  turnstileElement.value?.reset();
};

const onSubmit = handleSubmit(() => submitForm());

/* Like the original page: the spam check loads once the visitor starts filling in the form */
if (turnstileSiteKey.length > 0) {
  const turnstileWatcher = watch([name, email, subject, orderId, message], (values) => {
    if (values.some((field) => field && field.length > 0)) {
      turnstileLoad.value = true;
      turnstileWatcher();
    }
  });
}
</script>

<i18n lang="json">
{
  "en": { "opensInNewTab": "(opens in a new tab)" },
  "de": { "opensInNewTab": "(öffnet in neuem Tab)" }
}
</i18n>

<style scoped>
.gj-contact-form__link {
  color: var(--gj-link);
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.gj-contact-form__link:is(:hover, :focus) {
  color: var(--gj-link-hover);
}
</style>
