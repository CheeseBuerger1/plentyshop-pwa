<template>
  <dialog
    ref="dialogRef"
    class="gj-lightbox"
    :aria-label="t('label')"
    data-testid="gj-lightbox"
    @close="onClose"
    @click="onClick"
    @keydown="onKeydown"
  >
    <button
      type="button"
      class="gj-image-button gj-image-button--close gj-lightbox__close"
      :aria-label="t('close')"
      :title="t('close')"
      data-testid="gj-lightbox-close"
      @click="close"
    />
    <div class="gj-lightbox__stage" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
      <img
        v-if="current"
        :key="index"
        :src="productImageGetters.getImageUrl(current)"
        :alt="getAlt(current)"
        class="gj-lightbox__image"
        data-testid="gj-lightbox-image"
      />
    </div>
    <template v-if="images.length > 1">
      <button
        type="button"
        class="gj-image-button gj-image-button--previous gj-lightbox__arrow gj-lightbox__arrow--previous"
        :aria-label="t('previous')"
        :title="t('previous')"
        data-testid="gj-lightbox-previous"
        @click="page(-1)"
      />
      <button
        type="button"
        class="gj-image-button gj-image-button--next gj-lightbox__arrow gj-lightbox__arrow--next"
        :aria-label="t('next')"
        :title="t('next')"
        data-testid="gj-lightbox-next"
        @click="page(1)"
      />
      <p class="gj-lightbox__counter" aria-live="polite" data-testid="gj-lightbox-counter">
        {{ t('counter', { current: index + 1, total: images.length }) }}
      </p>
    </template>
  </dialog>
</template>

<script setup lang="ts">
import { productImageGetters } from '@plentymarkets/shop-api';
import type { ImagesData } from '@plentymarkets/shop-api';

/** Horizontal swipe distance that pages to the next or previous picture (px). */
const SWIPE_DISTANCE = 50;

/*
 * Lightbox of the product gallery like the LTS shop (wish of the shop owner, 2026-10-15): a click on the big picture
 * shows it in full size over the darkened page, with arrows (round in a loop), "Bild 2 von 4" and a close button. A
 * native modal dialog: the page behind is inert, the focus stays inside and goes back afterwards, Escape closes.
 * A click on the dark area closes too, the arrow keys and swiping page.
 */
const props = defineProps<{ images: ImagesData[] }>();
const emit = defineEmits<{ close: [index: number] }>();

const { t } = useI18n({ useScope: 'local' });
const dialogRef = ref<HTMLDialogElement | null>(null);
const index = ref(0);
const current = computed(() => props.images[index.value]);

const getAlt = (image: ImagesData) =>
  productImageGetters.getImageAlternate(image) || productImageGetters.getCleanImageName(image) || '';

const page = (direction: number) => {
  const count = props.images.length;
  index.value = (index.value + direction + count) % count;
};

/** Opens the lightbox with the given picture; the page behind does not scroll meanwhile. */
const open = (start: number) => {
  index.value = Math.min(Math.max(start, 0), props.images.length - 1);
  document.documentElement.style.overflow = 'hidden';
  dialogRef.value?.showModal();
};

const close = () => dialogRef.value?.close();

const onClose = () => {
  document.documentElement.style.overflow = '';
  emit('close', index.value);
};

/* The dark area around the picture (the dialog or the stage itself) closes, the picture and buttons not */
const onClick = (event: MouseEvent) => {
  const target = event.target as Element;
  if (target === dialogRef.value || target.classList.contains('gj-lightbox__stage')) {
    close();
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    page(-1);
  } else if (event.key === 'ArrowRight') {
    page(1);
  }
};

let touchStartX = 0;
const onTouchStart = (event: TouchEvent) => {
  touchStartX = event.touches[0]?.clientX ?? 0;
};
const onTouchEnd = (event: TouchEvent) => {
  const distance = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
  if (props.images.length > 1 && Math.abs(distance) >= SWIPE_DISTANCE) {
    page(distance < 0 ? 1 : -1);
  }
};

onBeforeUnmount(() => {
  if (dialogRef.value?.open) {
    document.documentElement.style.overflow = '';
  }
});

defineExpose({ open, close });
</script>

<i18n lang="json">
{
  "en": {
    "label": "Enlarged pictures",
    "close": "Close",
    "previous": "Previous picture",
    "next": "Next picture",
    "counter": "Picture {current} of {total}"
  },
  "de": {
    "label": "Großansicht der Bilder",
    "close": "Schließen",
    "previous": "Vorheriges Bild",
    "next": "Nächstes Bild",
    "counter": "Bild {current} von {total}"
  }
}
</i18n>

<style scoped>
/* Fills the window; the picture as large as it fits between the buttons */
.gj-lightbox {
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: hidden;
}

.gj-lightbox::backdrop {
  background-color: rgb(0 0 0 / 0.85);
}

.gj-lightbox__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 4rem 4.5rem;
}

.gj-lightbox__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  background-color: #fff;
}

.gj-lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
}

.gj-lightbox__arrow {
  position: absolute;
  top: 50%;
  z-index: 1;
  transform: translateY(-50%);
}

.gj-lightbox__arrow--previous {
  left: 1rem;
}

.gj-lightbox__arrow--next {
  right: 1rem;
}

/* White on the darkened page (over 15:1) */
.gj-lightbox__counter {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  margin: 0;
  color: #fff;
  font-size: 1rem;
  transform: translateX(-50%);
}

/* On the dark backdrop the keyboard focus is white */
.gj-lightbox :deep(.gj-image-button:focus-visible) {
  outline-color: #fff;
}

/* Phones: the picture uses the width, the arrows lie on its edges */
@media (max-width: 575.98px) {
  .gj-lightbox__stage {
    padding: 4rem 0.5rem;
  }

  .gj-lightbox__arrow--previous {
    left: 0.5rem;
  }

  .gj-lightbox__arrow--next {
    right: 0.5rem;
  }
}
</style>
