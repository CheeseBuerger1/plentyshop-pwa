<template>
  <HeaderBlocks v-if="useOriginalHeader" />
  <div v-else class="gj-header-wrapper" data-testid="gj-header">
    <header class="gj-header">
      <NuxtLink
        :to="localePath(paths.home)"
        :aria-label="t('common.actions.goToHomepage')"
        class="gj-header__logo"
        data-testid="gj-header-logo"
      >
        <UiLogo />
      </NuxtLink>

      <div class="gj-header__nav">
        <GlasJenaNavigation v-if="viewport.isGreaterOrEquals('lg')" :categories="navigationBlock?.categories" />
      </div>

      <button
        v-if="viewport.isLessThan('lg')"
        type="button"
        class="gj-header__tile gj-header__tile--light"
        data-testid="gj-header-menu"
        :aria-label="t('common.navigation.openMenu')"
        @click="openMegaMenu"
      >
        <SfIconMenu />
      </button>

      <NuxtLink
        :to="localePath(isAuthorized ? paths.account : paths.authLogin)"
        class="gj-header__tile gj-header__tile--light gj-header__tile--account"
        data-testid="gj-header-account"
        :aria-label="isAuthorized ? t('account.heading') : t('authentication.login.openLoginForm')"
      >
        <SfIconPerson />
      </NuxtLink>

      <button
        v-if="alternativeLocale"
        type="button"
        class="gj-header__tile gj-header__tile--medium gj-header__tile--text gj-header__tile--language"
        data-testid="gj-header-language"
        :aria-label="t('common.navigation.languageSelector')"
        @click="onLanguageClick"
      >
        {{ languageLabel }}
      </button>

      <button
        type="button"
        class="gj-header__tile gj-header__tile--dark"
        data-testid="gj-header-search"
        :aria-label="t('common.actions.search')"
        :aria-expanded="isSearchOpen"
        @click="toggleSearch"
      >
        <SfIconClose v-if="isSearchOpen" />
        <SfIconSearch v-else />
      </button>

      <NuxtLink
        :to="localePath(paths.cart)"
        class="gj-header__tile gj-header__tile--cart"
        data-testid="gj-header-cart"
        :aria-label="t('cart.numberInCart', { count: cartItemsCount })"
      >
        <SfIconShoppingCart />
        <span v-if="cartItemsCount > 0" class="gj-header__badge" data-testid="gj-header-cart-badge">
          {{ cartItemsCount }}
        </span>
      </NuxtLink>
    </header>

    <div v-if="isSearchOpen" class="gj-header__search" data-testid="gj-header-search-panel">
      <UiSearch class="w-full" :close="closeSearch" />
    </div>

    <!--
      Phones and tablets: LTS-style menu behind the burger; rendered hidden so its links are in the server HTML.
      Teleported out of the header's stacking context so it covers the whole page like in the LTS shop.
    -->
    <Teleport v-if="viewport.isLessThan('lg')" to="body">
      <GlasJenaMobileNavigation :categories="navigationBlock?.categories" />
    </Teleport>

    <LanguageSelector />
  </div>
</template>

<script setup lang="ts">
import { SfIconClose, SfIconMenu, SfIconPerson, SfIconSearch, SfIconShoppingCart } from '@storefront-ui/vue';
import HeaderBlocks from '~/components/ui/HeaderBlocks/HeaderBlocks.vue';
import LanguageSelector from '~/components/LanguageSelector/LanguageSelector.vue';
import { getNativeLanguageName } from '../utils/locale';
import GlasJenaMobileNavigation from './GlasJenaMobileNavigation.vue';
import GlasJenaNavigation from './GlasJenaNavigation.vue';
import { NAVIGATION_BLOCK_NAME } from '~/utils/blocks/block-names';
import type { HeaderContainerBlock } from '~/components/blocks/structure/HeaderContainer/types';
import type { NavigationBlockProps } from '~/components/blocks/Navigation/types';

const viewport = useViewport();
const localePath = useLocalizedPath();
const { isEditing } = useEditor();
const { headerContainer } = useBlocks();
const { data: cart } = useCart();
const { isAuthorized } = useCustomer();
const { open: openMegaMenu } = useMegaMenu();
const { getAvailableLocales, switchLocale, toggle: toggleLanguageSelect } = useLocalization();
const { locale: currentLocale } = useI18n();

/** The block editor keeps the original, editor-configurable header. */
const useOriginalHeader = computed(() => isEditing.value);

const navigationBlock = computed(
  () =>
    (headerContainer.value as HeaderContainerBlock | undefined)?.content?.find(
      (block) => block.name === NAVIGATION_BLOCK_NAME,
    ) as NavigationBlockProps | undefined,
);

/* Counted on the client only (like the original UtilityBar) to avoid a hydration mismatch */
const cartItemsCount = ref(0);
const countCartItems = () => cart.value?.items?.reduce((sum, { quantity }) => sum + quantity, 0) ?? 0;

onNuxtReady(() => {
  cartItemsCount.value = countCartItems();
});

watch(
  () => cart.value?.items,
  () => {
    cartItemsCount.value = countCartItems();
  },
);

const otherLocales = computed(() => getAvailableLocales().filter((locale) => locale !== currentLocale.value));
const alternativeLocale = computed(() => otherLocales.value[0]);
const hasSingleAlternativeLocale = computed(() => otherLocales.value.length === 1);
/** Like the LTS shop: the other language in its own name, e.g. "English" on the German shop. */
const languageLabel = computed(() => {
  const locale = alternativeLocale.value;
  if (!hasSingleAlternativeLocale.value || !locale) {
    return currentLocale.value.toUpperCase();
  }
  return getNativeLanguageName(locale);
});

const onLanguageClick = async () => {
  if (hasSingleAlternativeLocale.value && alternativeLocale.value) {
    await switchLocale(alternativeLocale.value);
    return;
  }
  toggleLanguageSelect();
};

const isSearchOpen = ref(false);

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;
};

const closeSearch = () => {
  isSearchOpen.value = false;
  return true;
};
</script>

<style scoped>
.gj-header-wrapper {
  position: relative;
  z-index: 20;
  background-color: #fff;
}

/* Own stacking layer so the category dropdown paints above the search panel */
.gj-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  max-width: var(--gj-box-width);
  height: var(--gj-header-height);
  margin: 0 auto;
}

/* Logo field in slate blue, overlapping the content below */
.gj-header__logo {
  display: flex;
  flex-shrink: 0;
  align-items: flex-end;
  justify-content: center;
  align-self: flex-start;
  width: var(--gj-logo-width);
  height: calc(var(--gj-header-height) + var(--gj-logo-overhang));
  padding: 0.5rem;
  background-color: var(--gj-slate-blue);
}

.gj-header__logo :deep(img) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.gj-header__nav {
  display: flex;
  flex: 1;
  align-items: stretch;
  min-width: 0;
}

.gj-header__tile {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--gj-tile-width);
  color: #666;
}

.gj-header__tile--light {
  background-color: #f0f0f0;
}

.gj-header__tile--medium {
  background-color: #ebebeb;
}

.gj-header__tile--dark {
  background-color: #e6e6e6;
}

.gj-header__tile--text {
  font-size: 0.95rem;
  font-weight: 300;
}

.gj-header__tile--cart {
  background-color: var(--gj-mid-blue);
  color: #fff;
}

.gj-header__tile:hover {
  filter: brightness(0.95);
}

.gj-header__badge {
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  min-width: 1.1rem;
  padding: 0 0.25rem;
  font-size: 0.7rem;
  line-height: 1.1rem;
  text-align: center;
  background-color: var(--gj-slate-blue);
  color: #fff;
}

.gj-header__search {
  max-width: var(--gj-box-width);
  margin: 0 auto;
  padding: 0.75rem 1rem 0.75rem calc(var(--gj-logo-width) + 1rem);
  background-color: var(--gj-footer-bg);
}

/* Tablet: smaller logo field and tiles */
@container (max-width: 1279px) {
  .gj-header {
    --gj-logo-width: 6rem;
    --gj-logo-overhang: 1.5rem;
    --gj-tile-width: 4.25rem;
  }

  .gj-header__search {
    padding-left: 7rem;
  }
}

/*
 * Phone (below the shop's `@md:` breakpoint), like the LTS shop: four equally wide tiles –
 * logo, menu, search, cart. The logo does not overhang; account and language move into the menu.
 */
@container (max-width: 767px) {
  .gj-header {
    --gj-header-height: 4.5rem;
    --gj-logo-overhang: 0rem;
  }

  .gj-header__nav,
  .gj-header__tile--account,
  .gj-header__tile--language {
    display: none;
  }

  .gj-header__logo,
  .gj-header__tile {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
  }

  .gj-header__logo {
    align-items: center;
  }

  .gj-header__badge {
    top: 0.9rem;
    right: calc(50% - 1.5rem);
  }

  .gj-header__search {
    padding-left: 1rem;
  }
}
</style>
