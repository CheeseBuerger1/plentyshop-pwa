<template>
  <NuxtLayout name="default">
    <div class="gj-contact" data-testid="gj-contact">
      <p class="gj-contact__intro" data-testid="gj-contact-intro">
        {{ tLocal('intro') }}<br />
        <i18n-t keypath="commercial" tag="span">
          <template #website>
            <a :href="tLocal('websiteUrl')" target="_blank" rel="noopener" class="gj-contact__link">
              www.trendglas-jena.com<span class="sr-only"> {{ tLocal('opensInNewTab') }}</span>
            </a>
          </template>
        </i18n-t>
      </p>

      <div class="gj-contact__columns">
        <address class="gj-contact__details" data-testid="gj-contact-details">
          <p class="gj-contact__item">
            <SfIconLocationOn class="gj-contact__icon" aria-hidden="true" />
            <span>
              <span class="sr-only">{{ tLocal('address') }}: </span>
              {{ SHOP_CONTACT.name }}<br />
              {{ SHOP_CONTACT.street }}<br />
              {{ SHOP_CONTACT.city }}<br />
              {{ tLocal('country') }}
            </span>
          </p>
          <p class="gj-contact__item">
            <SfIconCall class="gj-contact__icon" aria-hidden="true" />
            <span>
              <span class="sr-only">{{ tLocal('phone') }}: </span>
              <a :href="SHOP_CONTACT.phoneHref" class="gj-contact__link">{{ SHOP_CONTACT.phone }}</a>
            </span>
          </p>
          <p class="gj-contact__item">
            <!-- Material "print" icon, the usual symbol for fax (Storefront UI has no fax icon) -->
            <svg class="gj-contact__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"
              />
            </svg>
            <span>
              <span class="sr-only">{{ tLocal('fax') }}: </span>
              {{ SHOP_CONTACT.fax }}
            </span>
          </p>
          <p class="gj-contact__item">
            <SfIconEmail class="gj-contact__icon" aria-hidden="true" />
            <span>
              <span class="sr-only">{{ tLocal('email') }}: </span>
              <a :href="`mailto:${SHOP_CONTACT.email}`" class="gj-contact__link">{{ SHOP_CONTACT.email }}</a>
            </span>
          </p>
        </address>

        <div class="gj-contact__form">
          <GlasJenaContactForm />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Locale } from '#i18n';
import { SfIconCall, SfIconEmail, SfIconLocationOn } from '@storefront-ui/vue';
import GlasJenaContactForm from '../components/GlasJenaContactForm.vue';
import { SHOP_CONTACT } from '../utils/contactForm';

/*
 * Replaces pages/contact.vue (see index.ts), like the LTS contact page: an introduction with the note on commercial
 * inquiries, then the shop's contact data (left) and the contact form (right; stacked on phones). The banner
 * shows the title "Kontakt", so the page has no heading of its own.
 */
defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

definePageMeta({
  layout: false,
  pageType: 'static',
});

const { t: tLocal } = useI18n({ useScope: 'local' });
const { getRobots, setRobotForStaticPage } = useRobots();
const { setPageMeta } = usePageMeta();

setPageMeta(t('contact.label'), 'page');

await getRobots();
setRobotForStaticPage('ContactPage');
</script>

<i18n lang="json">
{
  "en": {
    "intro": "Feel free to contact us, we will deal with your message immediately.",
    "commercial": "Please use the website {website} for commercial inquiries.",
    "websiteUrl": "https://www.trendglas-jena.com/en/contact",
    "opensInNewTab": "(opens in a new tab)",
    "address": "Address",
    "country": "Germany",
    "phone": "Phone",
    "fax": "Fax",
    "email": "Email"
  },
  "de": {
    "intro": "Nehmen Sie Kontakt auf, wir werden Ihre Anfrage umgehend bearbeiten.",
    "commercial": "Für gewerbliche Anfragen nutzen Sie bitte die Webseite {website}.",
    "websiteUrl": "https://www.trendglas-jena.com/contact",
    "opensInNewTab": "(öffnet in neuem Tab)",
    "address": "Adresse",
    "country": "Deutschland",
    "phone": "Telefon",
    "fax": "Fax",
    "email": "E-Mail"
  }
}
</i18n>

<style scoped>
/* Like the LTS page: introduction centred and a little larger, a thin line, then the two columns (max. 992 px) */
.gj-contact {
  max-width: 62rem;
  margin: 0 auto;
  padding: 0.25rem 1.25rem 2.5rem;
}

.gj-contact__intro {
  margin: 0 auto;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #dee2e6;
  font-size: 1.125rem;
  line-height: 1.5;
  text-align: center;
}

.gj-contact__columns {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}

@container (min-width: 768px) {
  .gj-contact__columns {
    grid-template-columns: minmax(14rem, 1fr) 2fr;
  }
}

.gj-contact__details {
  font-style: normal;
  line-height: 1.5;
}

.gj-contact__item {
  display: flex;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
}

.gj-contact__icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  color: var(--gj-slate-blue);
}

.gj-contact__link {
  color: var(--gj-link);
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.gj-contact__link:is(:hover, :focus) {
  color: var(--gj-link-hover);
}
</style>
