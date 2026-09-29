<template>
  <div class="w-full p-5 overflow-x-auto break-words no-preflight" v-html="getHTMLTexts()" />
  <GlasJenaCancellationForm />
</template>

<script setup lang="ts">
import type { Locale } from '#i18n';
import GlasJenaCancellationForm from '../components/GlasJenaCancellationForm.vue';

/*
 * Replaces pages/cancellation-rights.vue (see index.ts), like the LTS page "Widerrufsbelehrung & Widerrufsformular":
 * the legal text of the cancellation form from the plentymarkets system ("WithdrawalForm", the text the shop's
 * /cancellation-form page shows as well), followed by the shop's cancellation form. The legal text box stays a
 * direct child of main, as glas-jena.css styles it there. Banner title: see OWN_PAGE_BANNER_TITLE_KEYS.
 */
defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const { t } = useI18n({ useScope: 'local' });
const { data, getLegalTexts } = useLegalInformation();
const { getRobots, setRobotForStaticPage } = useRobots();
const { setPageMeta } = usePageMeta();

definePageMeta({
  pageType: 'static',
});

await getLegalTexts({
  type: 'WithdrawalForm',
});

const getHTMLTexts = () => {
  return data.value.htmlText ?? '';
};

const icon = 'page';
setPageMeta(t('pageTitle'), icon);

await getRobots();
setRobotForStaticPage('CancellationRights');
</script>

<i18n lang="json">
{
  "en": { "pageTitle": "Power of revocation, Revocation form" },
  "de": { "pageTitle": "Widerrufsbelehrung & Widerrufsformular" }
}
</i18n>
