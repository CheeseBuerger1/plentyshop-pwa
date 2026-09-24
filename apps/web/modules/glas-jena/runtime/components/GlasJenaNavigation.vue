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
        @focusin="onItemEnter(node)"
      >
        <NuxtLink
          :to="buildLink(node)"
          class="gj-nav__link"
          :class="{ 'gj-nav__link--open': openId === node.id }"
          data-testid="gj-nav-category"
          :aria-haspopup="hasChildren(node) ? 'true' : undefined"
          :aria-expanded="hasChildren(node) ? openId === node.id : undefined"
          @click="onItemClick($event, node)"
        >
          <span>{{ categoryTreeGetters.getName(node) }}</span>
          <SfIconExpandMore v-if="hasChildren(node)" size="xs" aria-hidden="true" class="gj-nav__chevron" />
        </NuxtLink>

        <GlasJenaNavigationMenu
          v-if="hasChildren(node) && openId === node.id"
          :nodes="node.children ?? []"
          :level="2"
          :build-link="buildLink"
        />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { SfIconExpandMore } from '@storefront-ui/vue';
import { onClickOutside } from '@vueuse/core';
import { type CategoryTreeItem, categoryTreeGetters } from '@plentymarkets/shop-api';
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

const localePath = useLocalizedPath();
const { buildCategoryMenuLink } = useLocalization();
const { data: fetchedCategoryTree, getCategoryTree } = useCategoryTree();
const router = useRouter();

const navRef = ref<HTMLElement | null>(null);
const openId = ref<number | null>(null);
const lastPointerType = ref('mouse');

const resolvedCategories = computed(() => (props.categories.length > 0 ? props.categories : fetchedCategoryTree.value));
const categoryTree = ref<CategoryTreeItem[]>([]);

/* getTree() touches the reactive source tree, so a computed would re-trigger itself (same pattern as the Navigation block) */
watch(
  resolvedCategories,
  (categories) => {
    categoryTree.value = categoryTreeGetters.getTree(categories);
  },
  { immediate: true },
);

const buildLink = (category: CategoryTreeItem) => localePath(buildCategoryMenuLink(category, categoryTree.value));

const hasChildren = (node: CategoryTreeItem) => node.childCount > 0 && (node.children?.length ?? 0) > 0;

const close = () => {
  openId.value = null;
};

const onPointerDown = (event: PointerEvent) => {
  lastPointerType.value = event.pointerType;
};

const onKeyDown = (event: KeyboardEvent) => {
  lastPointerType.value = 'keyboard';
  if (event.key !== 'Escape' || openId.value === null) {
    return;
  }
  const trigger = navRef.value?.querySelector<HTMLElement>('[data-testid="gj-nav-category"][aria-expanded="true"]');
  close();
  trigger?.focus();
};

/** Touch devices open dropdowns on the first tap instead (see onItemClick). */
const onItemEnter = (node: CategoryTreeItem) => {
  if (lastPointerType.value === 'touch') {
    return;
  }
  openId.value = hasChildren(node) ? node.id : null;
};

const onItemLeave = () => {
  if (lastPointerType.value === 'touch') {
    return;
  }
  close();
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

onNuxtReady(async () => {
  if (props.categories.length === 0 && fetchedCategoryTree.value.length === 0) {
    await getCategoryTree();
  }
});
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

.gj-nav__link.router-link-active {
  background-color: var(--gj-tile-grey-blue);
}

.gj-nav__chevron {
  flex-shrink: 0;
  color: #777;
}
</style>
