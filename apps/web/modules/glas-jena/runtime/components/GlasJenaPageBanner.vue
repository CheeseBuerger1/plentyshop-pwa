<template>
  <div
    v-if="title"
    class="gj-page-banner"
    :class="{ 'gj-page-banner--category': isCategoryPage }"
    data-testid="gj-page-banner"
  >
    <h1 class="gj-page-banner__title" data-testid="gj-page-banner-title">{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { usePageBanner } from '../composables/usePageBanner';

/* Like the LTS shop ("Fehler 404"); the shop's own error texts are too long for the banner */
const { t } = useI18n({ useScope: 'local' });
const { title, isCategoryPage } = usePageBanner((statusCode) => t('errorTitle', { statusCode }));
</script>

<i18n lang="json">
{
  "en": { "errorTitle": "Error {statusCode}" },
  "de": { "errorTitle": "Fehler {statusCode}" }
}
</i18n>

<style scoped>
/*
 * Banner with the page or category title directly below the header, like the LTS shop: blurred background image,
 * 12 % of the window width high (70–120 px), title centred in Light. As wide as the header box; the overhanging
 * logo lies over its left edge, so the title keeps the logo field's width free on both sides and stays centred.
 * Long titles on phones wrap and the banner grows with them.
 */
.gj-page-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: var(--gj-box-width);
  min-height: clamp(4.375rem, 12vw, 7.5rem);
  margin: 0 auto 1.75rem;
  padding: 0.25rem calc(var(--gj-logo-width) + 0.5rem);
  background: url('../assets/page-banner.jpg') center / cover no-repeat;
}

.gj-page-banner__title {
  margin: 0;
  font-size: 2.5rem;
  line-height: 1.1;
  text-align: center;
  overflow-wrap: break-word;
  color: #555;
}

/* Font sizes and breakpoints of the LTS shop (window width, like the header) */
@media (max-width: 991.98px) {
  .gj-page-banner__title {
    font-size: 2.25rem;
  }
}

@media (max-width: 767.98px) {
  .gj-page-banner__title {
    font-size: 2rem;
  }
}

@media (max-width: 575.98px) {
  .gj-page-banner__title {
    font-size: 1.875rem;
  }
}

@media (max-width: 479.98px) {
  .gj-page-banner__title {
    font-size: 1.5rem;
  }
}
</style>
