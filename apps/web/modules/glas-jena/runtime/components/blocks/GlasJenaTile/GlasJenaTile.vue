<template>
  <section
    class="gj-tile"
    :class="{ 'gj-tile--collapsed': isCollapsed, 'gj-tile--linked': isLinkedTile }"
    :style="tileStyle"
    :aria-labelledby="title ? titleId : undefined"
    data-testid="gj-tile"
  >
    <h2 v-if="title" :id="titleId" class="gj-tile__title" :style="titleStyle" data-testid="gj-tile-title">
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
      <div v-if="image.url" class="gj-tile__image-box">
        <img :src="image.url" :alt="image.alt" class="gj-tile__image" loading="lazy" data-testid="gj-tile-image" />
      </div>

      <TextContent v-if="htmlDescription" :text="textContent" class="gj-tile__text" />

      <NuxtLink
        v-if="moreLink"
        :to="moreLink"
        class="gj-tile__more"
        :aria-describedby="title ? titleId : undefined"
        v-bind="openInNewTab ? { target: '_blank', rel: 'noopener' } : {}"
        data-testid="gj-tile-more"
      >
        <span>{{ moreLabel }}</span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { GlasJenaTileProps } from './types';
import { DESKTOP_NAVIGATION_BREAKPOINT } from '../../../utils/navigation';
import { TILE_DEFAULT_TEXT_COLOR } from '../../../utils/home';

/*
 * Coloured tile of the home page like the LTS shop ("Werksverkauf", "Unser hitzebeständiges Glas", category tiles):
 * title (optionally in its own colour), text, optional picture on the right edge or centred below the title and a
 * "Mehr" link in the lower right corner, which can cover the whole tile. Below the desktop navigation
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
/* The whole tile opens the "Mehr" link (category tiles); the link stays the only one, its area covers the tile */
const isLinkedTile = computed(() => props.content?.button?.linkWholeTile === true && Boolean(moreLink.value));

const image = computed(() => ({
  url: props.content?.image?.url?.trim() ?? '',
  alt: props.content?.image?.alt?.trim() ?? '',
}));
const titleStyle = computed(() => {
  const color = props.content?.layout?.titleColor?.trim();
  return color ? { color } : undefined;
});

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
 * "Mehr" in the lower right corner, a light translucent area (45 % white, as requested by the shop owner) like the
 * LTS shop. Unlike there with dark text (#263238: 11.7:1 on the green, 6.3:1 on the blue tile; the LTS #eee reached
 * only 1.0:1 and 2.0:1); on hover the area turns white like in the LTS shop.
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
  background-color: rgb(255 255 255 / 45%);
  transition: background-color 0.3s ease-in-out;
}

.gj-tile__more:hover {
  background-color: #fff;
}

/*
 * Picture centred below the title (category tiles, the LTS pictures with the tile colour as background), at its own
 * size and at most 228 px high, standing on the bottom of an equally high area, so the pictures of tiles side by
 * side (207 and 228 px) stand on one line. With the whole tile as link it grows slightly on hover (LTS: 6 %, from
 * 576 px window width).
 */
.gj-tile__image-box {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 14.25rem;
  margin-top: 1.25rem;
}

.gj-tile__image {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.4s cubic-bezier(0, 0, 0.26, 1);
}

@media (min-width: 576px) {
  .gj-tile--linked:hover .gj-tile__image {
    transform: scale(1.06);
  }
}

/*
 * Phones (below 768 px, tiles stacked): tiles with a picture are much lower than the LTS 388 px, as requested by the
 * shop owner: less space around the title, picture at most 152 px high, and no extra room below it for "Mehr",
 * which fits next to the narrower picture.
 */
@media (max-width: 767.98px) {
  .gj-tile:has(.gj-tile__image-box) {
    padding-bottom: 1.5rem;
  }

  .gj-tile:has(.gj-tile__image-box) .gj-tile__title {
    padding-top: 1.25rem;
    padding-bottom: 0.5rem;
  }

  .gj-tile__image-box {
    height: 9.5rem;
    margin-top: 0.5rem;
  }
}

/*
 * Whole tile as link: the "Mehr" link's area covers the tile, so there is one link (named "Mehr", described by the
 * title) instead of two with the same target like in the LTS shop. The focus frame then marks the whole tile.
 */
.gj-tile--linked {
  cursor: pointer;
}

.gj-tile--linked .gj-tile__more::after {
  content: '';
  position: absolute;
  inset: 0;
}

.gj-tile--linked .gj-tile__more {
  position: static;
  padding: 0;
  background: none;
}

.gj-tile--linked .gj-tile__more > span {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0.625rem 1.875rem;
  background-color: rgb(255 255 255 / 45%);
  transition: background-color 0.3s ease-in-out;
}

.gj-tile--linked:hover .gj-tile__more > span {
  background-color: #fff;
}

.gj-tile--linked:has(.gj-tile__more:focus-visible) {
  outline: 2px solid #263238;
  outline-offset: -2px;
}

.gj-tile--linked .gj-tile__more:focus-visible {
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .gj-tile__more,
  .gj-tile--linked .gj-tile__more > span,
  .gj-tile__image {
    transition: none;
  }
}

/* Collapsed: only the title row, like the LTS shop */
.gj-tile--collapsed {
  padding-bottom: 0;
}

/*
 * The minimum height only side by side: grids with tiles stack below 992 px like the LTS shop (glas-jena.css),
 * stacked tiles only need the height of their content.
 */
@media (min-width: 992px) {
  .gj-tile {
    min-height: 24.25rem;
  }
}
</style>
