<template>
  <div class="w-full p-5 overflow-x-auto break-words no-preflight" v-html="getHTMLTexts()" />
  <GlasJenaCancellationForm />
</template>

<script setup lang="ts">
import type { Locale } from '#i18n';
import GlasJenaCancellationForm from '../components/GlasJenaCancellationForm.vue';

/*
 * Replaces pages/cancellation-rights.vue (see index.ts): the cancellation policy from the plentymarkets system like
 * the original page, followed by the shop's cancellation form, like the LTS page "Widerrufsbelehrung &
 * Widerrufsformular". The legal text box stays a direct child of main, as glas-jena.css styles it there.
 */
defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const { data, getLegalTexts } = useLegalInformation();
const { getRobots, setRobotForStaticPage } = useRobots();
const { setPageMeta } = usePageMeta();

definePageMeta({
  pageType: 'static',
});

await getLegalTexts({
  type: 'CancellationRights',
});

const getHTMLTexts = () => {
  return data.value.htmlText ?? '';
};

const icon = 'page';
setPageMeta(t('legal.cancellationRights'), icon);

await getRobots();
setRobotForStaticPage('CancellationRights');
</script>
