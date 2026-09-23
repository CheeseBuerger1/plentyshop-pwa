<template>
  <section
    data-testid="did-you-know"
    :class="['w-full h-full flex flex-col justify-center', alignmentClass]"
    :style="inlineStyle"
    :aria-label="title || undefined"
    @mouseenter="pauseAutoplay"
    @mouseleave="resumeAutoplay"
    @focusin="pauseAutoplay"
    @focusout="resumeAutoplay"
  >
    <div
      v-if="content.text.showIcon"
      class="flex items-center justify-center size-16 border-2 border-current rounded-full text-4xl font-light"
      aria-hidden="true"
      data-testid="did-you-know-icon"
    >
      ?
    </div>

    <h2 v-if="title" class="mt-4 typography-headline-3 font-light" data-testid="did-you-know-title">
      {{ title }}
    </h2>

    <div class="mt-4 grid w-full" aria-live="polite" data-testid="did-you-know-facts">
      <p
        v-for="(fact, factIndex) in facts"
        :key="factIndex"
        :class="['col-start-1 row-start-1 whitespace-pre-line', factIndex === activeIndex ? 'visible' : 'invisible']"
        :aria-hidden="factIndex !== activeIndex"
        data-testid="did-you-know-fact"
      >
        {{ fact }}
      </p>
    </div>

    <div v-if="hasMultipleFacts" class="mt-6 flex gap-16 self-center">
      <button
        type="button"
        class="flex items-center justify-center size-11"
        :aria-label="t('previousFact')"
        data-testid="did-you-know-previous"
        @click="showPrevious"
      >
        <SfIconChevronLeft size="lg" />
      </button>
      <button
        type="button"
        class="flex items-center justify-center size-11"
        :aria-label="t('nextFact')"
        data-testid="did-you-know-next"
        @click="showNext"
      >
        <SfIconChevronRight size="lg" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SfIconChevronLeft, SfIconChevronRight } from '@storefront-ui/vue';
import type { DidYouKnowProps } from './types';
import { DID_YOU_KNOW_DEFAULT_BACKGROUND_COLOR, DID_YOU_KNOW_DEFAULT_TEXT_COLOR } from './defaults';

const props = defineProps<DidYouKnowProps>();

const { t } = useI18n({ useScope: 'local' });

const MILLISECONDS_PER_SECOND = 1000;

const title = computed(() => props.content.text?.title?.trim() ?? '');
const facts = computed(() => (props.content.text?.facts ?? []).filter((fact) => fact.trim().length > 0));
const hasMultipleFacts = computed(() => facts.value.length > 1);

const activeIndex = ref(0);

const showNext = () => {
  activeIndex.value = (activeIndex.value + 1) % Math.max(facts.value.length, 1);
};

const showPrevious = () => {
  const count = Math.max(facts.value.length, 1);
  activeIndex.value = (activeIndex.value - 1 + count) % count;
};

watch(
  () => facts.value.length,
  (count) => {
    if (activeIndex.value >= count) {
      activeIndex.value = 0;
    }
  },
);

const alignmentClass = computed(() => {
  switch (props.content.text?.textAlignment) {
    case 'left':
      return 'text-left items-start';
    case 'right':
      return 'text-right items-end';
    default:
      return 'text-center items-center';
  }
});

const inlineStyle = computed(() => {
  const layout = props.content.layout ?? {};

  return {
    backgroundColor: layout.backgroundColor || DID_YOU_KNOW_DEFAULT_BACKGROUND_COLOR,
    color: layout.textColor || DID_YOU_KNOW_DEFAULT_TEXT_COLOR,
    paddingTop: `${layout.paddingTop ?? 0}px`,
    paddingBottom: `${layout.paddingBottom ?? 0}px`,
    paddingLeft: `${layout.paddingLeft ?? 0}px`,
    paddingRight: `${layout.paddingRight ?? 0}px`,
  };
});

const autoplayMilliseconds = computed(
  () => Math.max(Number(props.content.autoplay?.interval) || 0, 0) * MILLISECONDS_PER_SECOND,
);
let autoplayTimer: ReturnType<typeof setInterval> | undefined;
const isAutoplayPaused = ref(false);

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  }
};

const startAutoplay = () => {
  stopAutoplay();
  if (!import.meta.client || isAutoplayPaused.value || !hasMultipleFacts.value || autoplayMilliseconds.value === 0) {
    return;
  }
  autoplayTimer = setInterval(showNext, autoplayMilliseconds.value);
};

const pauseAutoplay = () => {
  isAutoplayPaused.value = true;
  stopAutoplay();
};

const resumeAutoplay = () => {
  isAutoplayPaused.value = false;
  startAutoplay();
};

onMounted(startAutoplay);
watch([autoplayMilliseconds, hasMultipleFacts], startAutoplay);
onBeforeUnmount(stopAutoplay);
</script>

<i18n lang="json">
{
  "en": {
    "previousFact": "Previous fact",
    "nextFact": "Next fact"
  },
  "de": {
    "previousFact": "Vorheriger Fakt",
    "nextFact": "Nächster Fakt"
  }
}
</i18n>
