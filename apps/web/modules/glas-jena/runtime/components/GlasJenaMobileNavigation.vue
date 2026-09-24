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
          <button type="button" class="gj-mnav__crumb" @click="slideTo(crumb.id)">
            {{ categoryTreeGetters.getName(crumb) }}
          </button>
        </li>
        <li v-if="view !== VIEW_CATEGORIES">
          <span class="gj-mnav__crumb">{{ view === VIEW_ACCOUNT ? tLocal('account') : LANGUAGE_MENU_LABEL }}</span>
        </li>
      </ol>
      <button
        type="button"
        class="gj-mnav__close"
        :aria-label="t('common.navigation.closeMenu')"
        data-testid="gj-mobile-nav-close"
        @click="close"
      >
        <SfIconClose aria-hidden="true" />
      </button>
    </div>

    <nav class="gj-mnav__body">
      <ul
        v-for="level in levels"
        v-show="view === VIEW_CATEGORIES && level.id === parentId"
        :key="level.id ?? 'root'"
        class="gj-mnav__list"
        :data-testid="`gj-mobile-nav-level-${level.id ?? 'root'}`"
      >
        <li v-if="level.id !== null">
          <button type="button" class="gj-mnav__up" :aria-label="t('common.actions.back')" @click="goUp">
            <SfIconArrowUpward aria-hidden="true" />
          </button>
        </li>
        <li v-for="node in level.nodes" :key="node.id" class="gj-mnav__item">
          <NuxtLink
            :to="buildLink(node)"
            class="gj-mnav__link"
            :class="{ 'gj-mnav__link--active': isActive(node) }"
            data-testid="gj-mobile-nav-link"
            @click="close"
          >
            {{ categoryTreeGetters.getName(node) }}
          </NuxtLink>
          <button
            v-if="hasChildren(node)"
            type="button"
            class="gj-mnav__next"
            :aria-label="`${t('common.navigation.showSubcategories')} - ${categoryTreeGetters.getName(node)}`"
            data-testid="gj-mobile-nav-next"
            @click="slideTo(node.id)"
          >
            <SfIconChevronRight aria-hidden="true" />
          </button>
        </li>
      </ul>

      <template v-if="view === VIEW_CATEGORIES">
        <hr class="gj-mnav__separator" />
        <ul class="gj-mnav__list">
          <li class="gj-mnav__item">
            <button type="button" class="gj-mnav__link gj-mnav__link--extra" @click="showView(VIEW_ACCOUNT)">
              {{ tLocal('account') }}
            </button>
            <button
              type="button"
              class="gj-mnav__next gj-mnav__link--extra"
              :aria-label="tLocal('account')"
              data-testid="gj-mobile-nav-account"
              @click="showView(VIEW_ACCOUNT)"
            >
              <SfIconChevronRight aria-hidden="true" />
            </button>
          </li>
          <li v-if="locales.length > 1" class="gj-mnav__item">
            <button type="button" class="gj-mnav__link gj-mnav__link--extra" @click="showView(VIEW_LANGUAGE)">
              {{ LANGUAGE_MENU_LABEL }}
            </button>
            <button
              type="button"
              class="gj-mnav__next gj-mnav__link--extra"
              :aria-label="LANGUAGE_MENU_LABEL"
              data-testid="gj-mobile-nav-language"
              @click="showView(VIEW_LANGUAGE)"
            >
              <SfIconChevronRight aria-hidden="true" />
            </button>
          </li>
        </ul>
      </template>

      <ul v-else-if="view === VIEW_ACCOUNT" class="gj-mnav__list" data-testid="gj-mobile-nav-account-list">
        <li>
          <button
            type="button"
            class="gj-mnav__up"
            :aria-label="t('common.actions.back')"
            @click="showView(VIEW_CATEGORIES)"
          >
            <SfIconArrowUpward aria-hidden="true" />
          </button>
        </li>
        <template v-if="isAuthorized">
          <li class="gj-mnav__item">
            <NuxtLink :to="localePath(paths.account)" class="gj-mnav__link" @click="close">
              {{ t('account.heading') }}
            </NuxtLink>
          </li>
          <li class="gj-mnav__item">
            <button type="button" class="gj-mnav__link" @click="onLogout">{{ t('account.logout') }}</button>
          </li>
        </template>
        <template v-else>
          <li class="gj-mnav__item">
            <NuxtLink :to="localePath(paths.authLogin)" class="gj-mnav__link" @click="close">
              {{ t('authentication.login.submitLabel') }}
            </NuxtLink>
          </li>
          <li class="gj-mnav__item">
            <NuxtLink :to="localePath(paths.register)" class="gj-mnav__link" @click="close">
              {{ t('authentication.signup.heading') }}
            </NuxtLink>
          </li>
          <li class="gj-mnav__item">
            <NuxtLink :to="localePath(paths.account)" class="gj-mnav__link" @click="close">
              {{ t('account.heading') }}
            </NuxtLink>
          </li>
        </template>
      </ul>

      <ul v-else class="gj-mnav__list" data-testid="gj-mobile-nav-language-list">
        <li>
          <button
            type="button"
            class="gj-mnav__up"
            :aria-label="t('common.actions.back')"
            @click="showView(VIEW_CATEGORIES)"
          >
            <SfIconArrowUpward aria-hidden="true" />
          </button>
        </li>
        <li v-for="locale in locales" :key="locale" class="gj-mnav__item">
          <button
            type="button"
            class="gj-mnav__link"
            :class="{ 'gj-mnav__link--active': locale === currentLocale }"
            :lang="locale"
            @click="onLocaleClick(locale)"
          >
            {{ getNativeLanguageName(locale) }}
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { SfIconArrowUpward, SfIconChevronRight, SfIconClose, SfIconHome, useTrapFocus } from '@storefront-ui/vue';
import { type CategoryTreeItem, categoryTreeGetters } from '@plentymarkets/shop-api';
import { useGlasJenaCategoryTree } from '../composables/useGlasJenaCategoryTree';
import { getNativeLanguageName } from '../utils/locale';
import { LANGUAGE_MENU_LABEL, VIEW_ACCOUNT, VIEW_CATEGORIES, VIEW_LANGUAGE } from '../utils/navigation';
import type { GlasJenaMobileNavigationView, GlasJenaNavigationProps } from './types';

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

const slideTo = (id: number | null) => {
  view.value = VIEW_CATEGORIES;
  parentId.value = id;
};

const showRoot = () => slideTo(null);

const goUp = () => {
  const parent = parentId.value === null ? null : parentsById.value.parents.get(parentId.value);
  slideTo(parent?.id ?? null);
};

const showView = (next: GlasJenaMobileNavigationView) => {
  view.value = next;
};

const onLocaleClick = async (locale: (typeof locales.value)[number]) => {
  close();
  if (locale !== currentLocale.value) {
    await switchLocale(locale);
  }
};

const onLogout = () => handleLogout({ logout, toggle: close });

watch(isOpen, (open) => {
  if (open) {
    view.value = VIEW_CATEGORIES;
    parentId.value = findStartLevel();
  }
  if (import.meta.client) {
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
});

let removeRouteHook: (() => void) | undefined;

onMounted(() => {
  removeRouteHook = router.afterEach(close);
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
  overflow-y: auto;
  overscroll-behavior: contain;
}

.gj-mnav__list {
  margin: 0;
  padding: 0;
  list-style: none;
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
