<template>
  <section class="gj-item-details" :aria-labelledby="title ? titleId : undefined" data-testid="gj-item-details">
    <h2 v-if="title" :id="titleId" data-testid="gj-item-details-title">{{ title }}</h2>
    <dl class="gj-item-details__list">
      <div v-for="row in rows" :key="row.key" class="gj-item-details__row" :data-testid="`gj-item-details-${row.key}`">
        <dt>{{ t(row.key) }}:</dt>
        <dd>
          <span v-for="(line, index) in row.lines" :key="index" class="gj-item-details__line">{{ line }}</span>
          <a v-if="row.url" :href="row.url" target="_blank" rel="noopener" class="gj-item-details__link">
            {{ row.url }}
          </a>
        </dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { GlasJenaItemDetailsProps } from './types';
import { getItemDetailRows } from '../../../utils/itemDetails';

/*
 * "Weitere Details" of the product page like the LTS shop: item number (variation number), content (variation name
 * in ml), dimensions (H | B | T), availability and the manufacturer with address and website. The shop's block
 * "More details" (ItemData) knows neither the variation number nor the variation name nor the address.
 */
const props = defineProps<GlasJenaItemDetailsProps>();

const { locale } = useI18n();
const { t } = useI18n({ useScope: 'local' });
const { currentProduct } = useProducts();
const titleId = useId();

const title = computed(() => props.content?.text?.title?.trim() ?? '');
const rows = computed(() =>
  Object.keys(currentProduct.value ?? {}).length ? getItemDetailRows(currentProduct.value, locale.value) : [],
);
</script>

<i18n lang="json">
{
  "en": {
    "itemNumber": "Item number",
    "content": "Capacity",
    "dimensions": "Size (H{'|'}W{'|'}D)",
    "availability": "Availability",
    "manufacturer": "Manufacturer"
  },
  "de": {
    "itemNumber": "Artikelnummer",
    "content": "Inhalt",
    "dimensions": "Maße (H{'|'}B{'|'}T)",
    "availability": "Verfügbarkeit",
    "manufacturer": "Hersteller"
  }
}
</i18n>

<style scoped>
/*
 * Like the LTS shop: label in bold, the value right after it; the manufacturer's address lines and website below
 * each other, aligned with the first line. Text size as in the other two tiles (16 px; the shop's block had 14 px).
 * Padding like the other tiles (24 px, set in the editor there); colour and heading come from glas-jena.css.
 */
.gj-item-details {
  padding: 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

.gj-item-details__list {
  margin: 0;
}

.gj-item-details__row {
  display: flex;
  gap: 0.3em;
  margin-bottom: 0.5rem;
}

.gj-item-details__row > dt {
  flex-shrink: 0;
  font-weight: 600;
}

.gj-item-details__row > dd {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 0;
}

/* Links in the text colour of links (4.5:1 on every tile colour), underlined so they stand out from the text */
.gj-item-details__link {
  margin-top: 0.25rem;
  color: var(--gj-link);
  text-decoration: underline;
  overflow-wrap: anywhere;
}

.gj-item-details__link:hover {
  color: var(--gj-link-hover);
}
</style>
