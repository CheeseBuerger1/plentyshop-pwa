<template>
  <div data-testid="did-you-know-form">
    <EditorFormPanel v-model="textSettingsOpen" :title="getEditorTranslation('text-group-label')">
      <div class="py-2">
        <UiFormLabel for="did-you-know-title">{{ getEditorTranslation('title-label') }}</UiFormLabel>
        <SfInput
          id="did-you-know-title"
          v-model="block.text.title"
          type="text"
          data-testid="did-you-know-title-input"
        />
      </div>

      <div class="py-2 flex items-center justify-between">
        <UiFormLabel for="did-you-know-show-icon" class="m-0">{{
          getEditorTranslation('show-icon-label')
        }}</UiFormLabel>
        <SfSwitch id="did-you-know-show-icon" v-model="block.text.showIcon" data-testid="did-you-know-show-icon" />
      </div>

      <div class="py-2">
        <EditorOptionsTabs
          v-model="textAlignment"
          :legend="getEditorTranslation('text-alignment-label')"
          test-id-prefix="did-you-know-alignment"
          :options="alignmentOptions"
        />
      </div>
    </EditorFormPanel>

    <EditorFormPanel v-model="factsSettingsOpen" :title="getEditorTranslation('facts-group-label')">
      <div
        v-for="(fact, factIndex) in block.text.facts"
        :key="factIndex"
        class="py-2"
        :data-testid="`did-you-know-fact-row-${factIndex}`"
      >
        <div class="flex items-center justify-between mb-1">
          <UiFormLabel :for="`did-you-know-fact-${factIndex}`" class="m-0">
            {{ getEditorTranslation('fact-label') }} {{ factIndex + 1 }}
          </UiFormLabel>
          <div class="flex gap-1">
            <UiButton
              variant="tertiary"
              size="sm"
              square
              :aria-label="getEditorTranslation('move-up-label')"
              :disabled="factIndex === 0"
              :data-testid="`did-you-know-fact-up-${factIndex}`"
              @click="moveFact(factIndex, -1)"
            >
              <SfIconArrowUpward size="sm" />
            </UiButton>
            <UiButton
              variant="tertiary"
              size="sm"
              square
              :aria-label="getEditorTranslation('move-down-label')"
              :disabled="factIndex === block.text.facts.length - 1"
              :data-testid="`did-you-know-fact-down-${factIndex}`"
              @click="moveFact(factIndex, 1)"
            >
              <SfIconArrowDownward size="sm" />
            </UiButton>
            <UiButton
              variant="tertiary"
              size="sm"
              square
              :aria-label="getEditorTranslation('remove-label')"
              :disabled="block.text.facts.length <= MIN_FACTS"
              :data-testid="`did-you-know-fact-remove-${factIndex}`"
              @click="removeFact(factIndex)"
            >
              <SfIconDelete size="sm" />
            </UiButton>
          </div>
        </div>
        <SfTextarea
          :id="`did-you-know-fact-${factIndex}`"
          v-model="block.text.facts[factIndex]"
          class="w-full min-h-24"
          :data-testid="`did-you-know-fact-input-${factIndex}`"
        />
      </div>

      <div class="py-2">
        <UiButton variant="secondary" size="sm" data-testid="did-you-know-add-fact" @click="addFact">
          <template #prefix>
            <SfIconAdd size="sm" />
          </template>
          {{ getEditorTranslation('add-fact-label') }}
        </UiButton>
      </div>

      <div class="py-2">
        <UiFormLabel for="did-you-know-autoplay">{{ getEditorTranslation('autoplay-label') }}</UiFormLabel>
        <SfInput
          id="did-you-know-autoplay"
          v-model.number="block.autoplay.interval"
          type="number"
          min="0"
          data-testid="did-you-know-autoplay"
        />
      </div>
    </EditorFormPanel>

    <EditorFormPanel v-model="layoutSettingsOpen" :title="getEditorTranslation('layout-group-label')">
      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('background-color-label') }}</UiFormLabel>
        <EditorColorPicker v-model="block.layout.backgroundColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="block.layout.backgroundColor" type="text" data-testid="did-you-know-background-color">
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

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('text-color-label') }}</UiFormLabel>
        <EditorColorPicker v-model="block.layout.textColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="block.layout.textColor" type="text" data-testid="did-you-know-text-color">
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

      <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="resolvedUuid" />

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('padding-label') }}</UiFormLabel>
        <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
            <SfIconArrowUpward />
            <input
              v-model.number="block.layout.paddingTop"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="did-you-know-padding-top"
              aria-label="Top padding"
            />
          </div>
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
            <SfIconArrowDownward />
            <input
              v-model.number="block.layout.paddingBottom"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="did-you-know-padding-bottom"
              aria-label="Bottom padding"
            />
          </div>
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
            <SfIconArrowBack />
            <input
              v-model.number="block.layout.paddingLeft"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="did-you-know-padding-left"
              aria-label="Left padding"
            />
          </div>
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white">
            <SfIconArrowForward />
            <input
              v-model.number="block.layout.paddingRight"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="did-you-know-padding-right"
              aria-label="Right padding"
            />
          </div>
        </div>
      </div>
    </EditorFormPanel>
  </div>
</template>

<script setup lang="ts">
import {
  SfInput,
  SfSwitch,
  SfTextarea,
  SfIconAdd,
  SfIconDelete,
  SfIconArrowUpward,
  SfIconArrowDownward,
  SfIconArrowBack,
  SfIconArrowForward,
} from '@storefront-ui/vue';
import type {
  DidYouKnowContent,
  DidYouKnowFormProps,
  DidYouKnowTextAlignment,
  NormalizedDidYouKnowContent,
} from './types';
import { DID_YOU_KNOW_DEFAULT_BACKGROUND_COLOR, DID_YOU_KNOW_DEFAULT_TEXT_COLOR } from './defaults';

const MIN_FACTS = 1;

const props = defineProps<DidYouKnowFormProps>();

const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();
const { findOrDeleteBlockByUuid } = useBlockManager();

const resolvedUuid = computed(() => props.uuid || blockUuid.value);

/** The block's content, with missing settings filled in so older or partial data stays editable. */
const block = computed<NormalizedDidYouKnowContent>(() => {
  const content = (findOrDeleteBlockByUuid(data.value, resolvedUuid.value)?.content ??
    {}) as Partial<DidYouKnowContent>;

  if (!content.text) {
    content.text = {};
  }
  content.text.title = content.text.title ?? '';
  content.text.showIcon = content.text.showIcon ?? true;
  content.text.textAlignment = content.text.textAlignment ?? 'center';
  if (!content.text.facts?.length) {
    content.text.facts = [''];
  }

  if (!content.autoplay) {
    content.autoplay = {};
  }
  content.autoplay.interval = content.autoplay.interval ?? 0;

  if (!content.layout) {
    content.layout = {};
  }
  content.layout.backgroundColor = content.layout.backgroundColor || DID_YOU_KNOW_DEFAULT_BACKGROUND_COLOR;
  content.layout.textColor = content.layout.textColor || DID_YOU_KNOW_DEFAULT_TEXT_COLOR;

  return content as NormalizedDidYouKnowContent;
});

const textAlignment = computed<DidYouKnowTextAlignment>({
  get: () => block.value.text.textAlignment ?? 'center',
  set: (value) => {
    block.value.text.textAlignment = value;
  },
});

const alignmentOptions = computed(() => [
  { value: 'left' as const, label: getEditorTranslation('alignment-left-label') },
  { value: 'center' as const, label: getEditorTranslation('alignment-center-label') },
  { value: 'right' as const, label: getEditorTranslation('alignment-right-label') },
]);

const { isFullWidth } = useFullWidthToggleForContent(block);

const addFact = () => {
  block.value.text.facts.push('');
};

const removeFact = (index: number) => {
  if (block.value.text.facts.length <= MIN_FACTS) {
    return;
  }
  block.value.text.facts.splice(index, 1);
};

const moveFact = (index: number, direction: -1 | 1) => {
  const facts = block.value.text.facts;
  const target = index + direction;
  if (target < 0 || target >= facts.length) {
    return;
  }
  const [fact] = facts.splice(index, 1);
  facts.splice(target, 0, fact ?? '');
};

const textSettingsOpen = ref(true);
const factsSettingsOpen = ref(true);
const layoutSettingsOpen = ref(true);
</script>

<i18n lang="json">
{
  "en": {
    "text-group-label": "Text",
    "title-label": "Title",
    "show-icon-label": "Show question mark icon",
    "text-alignment-label": "Text alignment",
    "alignment-left-label": "Left",
    "alignment-center-label": "Center",
    "alignment-right-label": "Right",
    "facts-group-label": "Facts",
    "fact-label": "Fact",
    "move-up-label": "Move fact up",
    "move-down-label": "Move fact down",
    "remove-label": "Remove fact",
    "add-fact-label": "Add fact",
    "autoplay-label": "Autoplay interval in seconds (0 = off)",
    "layout-group-label": "Layout",
    "background-color-label": "Background colour",
    "text-color-label": "Text colour",
    "color-picker-label": "Open colour picker",
    "padding-label": "Padding"
  },
  "de": {
    "text-group-label": "Text",
    "title-label": "Title",
    "show-icon-label": "Show question mark icon",
    "text-alignment-label": "Text alignment",
    "alignment-left-label": "Left",
    "alignment-center-label": "Center",
    "alignment-right-label": "Right",
    "facts-group-label": "Facts",
    "fact-label": "Fact",
    "move-up-label": "Move fact up",
    "move-down-label": "Move fact down",
    "remove-label": "Remove fact",
    "add-fact-label": "Add fact",
    "autoplay-label": "Autoplay interval in seconds (0 = off)",
    "layout-group-label": "Layout",
    "background-color-label": "Background colour",
    "text-color-label": "Text colour",
    "color-picker-label": "Open colour picker",
    "padding-label": "Padding"
  }
}
</i18n>
