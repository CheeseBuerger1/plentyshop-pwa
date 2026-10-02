<template>
  <div data-testid="gj-hero-image-form">
    <EditorFormPanel v-model="imageSettingsOpen" :title="getEditorTranslation('images-group-label')">
      <p class="py-2 typography-text-xs text-neutral-700">{{ getEditorTranslation('images-hint') }}</p>

      <div
        v-for="(slide, slideIndex) in block.slides"
        :key="slideIndex"
        class="py-2 border-b border-neutral-200"
        :data-testid="`gj-hero-image-slide-${slideIndex}`"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="typography-text-sm font-medium">
            {{ getEditorTranslation('image-label') }} {{ slideIndex + 1 }}
          </span>
          <div class="flex gap-1">
            <UiButton
              variant="tertiary"
              size="sm"
              square
              :aria-label="getEditorTranslation('move-up-label')"
              :disabled="slideIndex === 0"
              :data-testid="`gj-hero-image-slide-up-${slideIndex}`"
              @click="moveSlide(slideIndex, -1)"
            >
              <SfIconArrowUpward size="sm" />
            </UiButton>
            <UiButton
              variant="tertiary"
              size="sm"
              square
              :aria-label="getEditorTranslation('move-down-label')"
              :disabled="slideIndex === block.slides.length - 1"
              :data-testid="`gj-hero-image-slide-down-${slideIndex}`"
              @click="moveSlide(slideIndex, 1)"
            >
              <SfIconArrowDownward size="sm" />
            </UiButton>
            <UiButton
              variant="tertiary"
              size="sm"
              square
              :aria-label="getEditorTranslation('remove-label')"
              :disabled="block.slides.length <= 1"
              :data-testid="`gj-hero-image-slide-remove-${slideIndex}`"
              @click="removeSlide(slideIndex)"
            >
              <SfIconDelete size="sm" />
            </UiButton>
          </div>
        </div>

        <div v-for="field in URL_FIELDS" :key="field" class="py-1">
          <UiFormLabel :for="`gj-hero-image-${field}-${slideIndex}`">{{
            getEditorTranslation(`${field}-label`)
          }}</UiFormLabel>
          <SfInput
            :id="`gj-hero-image-${field}-${slideIndex}`"
            v-model="slide[field]"
            type="url"
            :data-testid="`gj-hero-image-${field}-${slideIndex}`"
          />
        </div>
        <div class="py-1">
          <UiFormLabel :for="`gj-hero-image-alt-${slideIndex}`">{{ getEditorTranslation('alt-label') }}</UiFormLabel>
          <SfInput
            :id="`gj-hero-image-alt-${slideIndex}`"
            v-model="slide.alt"
            type="text"
            :data-testid="`gj-hero-image-alt-${slideIndex}`"
          />
        </div>
      </div>

      <div class="py-2">
        <UiButton variant="secondary" size="sm" data-testid="gj-hero-image-add-slide" @click="addSlide">
          <template #prefix>
            <SfIconAdd size="sm" />
          </template>
          {{ getEditorTranslation('add-image-label') }}
        </UiButton>
      </div>

      <div class="py-2">
        <UiFormLabel for="gj-hero-image-interval">{{ getEditorTranslation('interval-label') }}</UiFormLabel>
        <SfInput
          id="gj-hero-image-interval"
          v-model.number="block.interval"
          type="number"
          :min="HERO_SLIDER_MIN_INTERVAL"
          data-testid="gj-hero-image-interval"
        />
      </div>

      <p class="py-2 typography-text-xs text-neutral-700">{{ getEditorTranslation('height-hint') }}</p>
    </EditorFormPanel>
  </div>
</template>

<script setup lang="ts">
import { SfIconAdd, SfIconArrowDownward, SfIconArrowUpward, SfIconDelete, SfInput } from '@storefront-ui/vue';
import type { GlasJenaHeroImageContent, GlasJenaHeroImageFormProps } from './types';
import { HERO_SLIDER_DEFAULT_INTERVAL, HERO_SLIDER_MIN_INTERVAL, getHeroSlides } from '../../../utils/home';

/** Image sizes of a slide, largest first (labels say the expected width). */
const URL_FIELDS = ['large', 'medium', 'small'] as const;

const props = defineProps<GlasJenaHeroImageFormProps>();

const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();
const { findOrDeleteBlockByUuid } = useBlockManager();

/*
 * The block's content. Data of the first version (one image in `image`) becomes the first slide, a missing time the
 * default, so older or partial data stays editable.
 */
const block = computed(() => {
  const content = (findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ??
    {}) as GlasJenaHeroImageContent;
  if (!content.slides?.length) {
    const slides = getHeroSlides(content);
    content.slides = slides.length ? slides : [{ large: '', medium: '', small: '', alt: '' }];
  }
  content.interval = content.interval ?? HERO_SLIDER_DEFAULT_INTERVAL;
  return content as Required<Pick<GlasJenaHeroImageContent, 'slides' | 'interval'>> & GlasJenaHeroImageContent;
});

const addSlide = () => {
  block.value.slides.push({ large: '', medium: '', small: '', alt: '' });
};

const removeSlide = (index: number) => {
  block.value.slides.splice(index, 1);
};

const moveSlide = (index: number, direction: number) => {
  const target = index + direction;
  const slides = block.value.slides;
  if (target < 0 || target >= slides.length) {
    return;
  }
  const [slide] = slides.splice(index, 1);
  if (slide) {
    slides.splice(target, 0, slide);
  }
};

const imageSettingsOpen = ref(true);
</script>

<i18n lang="json">
{
  "en": {
    "images-group-label": "Images",
    "images-hint": "Several images change one after the other and cross-fade. Give each image as URL in three widths (about 1000, 800 and 500 px); the browser loads the one that fits the window.",
    "image-label": "Image",
    "large-label": "Large image (1000 px)",
    "medium-label": "Medium image (800 px)",
    "small-label": "Small image (500 px)",
    "alt-label": "Alternative text",
    "add-image-label": "Add image",
    "move-up-label": "Move up",
    "move-down-label": "Move down",
    "remove-label": "Remove image",
    "interval-label": "Seconds per image",
    "height-hint": "The images fill their column and are cropped from the top: 391 px high next to the \"Did you know\" box, below it 47 % of the window width (at most 440 px)."
  },
  "de": {
    "images-group-label": "Images",
    "images-hint": "Several images change one after the other and cross-fade. Give each image as URL in three widths (about 1000, 800 and 500 px); the browser loads the one that fits the window.",
    "image-label": "Image",
    "large-label": "Large image (1000 px)",
    "medium-label": "Medium image (800 px)",
    "small-label": "Small image (500 px)",
    "alt-label": "Alternative text",
    "add-image-label": "Add image",
    "move-up-label": "Move up",
    "move-down-label": "Move down",
    "remove-label": "Remove image",
    "interval-label": "Seconds per image",
    "height-hint": "The images fill their column and are cropped from the top: 391 px high next to the \"Did you know\" box, below it 47 % of the window width (at most 440 px)."
  }
}
</i18n>
