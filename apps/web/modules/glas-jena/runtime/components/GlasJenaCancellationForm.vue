<template>
  <section class="gj-cancellation-form" aria-labelledby="gj-cancellation-form-title" data-testid="gj-cancellation-form">
    <h2 id="gj-cancellation-form-title" class="gj-cancellation-form__title">{{ t('legal.cancellationForm') }}</h2>

    <div
      v-if="turnstileSiteKey.length === 0 || cancellationEmail.length === 0"
      class="flex items-start bg-warning-100 pr-4 pl-4 ring-1 ring-warning-200 typography-text-sm @md:typography-text-base py-1 mb-4"
      data-testid="gj-cancellation-form-misconfigured"
    >
      <SfIconWarning class="mt-2 mr-2 text-warning-700 shrink-0" />
      <div class="py-2">{{ t('cancellationForm.misConfigured') }}</div>
    </div>

    <form v-else data-testid="cancellation-form" class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
      <label for="cancellation-name">
        <UiFormLabel class="mb-1">{{ t('cancellationForm.name') }} {{ t('form.required') }}</UiFormLabel>
        <SfInput
          id="cancellation-name"
          v-bind="nameAttributes"
          v-model="name"
          name="name"
          type="text"
          autocomplete="name"
          :invalid="Boolean(errors['name'])"
          :disabled="loading"
          aria-describedby="cancellation-name-error"
        />
        <ErrorMessage
          id="cancellation-name-error"
          as="div"
          name="name"
          class="text-negative-700 text-left text-sm pt-1"
        />
      </label>

      <label for="cancellation-order-id">
        <UiFormLabel class="mb-1">{{ t('cancellationForm.orderId') }} {{ t('form.required') }}</UiFormLabel>
        <SfInput
          id="cancellation-order-id"
          v-bind="orderIdAttributes"
          v-model="orderId"
          name="orderId"
          type="text"
          :invalid="Boolean(errors['orderId'])"
          :disabled="loading"
          aria-describedby="cancellation-order-id-error"
        />
        <ErrorMessage
          id="cancellation-order-id-error"
          as="div"
          name="orderId"
          class="text-negative-700 text-left text-sm pt-1"
        />
      </label>

      <label for="cancellation-email">
        <UiFormLabel class="mb-1">{{ t('cancellationForm.email') }} {{ t('form.required') }}</UiFormLabel>
        <SfInput
          id="cancellation-email"
          v-bind="emailAttributes"
          v-model="email"
          name="email"
          type="email"
          autocomplete="email"
          :invalid="Boolean(errors['email'])"
          :disabled="loading"
          aria-describedby="cancellation-email-error"
        />
        <ErrorMessage
          id="cancellation-email-error"
          as="div"
          name="email"
          class="text-negative-700 text-left text-sm pt-1"
        />
      </label>

      <label for="cancellation-reason" class="flex flex-col">
        <UiFormLabel class="mb-1 flex">
          <span class="mr-1">{{ t('cancellationForm.reason') }}</span>
          <UiFormHelperText>({{ t('form.optional') }})</UiFormHelperText>
        </UiFormLabel>
        <SfTextarea
          id="cancellation-reason"
          v-bind="reasonAttributes"
          v-model="reason"
          name="reason"
          rows="5"
          :disabled="loading"
          class="w-full"
        />
      </label>

      <p class="text-sm text-neutral-500">{{ t('form.required') }} {{ t('cancellationForm.asterixHint') }}</p>

      <p>
        <i18n-t keypath="cancellationForm.privacyPolicy" scope="global">
          <template #privacyPolicy>
            <NuxtLink :to="localePath(paths.privacyPolicy)" class="gj-cancellation-form__link">
              {{ t('legal.privacyPolicy') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </p>

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

        <UiButton type="submit" class="min-w-32" :disabled="loading">
          <SfLoaderCircular v-if="loading" class="flex justify-center items-center" size="sm" />
          <span v-else>{{ t('cancellationForm.submit') }}</span>
        </UiButton>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { SfInput, SfTextarea, SfLoaderCircular, SfIconWarning } from '@storefront-ui/vue';
import { useForm, ErrorMessage } from 'vee-validate';

/*
 * The shop's cancellation form (logic, fields and texts of pages/cancellation-form.vue via useCancellationForm),
 * below the cancellation policy like the LTS shop. Fields in the LTS order: name, order number, email, reason.
 */
const { loading, submitCancellation, validationSchema, turnstileSiteKey } = useCancellationForm();
const { getSetting: getCancellationEmail } = useSiteSettings('cancellationFormRecipient');
const cancellationEmail = getCancellationEmail() ?? '';
const turnstileElement = ref();
const turnstileLoad = ref(false);
const { send } = useNotification();
const localePath = useLocalizedPath();

const { errors, meta, defineField, handleSubmit, resetForm } = useForm({ validationSchema });

const [rawOrderId, orderIdAttributes] = defineField('orderId');
const orderId = rawOrderId as Ref<string>;
const [rawName, nameAttributes] = defineField('name');
const name = rawName as Ref<string>;
const [email, emailAttributes] = defineField('email');
const [reason, reasonAttributes] = defineField('reason');
const [turnstile, turnstileAttributes] = defineField('turnstile');

const submitForm = async () => {
  if (!meta.value.valid) {
    return;
  }

  const customerEmail = await submitCancellation({
    email: email.value || '',
    name: name.value || '',
    orderId: orderId.value.trim(),
    reason: reason.value || '',
    'cf-turnstile-response': turnstile.value || '',
  });

  if (customerEmail) {
    send({
      type: 'positive',
      message: t('cancellationForm.success', { email: customerEmail }),
    });
    resetForm();
  }

  turnstile.value = '';
  turnstileElement.value?.reset();
};

const onSubmit = handleSubmit(() => submitForm());

/* Like the original page: the spam check loads once the visitor starts filling in the form */
if (turnstileSiteKey.length > 0) {
  const turnstileWatcher = watch([orderId, name, email], (values) => {
    if (values.some((field) => field && field.length > 0)) {
      turnstileLoad.value = true;
      turnstileWatcher();
    }
  });
}
</script>

<style scoped>
/* Below the legal text, with its side padding (`p-5`) and a heading like the legal texts' h2 */
.gj-cancellation-form {
  max-width: 56rem;
  padding: 0 1.25rem 2rem;
}

.gj-cancellation-form__title {
  margin: 1rem 0;
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.1;
}

.gj-cancellation-form__link {
  color: var(--gj-link);
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.gj-cancellation-form__link:is(:hover, :focus) {
  color: var(--gj-link-hover);
}
</style>
