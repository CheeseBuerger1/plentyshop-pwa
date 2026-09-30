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

      <div class="py-2 flex items-center justify-between gap-3">
        <UiFormLabel for="gj-tile-button-whole-tile" class="m-0">{{
          getEditorTranslation('whole-tile-label')
        }}</UiFormLabel>
        <SfSwitch
          id="gj-tile-button-whole-tile"
          v-model="block.button.linkWholeTile"
          data-testid="gj-tile-button-whole-tile"
        />
      </div>
    </EditorFormPanel>

    <EditorFormPanel v-model="imageSettingsOpen" :title="getEditorTranslation('image-group-label')">
      <div class="py-2" data-testid="gj-tile-image-picker">
        <UiImagePicker
          :label="getEditorTranslation('image-label')"
          :image="block.image.url || undefined"
          :placeholder="placeholderImg"
          :dimensions="getEditorTranslation('image-hint')"
          selected-image-type="wideScreen"
          @add="setImage"
          @delete="removeImage"
        />
      </div>

      <div class="py-2">
        <UiFormLabel for="gj-tile-image-alt">{{ getEditorTranslation('image-alt-label') }}</UiFormLabel>
        <SfInput id="gj-tile-image-alt" v-model="block.image.alt" type="text" data-testid="gj-tile-image-alt" />
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
  content.button.linkWholeTile = content.button.linkWholeTile ?? false;

  if (!content.image) {
    content.image = {};
  }
  content.image.url = content.image.url ?? '';
  content.image.alt = content.image.alt ?? '';

  if (!content.layout) {
    content.layout = {};
  }
  content.layout.backgroundColor = content.layout.backgroundColor || TILE_GREEN;
  content.layout.textColor = content.layout.textColor || TILE_DEFAULT_TEXT_COLOR;
  content.layout.titleColor = content.layout.titleColor ?? '';
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

const setImage = ({ image }: { image: string }) => {
  block.value.image.url = image;
};

const removeImage = () => {
  block.value.image.url = '';
};

const colorFields = [
  { key: 'backgroundColor', label: 'background-color-label' },
  { key: 'textColor', label: 'text-color-label' },
  { key: 'titleColor', label: 'title-color-label' },
] as const;

const textSettingsOpen = ref(true);
const buttonSettingsOpen = ref(true);
const imageSettingsOpen = ref(true);
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
    "whole-tile-label": "Whole tile opens the link",
    "image-group-label": "Picture below the title",
    "image-label": "Picture",
    "image-hint": "Centred below the title at its own size (e.g. category tiles)",
    "image-alt-label": "Alternative text (empty if the title says it all)",
    "title-color-label": "Title colour (empty: text colour)",
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
    "whole-tile-label": "Whole tile opens the link",
    "image-group-label": "Picture below the title",
    "image-label": "Picture",
    "image-hint": "Centred below the title at its own size (e.g. category tiles)",
    "image-alt-label": "Alternative text (empty if the title says it all)",
    "title-color-label": "Title colour (empty: text colour)",
    "layout-group-label": "Layout",
    "background-color-label": "Background colour",
    "text-color-label": "Text colour",
    "color-picker-label": "Open colour picker",
    "background-image-label": "Picture on the right edge",
    "background-image-hint": "Shown at its own size on the right edge, vertically centred (Werksverkauf: 286 x 310)"
  }
}
</i18n>
