import { getHomeSeoTexts } from '../utils/home';

/*
 * Language-specific title and description of the home page (see HOME_SEO_TEXTS). Set with a high priority so they win
 * over the shop's own SEO defaults from app.vue; outside the home page or without texts for the language the values
 * are empty and the shop's defaults apply.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();

  const texts = computed(() =>
    router.currentRoute.value.meta.identifier === HOMEPAGE_IDENTIFIER
      ? getHomeSeoTexts(nuxtApp.$i18n.locale.value)
      : undefined,
  );

  useSeoMeta(
    {
      title: () => texts.value?.title,
      description: () => texts.value?.description,
      ogDescription: () => texts.value?.description,
    },
    { tagPriority: 'high' },
  );
});
