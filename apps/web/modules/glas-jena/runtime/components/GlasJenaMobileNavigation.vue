<template>
  <!-- Always rendered (only hidden) so all category links are in the server HTML for phones, too -->
  <div
    v-show="isOpen"
    ref="panelRef"
    class="gj-mnav z-modal-backdrop"
    role="dialog"
    aria-modal="true"
    :aria-label="t('common.actions.browseProducts')"
    data-testid="gj-mobile-nav"
    @keydown.esc="close"
  >
    <div class="gj-mnav__bar">
      <ol class="gj-mnav__crumbs" data-testid="gj-mobile-nav-crumbs">
        <li>
          <button type="button" class="gj-mnav__crumb" :aria-label="t('common.labels.home')" @click="showRoot">
            <SfIconHome size="sm" aria-hidden="true" />
          </button>
        </li>
        <li v-for="crumb in breadcrumbs" :key="crumb.id">
          <button type="button" class="gj-mnav__crumb" @click="slideBackTo(crumb.id)">
            {{ categoryTreeGetters.getName(crumb) }}
          </button>
        </li>
        <li v-if="view !== VIEW_CATEGORIES">
          <span class="gj-mnav__crumb">{{ view === VIEW_ACCOUNT ? tLocal('account') : LANGUAGE_MENU_LABEL }}</span>
        </li>
      </ol>
      <button
        ref="closeRef"
        type="button"
        class="gj-mnav__close"
        :aria-label="t('common.navigation.closeMenu')"
        data-testid="gj-mobile-nav-close"
        @click="close"
      >
        <SfIconClose aria-hidden="true" />
      </button>
    </div>

    <nav class="gj-mnav__body" @click.capture="onLinkClick">
      <ul
        v-for="level in levels"
        v-show="view === VIEW_CATEGORIES && level.id === parentId"
        :key="level.id ?? 'root'"
        class="gj-mnav__list"
        :class="slideClass"
        :data-testid="`gj-mobile-nav-level-${level.id ?? 'root'}`"
      >
        <li v-if="level.id !== null">
          <button type="button" class="gj-mnav__up" :aria-label="t('common.actions.back')" @click="goUp">
            <SfIconChevronLeft size="lg" aria-hidden="true" />
          </button>
        </li>
        <li v-for="node in level.nodes" :key="node.id" class="gj-mnav__item">
          <NuxtLink
            :to="buildLink(node)"
            class="gj-mnav__link"
            :class="{ 'gj-mnav__link--active': isActive(node) }"
            data-testid="gj-mobile-nav-link"
          >
            {{ categoryTreeGetters.getName(node) }}
          </NuxtLink>
          <button
            v-if="hasChildren(node)"
            type="button"
            class="gj-mnav__next"
            :aria-label="`${t('common.navigation.showSubcategories')} - ${categoryTreeGetters.getName(node)}`"
            data-testid="gj-mobile-nav-next"
            @click="slideForwardTo(node.id)"
          >
            <SfIconChevronRight aria-hidden="true" />
          </button>
        </li>
      </ul>

      <template v-if="view === VIEW_CATEGORIES">
        <hr class="gj-mnav__separator" />
        <ul class="gj-mnav__list">
          <li class="gj-mnav__item">
            <button
              type="button"
              class="gj-mnav__link gj-mnav__link--extra"
              @click="showView(VIEW_ACCOUNT, SLIDE_FORWARD)"
            >
              {{ tLocal('account') }}
            </button>
            <button
              type="button"
              class="gj-mnav__next gj-mnav__link--extra"
              :aria-label="tLocal('account')"
              data-testid="gj-mobile-nav-account"
              @click="showView(VIEW_ACCOUNT, SLIDE_FORWARD)"
            >
              <SfIconChevronRight aria-hidden="true" />
            </button>
          </li>
          <li v-if="locales.length > 1" class="gj-mnav__item">
            <button
              type="button"
              class="gj-mnav__link gj-mnav__link--extra"
              @click="showView(VIEW_LANGUAGE, SLIDE_FORWARD)"
            >
              {{ LANGUAGE_MENU_LABEL }}
            </button>
            <button
              type="button"
              class="gj-mnav__next gj-mnav__link--extra"
              :aria-label="LANGUAGE_MENU_LABEL"
              data-testid="gj-mobile-nav-language"
              @click="showView(VIEW_LANGUAGE, SLIDE_FORWARD)"
            >
              <SfIconChevronRight aria-hidden="true" />
            </button>
          </li>
        </ul>
      </template>

      <ul
        v-else-if="view === VIEW_ACCOUNT"
        class="gj-mnav__list"
        :class="slideClass"
        data-testid="gj-mobile-nav-account-list"
      >
        <li>
          <button
            type="button"
            class="gj-mnav__up"
            :aria-label="t('common.actions.back')"
            @click="showView(VIEW_CATEGORIES, SLIDE_BACK)"
          >
            <SfIconChevronLeft size="lg" aria-hidden="true" />
          </button>
        </li>
        <template v-if="isAuthorized">
          <li class="gj-mnav__item">
            <NuxtLink :to="localePath(paths.account)" class="gj-mnav__link">
              {{ t('account.heading') }}
            </NuxtLink>
          </li>
          <li class="gj-mnav__item">
            <button type="button" class="gj-mnav__link" @click="onLogout">{{ t('account.logout') }}</button>
          </li>
        </template>
        <template v-else>
          <li class="gj-mnav__item">
            <NuxtLink :to="localePath(paths.authLogin)" class="gj-mnav__link">
              {{ t('authentication.login.submitLabel') }}
            </NuxtLink>
          </li>
          <li class="gj-mnav__item">
            <NuxtLink :to="localePath(paths.register)" class="gj-mnav__link">
              {{ t('authentication.signup.heading') }}
            </NuxtLink>
          </li>
          <li class="gj-mnav__item">
            <NuxtLink :to="localePath(paths.account)" class="gj-mnav__link">
              {{ t('account.heading') }}
            </NuxtLink>
          </li>
        </template>
      </ul>

      <ul v-else class="gj-mnav__list" :class="slideClass" data-testid="gj-mobile-nav-language-list">
        <li>
          <button
            type="button"
            class="gj-mnav__up"
            :aria-label="t('common.actions.back')"
            @click="showView(VIEW_CATEGORIES, SLIDE_BACK)"
          >
            <SfIconChevronLeft size="lg" aria-hidden="true" />
          </button>
        </li>
        <!-- Real links (with hreflang) to the language versions, so crawlers can follow them -->
        <li v-for="locale in locales" :key="locale" class="gj-mnav__item">
          <a
            :href="switchLocalePath(locale)"
            class="gj-mnav__link"
            :class="{ 'gj-mnav__link--active': locale === currentLocale }"
            :hreflang="locale"
            :lang="locale"
            @click="onLocaleClick($event, locale)"
          >
            {{ getNativeLanguageName(locale) }}
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { SfIconChevronLeft, SfIconChevronRight, SfIconClose, SfIconHome, useTrapFocus } from '@storefront-ui/vue';
import { type CategoryTreeItem, categoryTreeGetters } from '@plentymarkets/shop-api';
import { useGlasJenaCategoryTree } from '../composables/useGlasJenaCategoryTree';
import { useMenuHistoryEntry } from '../composables/useMenuHistoryEntry';
import { getNativeLanguageName } from '../utils/locale';
import {
  LANGUAGE_MENU_LABEL,
  SLIDE_BACK,
  SLIDE_FORWARD,
  SLIDE_NONE,
  VIEW_ACCOUNT,
  VIEW_CATEGORIES,
  VIEW_LANGUAGE,
  isPlainLeftClick,
} from '../utils/navigation';
import type { GlasJenaMobileNavigationView, GlasJenaNavigationProps, GlasJenaSlideDirection } from './types';

/**
 * Mobile menu in the style of the LTS shop www.glas-jena.de: a full-screen dark panel that opens at
 * the level of the current category, a breadcrumb bar to jump back, one level at a time with a
 * "level up" row, and "Account" and "Language / Sprache" below the categories.
 * Opened through useMegaMenu(), so every existing menu button (burger, bottom navbar) works.
 */
const props = withDefaults(defineProps<GlasJenaNavigationProps>(), {
  categories: () => [],
});

const { t: tLocal } = useI18n({ useScope: 'local' });
const { locale: currentLocale } = useI18n();
const localePath = useLocalizedPath();
const switchLocalePath = useSwitchLocalePath();
const router = useRouter();
const { isOpen, close } = useMegaMenu();
const { isAuthorized, logout } = useCustomer();
const { getAvailableLocales, switchLocale } = useLocalization();
const { categoryTree, buildLink, isActive, hasChildren } = useGlasJenaCategoryTree(() => props.categories);

const panelRef = ref<HTMLElement>();
const view = ref<GlasJenaMobileNavigationView>(VIEW_CATEGORIES);
/** The category whose subcategories are shown; null shows the main categories. */
const parentId = ref<number | null>(null);

const locales = computed(() => getAvailableLocales());

/** Every category with its parent, to walk up the tree and build the breadcrumbs. */
const parentsById = computed(() => {
  const parents = new Map<number, CategoryTreeItem | null>();
  const nodesById = new Map<number, CategoryTreeItem>();
  const walk = (nodes: CategoryTreeItem[], parent: CategoryTreeItem | null) => {
    for (const node of nodes) {
      parents.set(node.id, parent);
      nodesById.set(node.id, node);
      walk(node.children ?? [], node);
    }
  };
  walk(categoryTree.value, null);
  return { parents, nodesById };
});

/** One list per level (main categories and every category with subcategories), all rendered for search engines. */
const levels = computed(() => {
  const result: { id: number | null; nodes: CategoryTreeItem[] }[] = [{ id: null, nodes: categoryTree.value }];
  for (const node of parentsById.value.nodesById.values()) {
    if (hasChildren(node)) {
      result.push({ id: node.id, nodes: node.children ?? [] });
    }
  }
  return result;
});

const breadcrumbs = computed(() => {
  const crumbs: CategoryTreeItem[] = [];
  let node = parentId.value === null ? null : (parentsById.value.nodesById.get(parentId.value) ?? null);
  while (node) {
    crumbs.unshift(node);
    node = parentsById.value.parents.get(node.id) ?? null;
  }
  return crumbs;
});

/** Like the LTS shop the menu opens at the current category: its subcategories, or its siblings if it has none. */
const findStartLevel = () => {
  let nodes = categoryTree.value;
  let deepestActive: CategoryTreeItem | null = null;
  let activeParent: CategoryTreeItem | null = null;
  let active = nodes.find(isActive);
  while (active) {
    activeParent = deepestActive;
    deepestActive = active;
    nodes = active.children ?? [];
    active = nodes.find(isActive);
  }
  if (!deepestActive) {
    return null;
  }
  return hasChildren(deepestActive) ? deepestActive.id : (activeParent?.id ?? null);
};

/** Direction of the last level change; a level that becomes visible slides in from that side (like the LTS shop). */
const slideDirection = ref<GlasJenaSlideDirection>(SLIDE_NONE);
const slideClass = computed(() => `gj-mnav__list--${slideDirection.value}`);

const showView = (next: GlasJenaMobileNavigationView, direction: GlasJenaSlideDirection) => {
  slideDirection.value = direction;
  view.value = next;
};

const slideTo = (id: number | null, direction: GlasJenaSlideDirection) => {
  showView(VIEW_CATEGORIES, direction);
  parentId.value = id;
};

const slideForwardTo = (id: number) => slideTo(id, SLIDE_FORWARD);
const slideBackTo = (id: number | null) => slideTo(id, SLIDE_BACK);
const showRoot = () => slideBackTo(null);

const goUp = () => {
  const parent = parentId.value === null ? null : parentsById.value.parents.get(parentId.value);
  slideBackTo(parent?.id ?? null);
};

const { exitHistoryEntry } = useMenuHistoryEntry(isOpen, close);

/**
 * Links in the menu first remove the menu's history entry and navigate afterwards, so the back button
 * then returns to the previous page. Listens in the capture phase so it runs before the link's own
 * navigation, which then skips the prevented click. Modifier clicks (new tab/window) keep the default.
 */
const onLinkClick = async (event: MouseEvent) => {
  /* Language links (with hreflang) switch via switchLocale in onLocaleClick instead */
  const href = (event.target as HTMLElement | null)?.closest('a[href]:not([hreflang])')?.getAttribute('href');
  if (!href || !isPlainLeftClick(event)) {
    return;
  }
  event.preventDefault();
  close();
  await exitHistoryEntry();
  await router.push(href);
};

const onLocaleClick = async (event: MouseEvent, locale: (typeof locales.value)[number]) => {
  if (!isPlainLeftClick(event)) {
    return;
  }
  event.preventDefault();
  close();
  await exitHistoryEntry();
  if (locale !== currentLocale.value) {
    await switchLocale(locale, false);
  }
};

const onLogout = () => handleLogout({ logout, toggle: close });

const closeRef = ref<HTMLElement>();
/** The element that opened the menu (usually the burger); it gets the focus back on close. */
let opener: HTMLElement | null = null;

watch(isOpen, async (open) => {
  if (open) {
    slideDirection.value = SLIDE_NONE;
    view.value = VIEW_CATEGORIES;
    parentId.value = findStartLevel();
  }
  if (!import.meta.client) {
    return;
  }
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (open) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    await nextTick();
    closeRef.value?.focus();
    return;
  }
  if (opener?.isConnected && panelRef.value?.contains(document.activeElement)) {
    opener.focus();
  }
  opener = null;
});

let removeRouteHook: (() => void) | undefined;

onMounted(() => {
  /* Only a real page change closes the menu; removing its history entry is a "navigation" to the same page */
  removeRouteHook = router.afterEach((to, from) => {
    if (to.fullPath !== from.fullPath) {
      close();
    }
  });
});

onBeforeUnmount(() => {
  removeRouteHook?.();
  document.documentElement.style.overflow = '';
});

useTrapFocus(panelRef, { activeState: isOpen, arrowKeysUpDown: false, initialFocus: false });
</script>

<i18n lang="json">
{
  "en": { "account": "Account" },
  "de": { "account": "Konto" }
}
</i18n>

<style scoped>
/* Colours and sizes taken from the LTS mobile navigation */
.gj-mnav {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background-color: #2e3233;
  color: #fff;
  /* Teleported to <body>, outside the `.font-body` shop area that sets the shop font */
  font-family: 'Source Sans 3', sans-serif;
  overflow: hidden;
}

.gj-mnav__bar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  min-height: 2.9rem;
  padding: 0 0.25rem 0 0.5rem;
  background-color: #fff;
  color: #333;
}

.gj-mnav__crumbs {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gj-mnav__crumbs > li + li::before {
  content: '/';
  padding: 0 0.35rem;
  color: #6c757d;
}

.gj-mnav__crumb {
  padding: 0.5rem 0.25rem;
  font-size: 1rem;
}

.gj-mnav__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
}

.gj-mnav__body {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.gj-mnav__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* A level slides in whenever it becomes visible (display: none → shown restarts the animation) */
.gj-mnav__list--forward {
  animation: gj-mnav-slide-from-right 200ms ease-out;
}

.gj-mnav__list--back {
  animation: gj-mnav-slide-from-left 200ms ease-out;
}

@keyframes gj-mnav-slide-from-right {
  from {
    transform: translateX(100%);
  }
}

@keyframes gj-mnav-slide-from-left {
  from {
    transform: translateX(-100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .gj-mnav__list--forward,
  .gj-mnav__list--back {
    animation: none;
  }
}

.gj-mnav__item {
  display: flex;
  align-items: stretch;
}

.gj-mnav__link {
  flex: 1;
  padding: 0.875rem;
  font-size: 1.05rem;
  line-height: 1.5;
  text-align: left;
  color: inherit;
}

.gj-mnav__link--active {
  font-weight: 600;
}

.gj-mnav__link--extra {
  color: #abcae4;
}

.gj-mnav__next,
.gj-mnav__up {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0 0.875rem;
}

.gj-mnav__up {
  justify-content: flex-start;
}

.gj-mnav__separator {
  margin: 0.875rem 0;
  border: 0;
  border-top: 1px solid #dee2e6;
}
</style>
