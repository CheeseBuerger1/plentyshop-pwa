<template>
  <ul
    ref="menuRef"
    class="gj-nav-menu"
    :class="{ 'gj-nav-menu--flipped': isFlipped }"
    :data-testid="`gj-nav-menu-${level}`"
    @pointerdown="onPointerDown"
    @keydown="onKeyDown"
  >
    <li
      v-for="node in nodes"
      :key="node.id"
      class="gj-nav-menu__item"
      @mouseenter="onItemEnter(node)"
      @mouseleave="onItemLeave(node)"
      @focusin="onItemFocus(node)"
    >
      <NuxtLink
        :to="buildLink(node)"
        class="gj-nav-menu__link"
        :class="{ 'gj-nav-menu__link--open': openChildId === node.id, 'gj-nav-menu__link--active': isActive(node) }"
        data-testid="gj-nav-menu-link"
        :aria-haspopup="hasChildren(node) ? 'true' : undefined"
        :aria-expanded="hasChildren(node) ? openChildId === node.id : undefined"
        @click="onItemClick($event, node)"
      >
        <span>{{ categoryTreeGetters.getName(node) }}</span>
        <SfIconChevronRight v-if="hasChildren(node)" size="xs" aria-hidden="true" class="gj-nav-menu__chevron" />
      </NuxtLink>

      <!-- Always rendered (only hidden) so all category links are in the server HTML, like in the LTS shop -->
      <GlasJenaNavigationMenu
        v-if="hasChildren(node)"
        v-show="openChildId === node.id"
        :nodes="node.children ?? []"
        :level="level + 1"
        :build-link="buildLink"
        :is-active="isActive"
        :is-open="isOpen && openChildId === node.id"
        class="gj-nav-menu--flyout"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { SfIconChevronRight } from '@storefront-ui/vue';
import { type CategoryTreeItem, categoryTreeGetters } from '@plentymarkets/shop-api';
import { useHoverIntent } from '../composables/useHoverIntent';
import type { GlasJenaNavigationMenuProps } from './types';

defineOptions({ name: 'GlasJenaNavigationMenu' });
const props = defineProps<GlasJenaNavigationMenuProps>();

const menuRef = ref<HTMLElement | null>(null);
const openChildId = ref<number | null>(null);
const isFlipped = ref(false);
const lastPointerType = ref('mouse');
const hoverIntent = useHoverIntent();

const hasChildren = (node: CategoryTreeItem) => node.childCount > 0 && (node.children?.length ?? 0) > 0;

const openChild = (node: CategoryTreeItem | null) => {
  hoverIntent.cancel();
  openChildId.value = node && hasChildren(node) ? node.id : null;
};

const onPointerDown = (event: PointerEvent) => {
  lastPointerType.value = event.pointerType;
};

const onKeyDown = () => {
  lastPointerType.value = 'keyboard';
};

/**
 * Like the LTS shop, submenus open on hover. While a submenu is open, another item has to be
 * hovered for a moment before it takes over, so a diagonal move into the flyout does not close it.
 * Touch devices open submenus on the first tap instead (see onItemClick).
 */
const onItemEnter = (node: CategoryTreeItem) => {
  if (lastPointerType.value === 'touch') {
    return;
  }
  if (openChildId.value === node.id) {
    hoverIntent.cancel();
    return;
  }
  if (openChildId.value === null) {
    openChild(node);
    return;
  }
  hoverIntent.schedule(() => openChild(node));
};

const onItemLeave = (node: CategoryTreeItem) => {
  if (lastPointerType.value === 'touch' || openChildId.value !== node.id) {
    return;
  }
  hoverIntent.schedule(() => openChild(null));
};

const onItemFocus = (node: CategoryTreeItem) => {
  if (lastPointerType.value !== 'touch') {
    openChild(node);
  }
};

/** On touch devices the first tap on a category with subcategories opens them, the second tap follows the link. */
const onItemClick = (event: MouseEvent, node: CategoryTreeItem) => {
  if (lastPointerType.value === 'touch' && hasChildren(node) && openChildId.value !== node.id) {
    event.preventDefault();
    openChild(node);
  }
};

/** Flyouts that would leave the viewport on the right open to the left instead; measured once visible. */
const updateFlip = () => {
  isFlipped.value = false;
  const rect = menuRef.value?.getBoundingClientRect();
  if (rect && rect.width > 0 && rect.right > window.innerWidth) {
    isFlipped.value = true;
  }
};

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (!isOpen) {
      openChild(null);
      return;
    }
    await nextTick();
    updateFlip();
  },
);
</script>

<style scoped>
.gj-nav-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 11.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
  background-color: #fff;
  border: 1px solid var(--gj-tile-grey-blue);
  text-align: left;
}

.gj-nav-menu--flyout {
  top: -1px;
  left: 100%;
}

.gj-nav-menu--flyout.gj-nav-menu--flipped {
  left: auto;
  right: 100%;
}

.gj-nav-menu__item {
  position: relative;
}

.gj-nav-menu__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.375rem 0.625rem;
  font-size: 0.875rem;
  line-height: 1.5rem;
  white-space: nowrap;
  color: #263238;
}

.gj-nav-menu__link:hover,
.gj-nav-menu__link:focus-visible,
.gj-nav-menu__link--open {
  background-color: #f8f9fa;
}

.gj-nav-menu__link--active {
  background-color: var(--gj-tile-grey-blue);
}

.gj-nav-menu__chevron {
  flex-shrink: 0;
  color: #777;
}
</style>
