<template>
  <div data-testid="gj-hero-image-form">
    <EditorFormPanel v-model="imageSettingsOpen" :title="getEditorTranslation('image-group-label')">
      <UiResponsiveImagePicker :image="block.image" @add="addImage" @delete="deleteImages" />

      <div class="py-2">
        <UiFormLabel for="gj-hero-image-alt">{{ getEditorTranslation('alt-label') }}</UiFormLabel>
        <SfInput id="gj-hero-image-alt" v-model="block.image.alt" type="text" data-testid="gj-hero-image-alt" />
      </div>

      <p class="py-2 typography-text-xs text-neutral-700">{{ getEditorTranslation('height-hint') }}</p>
    </EditorFormPanel>
  </div>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import type {
  ResponsiveImagePickerAddPayload,
  ResponsiveImagePickerDeletePayload,
} from '~/components/ui/ResponsiveImagePicker/types';
import type { GlasJenaHeroImageContent, GlasJenaHeroImageFormProps } from './types';

const props = defineProps<GlasJenaHeroImageFormProps>();

const { blockUuid } = useSiteConfiguration();
const { allBlocks: data } = useBlocks();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { imageTypes, deleteImage } = usePickerHelper();

/** The block's content, with a missing image object filled in so older or partial data stays editable. */
const block = computed(() => {
  const content = (findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ??
    {}) as Partial<GlasJenaHeroImageContent>;
  if (!content.image) {
    content.image = {};
  }
  content.image.alt = content.image.alt ?? '';
  return content as GlasJenaHeroImageContent;
});

const addImage = ({ image, type, applyToAllSizes }: ResponsiveImagePickerAddPayload) => {
  const targets = applyToAllSizes ? imageTypes : [type];
  targets.forEach((size) => {
    block.value.image[size] = image;
  });
};

const deleteImages = ({ type, applyToAllSizes }: ResponsiveImagePickerDeletePayload) => {
  const targets = applyToAllSizes ? imageTypes : [type];
  targets.forEach((size) => deleteImage(block.value.image, size));
};

const imageSettingsOpen = ref(true);
</script>

<i18n lang="json">
{
  "en": {
    "image-group-label": "Image",
    "alt-label": "Alternative text",
    "height-hint": "The image fills its column and is cropped from the top: 391 px high next to the \"Did you know\" box, below it 47 % of the window width (at most 440 px)."
  },
  "de": {
    "image-group-label": "Image",
    "alt-label": "Alternative text",
    "height-hint": "The image fills its column and is cropped from the top: 391 px high next to the \"Did you know\" box, below it 47 % of the window width (at most 440 px)."
  }
}
</i18n>
