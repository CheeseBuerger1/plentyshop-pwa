<template>
  <section
    class="gj-tile"
    :class="{ 'gj-tile--collapsed': isCollapsed }"
    :style="tileStyle"
    :aria-labelledby="title ? titleId : undefined"
    data-testid="gj-tile"
  >
    <h2 v-if="title" :id="titleId" class="gj-tile__title" data-testid="gj-tile-title">
      <button
        v-if="isCollapsible"
        type="button"
        class="gj-tile__toggle"
        :aria-expanded="isOpen"
        :aria-controls="bodyId"
        data-testid="gj-tile-toggle"
        @click="toggle"
      >
        {{ title }}
        <svg class="gj-tile__chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 9l7 7 7-7" />
        </svg>
      </button>
      <template v-else>{{ title }}</template>
    </h2>

    <div v-show="!isCollapsed" :id="bodyId" class="gj-tile__body" data-testid="gj-tile-body">
      <TextContent v-if="htmlDescription" :text="textContent" class="gj-tile__text" />

      <NuxtLink
        v-if="moreLink"
        :to="moreLink"
        class="gj-tile__more"
        :aria-describedby="title ? titleId : undefined"
        v-bind="openInNewTab ? { target: '_blank', rel: 'noopener' } : {}"
        data-testid="gj-tile-more"
      >
        {{ moreLabel }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { GlasJenaTileProps } from './types';
import { DESKTOP_NAVIGATION_BREAKPOINT } from '../../../utils/navigation';
import { TILE_DEFAULT_TEXT_COLOR } from '../../../utils/home';

/*
 * Coloured tile of the home page like the LTS shop ("Werksverkauf", "Unser hitzebeständiges Glas"): title, text,
 * optional picture on the right edge and a "Mehr" link in the lower right corner. Below the desktop navigation
 * (992 px window width) it can be collapsed to its title like in the LTS shop; unlike there the title is a real
 * button (keyboard, screen readers), and the text stays in the HTML for search engines.
 */
const props = defineProps<GlasJenaTileProps>();

const { t } = useI18n({ useScope: 'local' });
const viewport = useViewport();
const router = useRouter();
const localizedPath = useLocalizedPath();

const titleId = useId();
const bodyId = useId();

const title = computed(() => props.content?.text?.title?.trim() ?? '');
const htmlDescription = computed(() => props.content?.text?.htmlDescription ?? '');
const textColor = computed(() => props.content?.layout?.textColor || TILE_DEFAULT_TEXT_COLOR);
const textContent = computed(() => ({
  htmlDescription: htmlDescription.value,
  textAlignment: 'left' as const,
  color: textColor.value,
}));

const moreLink = computed(() => {
  const link = props.content?.button?.link?.trim();
  if (!link) {
    return '';
  }
  return isInternalLink(link, router) ? localizedPath(link) : link;
});
const moreLabel = computed(() => props.content?.button?.label?.trim() || t('more'));
const openInNewTab = computed(() => props.content?.button?.openInNewTab === true);

const isCollapsible = computed(
  () =>
    props.content?.collapsibleOnMobile !== false &&
    Boolean(title.value) &&
    viewport.isLessThan(DESKTOP_NAVIGATION_BREAKPOINT),
);
const isOpen = ref(false);
const isCollapsed = computed(() => isCollapsible.value && !isOpen.value);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const tileStyle = computed(() => {
  const layout = props.content?.layout ?? {};
  const image = layout.backgroundImage?.trim();
  return {
    backgroundColor: layout.backgroundColor || 'transparent',
    color: textColor.value,
    backgroundImage: image ? `url("${image}")` : undefined,
  };
});
</script>

<i18n lang="json">
{
  "en": { "more": "More" },
  "de": { "more": "Mehr" }
}
</i18n>

<style scoped>
/*
 * Measurements of the LTS shop, scaled from its 14 px to the shop's 16 px base font: at least 388 px high (the text
 * is larger, so the tile grows instead of cutting it off; tiles side by side in the grid share the height), title
 * 30 px from the top in Light, text 50 px from the sides with line height 1.5. Room at the bottom for "Mehr".
 */
.gj-tile {
  position: relative;
  height: 100%;
  padding-bottom: 3rem;
  background-position: right center;
  background-repeat: no-repeat;
}

.gj-tile__title {
  margin: 0;
  padding: 1.875rem 1rem 1.25rem;
  font-size: 1.8rem;
  line-height: 1.1;
  text-align: center;
}

.gj-tile__toggle {
  position: relative;
  width: 100%;
  padding: 0 3rem;
  font: inherit;
  color: inherit;
  text-align: center;
  cursor: pointer;
}

/* Chevron on the right edge like the LTS shop, in the text colour (the LTS light blue had 1.38:1 on the green) */
.gj-tile__chevron {
  position: absolute;
  top: 50%;
  right: 0;
  width: 2rem;
  height: 2rem;
  transform: translateY(-50%);
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.gj-tile__toggle[aria-expanded='true'] .gj-tile__chevron {
  transform: translateY(-50%) rotate(180deg);
}

.gj-tile__toggle:focus-visible,
.gj-tile__more:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -4px;
}

.gj-tile__text {
  padding: 0.625rem 3.125rem 0;
  line-height: 1.5;
}

.gj-tile__text :deep(p) {
  margin-bottom: 1rem;
}

.gj-tile__text :deep(strong) {
  font-weight: 600;
}

/* The small raised "IN" of the name "GLAS IN JENA" (like the LTS shop: 9 px at 14 px, upper case) */
.gj-tile__text :deep(sup) {
  margin: 0 0.125rem;
  font-size: 0.65em;
  text-transform: uppercase;
}

/* Links in the text colour (dark blue would be unreadable on the blue tile), underlined to tell them apart */
.gj-tile__text :deep(.rte-prose a) {
  color: inherit;
}

/* Check marks of lists in the text colour (white on the blue tile, like the LTS shop) */
.gj-tile__text :deep(.rte-prose--render ul li::before) {
  background: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='21' height='16' viewBox='0 0 21 16'%3E%3Cpath d='M1.5 8.5l6 6L19.5 1.5' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E")
    no-repeat;
}

/* List items in Light, as requested by the shop owner (the shop font has no weight between 300 and 400) */
.gj-tile__text :deep(li) {
  font-weight: 300;
}

/*
 * "Mehr" in the lower right corner, a light translucent area like the LTS shop. Unlike there with dark text
 * (#263238: 12:1 on the green, 7.8:1 on the blue tile; the LTS #eee reached only 1.0:1 and 2.0:1); on hover the
 * area turns white like in the LTS shop.
 */
.gj-tile__more {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0.625rem 1.875rem;
  font-size: 1.125rem;
  font-weight: 300;
  color: #263238;
  text-decoration: none;
  background-color: rgb(255 255 255 / 60%);
  transition: background-color 0.3s ease-in-out;
}

.gj-tile__more:hover {
  background-color: #fff;
}

@media (prefers-reduced-motion: reduce) {
  .gj-tile__more {
    transition: none;
  }
}

/* Collapsed: only the title row, like the LTS shop */
.gj-tile--collapsed {
  padding-bottom: 0;
}

/*
 * The minimum height only side by side: the shop's grid block stacks its columns below 1024 px (its tablet
 * breakpoint; the LTS shop below 992 px), stacked tiles only need the height of their content.
 */
@media (min-width: 1024px) {
  .gj-tile {
    min-height: 24.25rem;
  }
}
</style>
