<template>
  <div data-testid="gj-tile-form">
    <EditorFormPanel v-model="textSettingsOpen" :title="getEditorTranslation('text-group-label')">
      <div class="py-2">
        <UiFormLabel for="gj-tile-title">{{ getEditorTranslation('title-label') }}</UiFormLabel>
        <SfInput id="gj-tile-title" v-model="block.text.title" type="text" data-testid="gj-tile-title-input" />
      </div>

      <EditorRichTextEditorForm v-model="block.text.htmlDescription" text-align="left" />

      <div class="py-2 flex items-center justify-between gap-3">
        <UiFormLabel for="gj-tile-collapsible" class="m-0">{{ getEditorTranslation('collapsible-label') }}</UiFormLabel>
        <SfSwitch id="gj-tile-collapsible" v-model="block.collapsibleOnMobile" data-testid="gj-tile-collapsible" />
      </div>
    </EditorFormPanel>

    <EditorFormPanel v-model="buttonSettingsOpen" :title="getEditorTranslation('button-group-label')">
      <div class="py-2">
        <UiFormLabel for="gj-tile-button-label">{{ getEditorTranslation('button-label-label') }}</UiFormLabel>
        <SfInput
          id="gj-tile-button-label"
          v-model="block.button.label"
          type="text"
          data-testid="gj-tile-button-label"
        />
      </div>

      <div class="py-2">
        <UiFormLabel for="gj-tile-button-link">{{ getEditorTranslation('button-link-label') }}</UiFormLabel>
        <SfInput id="gj-tile-button-link" v-model="block.button.link" type="text" data-testid="gj-tile-button-link" />
      </div>

      <div class="py-2 flex items-center justify-between gap-3">
        <UiFormLabel for="gj-tile-button-new-tab" class="m-0">{{ getEditorTranslation('new-tab-label') }}</UiFormLabel>
        <SfSwitch
          id="gj-tile-button-new-tab"
          v-model="block.button.openInNewTab"
          data-testid="gj-tile-button-new-tab"
        />
      </div>
    </EditorFormPanel>

    <EditorFormPanel v-model="layoutSettingsOpen" :title="getEditorTranslation('layout-group-label')">
      <div v-for="field in colorFields" :key="field.key" class="py-2">
        <UiFormLabel>{{ getEditorTranslation(field.label) }}</UiFormLabel>
        <EditorColorPicker v-model="block.layout[field.key]" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="block.layout[field.key]" type="text" :data-testid="`gj-tile-${field.key}`">
              <template #suffix>
                <button
                  type="button"
                  class="border border-neutral-400 rounded-lg cursor-pointer w-10 h-8"
                  :style="{ backgroundColor: color }"
                  :aria-label="getEditorTranslation('color-picker-label')"
                  @mousedown.stop
                  @click.stop="toggle"
                />
              </template>
            </SfInput>
          </template>
        </EditorColorPicker>
      </div>

      <div class="py-2" data-testid="gj-tile-background-image">
        <UiImagePicker
          :label="getEditorTranslation('background-image-label')"
          :image="block.layout.backgroundImage || undefined"
          :placeholder="placeholderImg"
          :dimensions="getEditorTranslation('background-image-hint')"
          selected-image-type="wideScreen"
          @add="setBackgroundImage"
          @delete="removeBackgroundImage"
        />
      </div>
    </EditorFormPanel>
  </div>
</template>

<script setup lang="ts">
import { SfInput, SfSwitch } from '@storefront-ui/vue';
import type { GlasJenaTileContent, GlasJenaTileFormProps, NormalizedGlasJenaTileContent } from './types';
import { TILE_DEFAULT_TEXT_COLOR, TILE_GREEN } from '../../../utils/home';

const props = defineProps<GlasJenaTileFormProps>();

const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();
const { findOrDeleteBlockByUuid } = useBlockManager();

/** The block's content, with missing settings filled in so older or partial data stays editable. */
const block = computed<NormalizedGlasJenaTileContent>(() => {
  const content = (findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ??
    {}) as Partial<GlasJenaTileContent>;

  if (!content.text) {
    content.text = {};
  }
  content.text.title = content.text.title ?? '';
  content.text.htmlDescription = content.text.htmlDescription ?? '';

  if (!content.button) {
    content.button = {};
  }
  content.button.label = content.button.label ?? '';
  content.button.link = content.button.link ?? '';
  content.button.openInNewTab = content.button.openInNewTab ?? false;

  if (!content.layout) {
    content.layout = {};
  }
  content.layout.backgroundColor = content.layout.backgroundColor || TILE_GREEN;
  content.layout.textColor = content.layout.textColor || TILE_DEFAULT_TEXT_COLOR;
  content.layout.backgroundImage = content.layout.backgroundImage ?? '';

  content.collapsibleOnMobile = content.collapsibleOnMobile ?? true;

  return content as NormalizedGlasJenaTileContent;
});

const { placeholderImg } = usePickerHelper();

const setBackgroundImage = ({ image }: { image: string }) => {
  block.value.layout.backgroundImage = image;
};

const removeBackgroundImage = () => {
  block.value.layout.backgroundImage = '';
};

const colorFields = [
  { key: 'backgroundColor', label: 'background-color-label' },
  { key: 'textColor', label: 'text-color-label' },
] as const;

const textSettingsOpen = ref(true);
const buttonSettingsOpen = ref(true);
const layoutSettingsOpen = ref(true);
</script>

<i18n lang="json">
{
  "en": {
    "text-group-label": "Text",
    "title-label": "Title",
    "collapsible-label": "Collapse to the title below 992 px",
    "button-group-label": "\"More\" button",
    "button-label-label": "Label (empty: \"Mehr\" / \"More\")",
    "button-link-label": "Link (empty: no button)",
    "new-tab-label": "Open in a new tab",
    "layout-group-label": "Layout",
    "background-color-label": "Background colour",
    "text-color-label": "Text colour",
    "color-picker-label": "Open colour picker",
    "background-image-label": "Picture on the right edge",
    "background-image-hint": "Shown at its own size on the right edge, vertically centred (Werksverkauf: 286 x 310)"
  },
  "de": {
    "text-group-label": "Text",
    "title-label": "Title",
    "collapsible-label": "Collapse to the title below 992 px",
    "button-group-label": "\"More\" button",
    "button-label-label": "Label (empty: \"Mehr\" / \"More\")",
    "button-link-label": "Link (empty: no button)",
    "new-tab-label": "Open in a new tab",
    "layout-group-label": "Layout",
    "background-color-label": "Background colour",
    "text-color-label": "Text colour",
    "color-picker-label": "Open colour picker",
    "background-image-label": "Picture on the right edge",
    "background-image-hint": "Shown at its own size on the right edge, vertically centred (Werksverkauf: 286 x 310)"
  }
}
</i18n>
