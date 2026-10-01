<template>
  <div data-testid="gj-product-carousel-form">
    <EditorFormPanel v-model="textSettingsOpen" :title="getEditorTranslation('text-group-label')">
      <div class="py-2">
        <UiFormLabel for="gj-product-carousel-title">{{ getEditorTranslation('title-label') }}</UiFormLabel>
        <SfInput
          id="gj-product-carousel-title"
          v-model="block.text.title"
          type="text"
          data-testid="gj-product-carousel-title-input"
        />
      </div>
    </EditorFormPanel>

    <EditorFormPanel v-model="sourceSettingsOpen" :title="getEditorTranslation('source-group-label')">
      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('category-label') }}</UiFormLabel>
        <EditorCategorySelect
          v-model="categoryIdModel"
          :base-search-params="{ type: 'in:item', sortBy: 'position_asc,name_asc', with: 'details,clients' }"
          data-testid="gj-product-carousel-category"
        />
      </div>

      <div class="py-2">
        <UiFormLabel for="gj-product-carousel-sort">{{ getEditorTranslation('sort-label') }}</UiFormLabel>
        <SfSelect id="gj-product-carousel-sort" v-model="block.source.sort" data-testid="gj-product-carousel-sort">
          <option v-for="option in PRODUCT_CAROUSEL_SORT_OPTIONS" :key="option.value" :value="option.value">
            {{ getEditorTranslation(option.label) }}
          </option>
        </SfSelect>
      </div>

      <div class="py-2">
        <UiFormLabel for="gj-product-carousel-items">{{ getEditorTranslation('items-label') }}</UiFormLabel>
        <SfInput
          id="gj-product-carousel-items"
          v-model.number="block.source.itemsPerPage"
          type="number"
          min="1"
          :max="PRODUCT_CAROUSEL_MAX_ITEMS"
          data-testid="gj-product-carousel-items"
        />
      </div>
    </EditorFormPanel>
  </div>
</template>

<script setup lang="ts">
import { SfInput, SfSelect } from '@storefront-ui/vue';
import type {
  GlasJenaProductCarouselContent,
  GlasJenaProductCarouselFormProps,
  NormalizedGlasJenaProductCarouselContent,
} from './types';
import {
  PRODUCT_CAROUSEL_MAX_ITEMS,
  PRODUCT_CAROUSEL_SORT_OPTIONS,
  PRODUCT_CAROUSEL_SORT_RANDOM,
} from '../../../utils/home';

const props = defineProps<GlasJenaProductCarouselFormProps>();

const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();
const { findOrDeleteBlockByUuid } = useBlockManager();

/** The block's content, with missing settings filled in so older or partial data stays editable. */
const block = computed<NormalizedGlasJenaProductCarouselContent>(() => {
  const content = (findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ??
    {}) as Partial<GlasJenaProductCarouselContent>;

  if (!content.text) {
    content.text = {};
  }
  content.text.title = content.text.title ?? '';

  if (!content.source) {
    content.source = {};
  }
  content.source.categoryId = content.source.categoryId ?? '';
  content.source.sort = content.source.sort || PRODUCT_CAROUSEL_SORT_RANDOM;
  content.source.itemsPerPage = content.source.itemsPerPage ?? PRODUCT_CAROUSEL_MAX_ITEMS;

  return content as NormalizedGlasJenaProductCarouselContent;
});

const categoryIdModel = computed({
  get: () => block.value.source.categoryId || null,
  set: (value: string | null) => {
    block.value.source.categoryId = value ?? '';
  },
});

const textSettingsOpen = ref(true);
const sourceSettingsOpen = ref(true);
</script>

<i18n lang="json">
{
  "en": {
    "text-group-label": "Text",
    "title-label": "Heading in the bar",
    "source-group-label": "Items",
    "category-label": "Category",
    "sort-label": "Order",
    "sort-random": "Random (like the LTS shop)",
    "sort-recommended": "Recommended",
    "sort-name": "Name A–Z",
    "sort-price-asc": "Price ascending",
    "sort-price-desc": "Price descending",
    "sort-newest": "Newest first",
    "items-label": "Maximum number of items (1–50)"
  },
  "de": {
    "text-group-label": "Text",
    "title-label": "Heading in the bar",
    "source-group-label": "Items",
    "category-label": "Category",
    "sort-label": "Order",
    "sort-random": "Random (like the LTS shop)",
    "sort-recommended": "Recommended",
    "sort-name": "Name A–Z",
    "sort-price-asc": "Price ascending",
    "sort-price-desc": "Price descending",
    "sort-newest": "Newest first",
    "items-label": "Maximum number of items (1–50)"
  }
}
</i18n>
