<template>
  <div
    v-if="title"
    class="gj-page-banner"
    :class="{ 'gj-page-banner--category': isItemCategoryPage }"
    :data-gj-route="routeBaseName"
    data-testid="gj-page-banner"
  >
    <h1 class="gj-page-banner__title" data-testid="gj-page-banner-title">
      <!-- Part of the heading: "Teekannen › mit Glasfilter kleiner 1 L" for search engines and screen readers -->
      <span v-if="kicker.length" class="gj-page-banner__kicker" data-testid="gj-page-banner-kicker">
        <template v-for="(name, index) in kicker" :key="index">
          <span v-if="index > 0" aria-hidden="true"> › </span>{{ name }}
        </template>
        <span class="sr-only">: </span>
      </span>
      {{ title }}
    </h1>
  </div>
</template>

<script setup lang="ts">
import { usePageBanner } from '../composables/usePageBanner';

/*
 * Own banner texts like the LTS shop: error pages ("Fehler 404"; the shop's own error texts are too long for the
 * banner) and the cancellation page, which holds the policy and the form ("Widerrufsbelehrung & Widerrufsformular").
 */
const { t } = useI18n({ useScope: 'local' });
const { title, kicker, isItemCategoryPage, routeBaseName } = usePageBanner((key, params) =>
  params ? t(key, params) : t(key),
);
</script>

<i18n lang="json">
{
  "en": { "errorTitle": "Error {statusCode}", "cancellationRightsTitle": "Power of revocation, Revocation form" },
  "de": { "errorTitle": "Fehler {statusCode}", "cancellationRightsTitle": "Widerrufsbelehrung & Widerrufsformular" }
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

/*
 * Line above the title on deeper categories (the categories above): small, regular weight, same colour. Not in the
 * LTS shop; there "mit Glasfilter" or "kleiner 1 L" stand alone.
 */
.gj-page-banner__kicker {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.3;
}

@media (max-width: 767.98px) {
  .gj-page-banner__kicker {
    font-size: 1rem;
  }
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
