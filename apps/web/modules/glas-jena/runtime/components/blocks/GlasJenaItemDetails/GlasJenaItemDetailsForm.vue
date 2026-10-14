<template>
  <div data-testid="gj-item-details-form">
    <EditorFormPanel v-model="textSettingsOpen" :title="getEditorTranslation('text-group-label')">
      <div class="py-2">
        <UiFormLabel for="gj-item-details-title">{{ getEditorTranslation('title-label') }}</UiFormLabel>
        <SfInput
          id="gj-item-details-title"
          v-model="block.text.title"
          type="text"
          data-testid="gj-item-details-title-input"
        />
      </div>
      <p class="py-2 typography-text-xs text-neutral-600">{{ getEditorTranslation('fields-hint') }}</p>
    </EditorFormPanel>
  </div>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import type { GlasJenaItemDetailsContent, GlasJenaItemDetailsFormProps } from './types';

const props = defineProps<GlasJenaItemDetailsFormProps>();

const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();
const { findOrDeleteBlockByUuid } = useBlockManager();

/** The block's content, with a missing title filled in so older or partial data stays editable. */
const block = computed(() => {
  const content = (findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ??
    {}) as Partial<GlasJenaItemDetailsContent>;
  if (!content.text) {
    content.text = {};
  }
  content.text.title = content.text.title ?? '';
  return content as { text: { title: string } };
});

const textSettingsOpen = ref(true);
</script>

<i18n lang="json">
{
  "en": {
    "text-group-label": "Text",
    "title-label": "Heading",
    "fields-hint": "Like the LTS shop: item number (variation number), content (variation name in ml), dimensions (H|W|D), availability, manufacturer with address and website. Lines without a value are left out."
  },
  "de": {
    "text-group-label": "Text",
    "title-label": "Heading",
    "fields-hint": "Like the LTS shop: item number (variation number), content (variation name in ml), dimensions (H|W|D), availability, manufacturer with address and website. Lines without a value are left out."
  }
}
</i18n>
