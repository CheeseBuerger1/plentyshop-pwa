<template>
  <ShopBreadcrumbs :breadcrumbs="breadcrumbs" />
</template>

<script setup lang="ts">
import ShopBreadcrumbs from '~/components/ui/Breadcrumbs/Breadcrumbs.vue';
import type { BreadcrumbsProps } from '~/components/ui/Breadcrumbs/types';
import { GLAS_JENA_BREADCRUMBS_KEY, getBreadcrumbListJsonLd } from '../utils/seo';

/*
 * The shop's breadcrumbs unchanged, but for search engines with the names that they show and absolute addresses.
 * The shop builds its JSON-LD from the parts of the URL ("kueche-helfer", and "en" on English pages); the module's
 * plugin seo.ts removes it when this one is there.
 */
const props = defineProps<BreadcrumbsProps>();

const route = useRoute();
const localePath = useLocalizedPath();
const { applyToUrl } = useUrlTrailingSlash();
const domain = useRuntimeConfig().public.domain;

const jsonLd = computed(() =>
  getBreadcrumbListJsonLd(
    props.breadcrumbs.map((breadcrumb, index) => ({
      name: breadcrumb.name,
      /* The last entry is the page itself (on item pages its link is "#") */
      url: applyToUrl(`${domain}${index === props.breadcrumbs.length - 1 ? route.path : localePath(breadcrumb.link)}`),
    })),
  ),
);

useHead({
  script: [
    {
      key: GLAS_JENA_BREADCRUMBS_KEY,
      type: 'application/ld+json',
      innerHTML: computed(() => safeSerializeJsonLd(jsonLd.value)),
    },
  ],
});
</script>
