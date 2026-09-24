<template>
  <nav
    ref="navRef"
    class="gj-nav"
    data-testid="gj-nav"
    :aria-label="t('common.actions.browseProducts')"
    @pointerdown="onPointerDown"
    @keydown="onKeyDown"
    @focusout="onFocusOut"
  >
    <ul class="gj-nav__list">
      <li
        v-for="node in categoryTree"
        :key="node.id"
        class="gj-nav__item"
        @mouseenter="onItemEnter(node)"
        @mouseleave="onItemLeave"
        @focusin="onItemFocus(node)"
      >
        <NuxtLink
          :to="buildLink(node)"
          class="gj-nav__link"
          :class="{ 'gj-nav__link--open': openId === node.id, 'gj-nav__link--active': isActive(node) }"
          data-testid="gj-nav-category"
          :aria-haspopup="hasChildren(node) ? 'true' : undefined"
          :aria-expanded="hasChildren(node) ? openId === node.id : undefined"
          @click="onItemClick($event, node)"
        >
          <span>{{ categoryTreeGetters.getName(node) }}</span>
          <SfIconExpandMore v-if="hasChildren(node)" size="xs" aria-hidden="true" class="gj-nav__chevron" />
        </NuxtLink>

        <!-- Always rendered (only hidden) so all category links are in the server HTML, like in the LTS shop -->
        <GlasJenaNavigationMenu
          v-if="hasChildren(node)"
          v-show="openId === node.id"
          :nodes="node.children ?? []"
          :level="2"
          :build-link="buildLink"
          :is-active="isActive"
          :is-open="openId === node.id"
          @back="focusTrigger(node)"
        />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { SfIconExpandMore } from '@storefront-ui/vue';
import { onClickOutside } from '@vueuse/core';
import { type CategoryTreeItem, categoryTreeGetters } from '@plentymarkets/shop-api';
import { useGlasJenaCategoryTree } from '../composables/useGlasJenaCategoryTree';
import { useHoverIntent } from '../composables/useHoverIntent';
import { focusFirstLinkOfFlyout } from '../utils/navigation';
import GlasJenaNavigationMenu from './GlasJenaNavigationMenu.vue';
import type { GlasJenaNavigationProps } from './types';

/**
 * Desktop main navigation in the style of the LTS shop www.glas-jena.de:
 * equally wide categories in one row, a narrow dropdown on hover and
 * cascading flyouts to the right for deeper levels. Clicking a category always opens its page.
 */
const props = withDefaults(defineProps<GlasJenaNavigationProps>(), {
  categories: () => [],
});

const router = useRouter();
const hoverIntent = useHoverIntent();
const { categoryTree, buildLink, isActive, hasChildren } = useGlasJenaCategoryTree(() => props.categories);

const navRef = ref<HTMLElement | null>(null);
const openId = ref<number | null>(null);
const lastPointerType = ref('mouse');

const close = () => {
  hoverIntent.cancel();
  openId.value = null;
};

const onPointerDown = (event: PointerEvent) => {
  lastPointerType.value = event.pointerType;
};

/** Set while the focus is moved programmatically to a main category that should stay closed. */
let isFocusingClosed = false;

const triggerLinks = () =>
  Array.from(navRef.value?.querySelectorAll<HTMLElement>('[data-testid="gj-nav-category"]') ?? []);

const focusTrigger = (node: CategoryTreeItem) => {
  triggerLinks()[categoryTree.value.indexOf(node)]?.focus();
};

const closeAndFocusTrigger = () => {
  const trigger = navRef.value?.querySelector<HTMLElement>('[data-testid="gj-nav-category"][aria-expanded="true"]');
  close();
  isFocusingClosed = true;
  trigger?.focus();
  isFocusingClosed = false;
};

/**
 * Keyboard: Left/Right move along the main bar, Down opens the dropdown and focuses its first
 * entry, Escape closes it. The dropdown levels handle their own arrow keys.
 */
const onKeyDown = async (event: KeyboardEvent) => {
  lastPointerType.value = 'keyboard';
  if (event.key === 'Escape' && openId.value !== null) {
    closeAndFocusTrigger();
    return;
  }

  const triggers = triggerLinks();
  const index = triggers.indexOf(event.target as HTMLElement);
  const node = categoryTree.value[index];
  if (index === -1 || !node) {
    return;
  }

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault();
      triggers[(index + 1) % triggers.length]?.focus();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      triggers[(index - 1 + triggers.length) % triggers.length]?.focus();
      break;
    case 'ArrowDown':
      if (hasChildren(node)) {
        event.preventDefault();
        openId.value = node.id;
        await nextTick();
        focusFirstLinkOfFlyout(triggers[index]?.parentElement);
      }
      break;
  }
};

/**
 * Moving along the main bar switches dropdowns immediately. Leaving the navigation closes the
 * dropdown only after a short delay, so briefly overshooting its edge does not close it.
 * Touch devices open dropdowns on the first tap instead (see onItemClick).
 */
const onItemEnter = (node: CategoryTreeItem) => {
  if (lastPointerType.value === 'touch') {
    return;
  }
  hoverIntent.cancel();
  openId.value = hasChildren(node) ? node.id : null;
};

const onItemLeave = () => {
  if (lastPointerType.value === 'touch') {
    return;
  }
  hoverIntent.schedule(close);
};

/** Focusing a main category opens its dropdown, so keyboard users also discover it with Tab. */
const onItemFocus = (node: CategoryTreeItem) => {
  if (lastPointerType.value !== 'touch' && !isFocusingClosed) {
    onItemEnter(node);
  }
};

/** On touch devices the first tap on a category with subcategories opens them, the second tap follows the link. */
const onItemClick = (event: MouseEvent, node: CategoryTreeItem) => {
  if (lastPointerType.value === 'touch' && hasChildren(node) && openId.value !== node.id) {
    event.preventDefault();
    openId.value = node.id;
  }
};

const onFocusOut = (event: FocusEvent) => {
  if (lastPointerType.value === 'keyboard' && !navRef.value?.contains(event.relatedTarget as Node | null)) {
    close();
  }
};

onClickOutside(navRef, close);

let removeRouteHook: (() => void) | undefined;

onMounted(() => {
  removeRouteHook = router.afterEach(close);
});

onBeforeUnmount(() => removeRouteHook?.());
</script>

<style scoped>
.gj-nav {
  position: relative;
  width: 100%;
  height: 100%;
}

.gj-nav__list {
  display: flex;
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Like the LTS shop: all main categories share the row equally, text centered */
.gj-nav__item {
  position: relative;
  display: flex;
  flex: 1 1 0;
  min-width: 0;
}

.gj-nav__link {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5rem;
  white-space: nowrap;
  color: #263238;
}

.gj-nav__link:hover,
.gj-nav__link:focus-visible,
.gj-nav__link--open {
  background-color: #f8f9fa;
}

.gj-nav__link--active {
  background-color: var(--gj-tile-grey-blue);
}

.gj-nav__chevron {
  flex-shrink: 0;
  color: #777;
}
</style>
