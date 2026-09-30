<template>
  <HeaderBlocks v-if="useOriginalHeader" />
  <template v-else>
    <div
      class="gj-header-wrapper z-dropdown"
      :class="{ 'gj-header-wrapper--sticky': isSticky }"
      data-testid="gj-header"
    >
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
          <GlasJenaNavigation
            v-if="viewport.isGreaterOrEquals(DESKTOP_NAVIGATION_BREAKPOINT)"
            :categories="navigationBlock?.categories"
          />
        </div>

        <button
          v-if="viewport.isLessThan(DESKTOP_NAVIGATION_BREAKPOINT)"
          type="button"
          class="gj-header__tile gj-header__tile--light"
          data-testid="gj-header-menu"
          :aria-label="t('common.navigation.openMenu')"
          @click="openMegaMenu"
        >
          <GlasJenaLineIcon name="menu" />
        </button>

        <!-- Account, like the original header: signed in a menu, otherwise the login dialog (see script) -->
        <SfDropdown
          v-if="isAuthorized"
          v-model="isAccountMenuOpen"
          placement="bottom-start"
          class="gj-header__account z-dropdown"
        >
          <template #trigger>
            <button
              type="button"
              class="gj-header__tile gj-header__tile--light gj-header__tile--account"
              data-testid="gj-header-account"
              :aria-label="t('account.heading')"
              aria-haspopup="true"
              :aria-expanded="isAccountMenuOpen"
              @click="toggleAccountMenu()"
            >
              <GlasJenaLineIcon name="person" />
            </button>
          </template>
          <ul class="gj-header__account-menu" data-testid="gj-header-account-menu">
            <li v-for="{ label, link } in accountMenuLinks" :key="link">
              <NuxtLink
                :to="link"
                class="gj-header__account-item"
                :aria-current="route.path === link ? 'page' : undefined"
                @click="closeAccountMenu()"
              >
                {{ label }}
              </NuxtLink>
            </li>
            <li class="gj-header__account-separator">
              <button
                type="button"
                class="gj-header__account-item"
                data-testid="gj-header-account-logout"
                @click="logOut()"
              >
                {{ t('account.logout') }}
              </button>
            </li>
          </ul>
        </SfDropdown>
        <NuxtLink
          v-else
          :to="localePath(paths.authLogin)"
          class="gj-header__tile gj-header__tile--light gj-header__tile--account"
          data-testid="gj-header-account"
          :aria-label="t('authentication.login.openLoginForm')"
          @click.capture="onLoginLinkClick"
        >
          <GlasJenaLineIcon name="person" />
        </NuxtLink>

        <!-- A real link (with hreflang) to the other language version, so crawlers can follow it -->
        <a
          v-if="hasSingleAlternativeLocale && alternativeLocale"
          :href="switchLocalePath(alternativeLocale)"
          :hreflang="alternativeLocale"
          :lang="alternativeLocale"
          class="gj-header__tile gj-header__tile--medium gj-header__tile--text gj-header__tile--language"
          data-testid="gj-header-language"
          @click="onLanguageLinkClick"
        >
          {{ languageLabel }}
        </a>
        <button
          v-else-if="alternativeLocale"
          type="button"
          class="gj-header__tile gj-header__tile--medium gj-header__tile--text gj-header__tile--language"
          data-testid="gj-header-language"
          :aria-label="t('common.navigation.languageSelector')"
          @click="toggleLanguageSelect"
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
          <GlasJenaLineIcon v-if="isSearchOpen" name="close" />
          <GlasJenaLineIcon v-else name="search" />
        </button>

        <NuxtLink
          :to="localePath(paths.cart)"
          class="gj-header__tile gj-header__tile--cart"
          data-testid="gj-header-cart"
          :aria-label="t('cart.numberInCart', { count: cartItemsCount })"
        >
          <GlasJenaLineIcon name="cart" />
          <span v-if="cartItemsCount > 0" class="gj-header__badge" data-testid="gj-header-cart-badge">
            {{ cartItemsCount }}
          </span>
        </NuxtLink>
      </header>

      <div v-if="isSearchOpen" class="gj-header__search" data-testid="gj-header-search-panel">
        <UiSearch class="w-full !py-0" :close="closeSearch" />
      </div>

      <!--
      Phones and tablets: LTS-style menu behind the burger; rendered hidden so its links are in the server HTML.
      Teleported out of the header's stacking context so it covers the whole page like in the LTS shop.
    -->
      <Teleport v-if="viewport.isLessThan(DESKTOP_NAVIGATION_BREAKPOINT)" to="body">
        <GlasJenaMobileNavigation :categories="navigationBlock?.categories" @open-login="openLoginDialog" />
      </Teleport>

      <LanguageSelector />

      <!--
        Login and registration dialog of the original header, opened by the account tile (from 992 px) and by
        "log in" / "create an account" in the mobile menu; on phones it fills the screen.
      -->
      <UiModal
        v-if="isLoginOpen"
        v-model="isLoginOpen"
        tag="section"
        class="h-full @md:w-full @md:max-w-lg @md:h-fit m-0 p-0 overflow-y-auto"
        role="dialog"
        :aria-label="isLoginView ? t('authentication.login.submitLabel') : t('authentication.signup.heading')"
        data-testid="gj-header-login-dialog"
      >
        <header>
          <UiButton
            :aria-label="t('common.navigation.closeDialog')"
            square
            variant="tertiary"
            class="absolute right-2 top-2"
            @click="closeLogin"
          >
            <SfIconClose />
          </UiButton>
        </header>
        <LoginComponent
          v-if="isLoginView"
          :is-modal="true"
          @change-view="isLoginView = false"
          @logged-in="reloadAfterLogin"
        />
        <Register v-else :is-modal="true" @change-view="isLoginView = true" @registered="closeLogin" />
      </UiModal>
    </div>

    <!-- Next to the header, not inside it: the sticky header must not take the banner along -->
    <GlasJenaPageBanner />
  </template>
</template>

<script setup lang="ts">
import { SfDropdown, SfIconClose, useDisclosure } from '@storefront-ui/vue';
import HeaderBlocks from '~/components/ui/HeaderBlocks/HeaderBlocks.vue';
import LanguageSelector from '~/components/LanguageSelector/LanguageSelector.vue';
import { ACCOUNT_MENU_LINKS, AUTH_VIEW_LOGIN } from '../utils/accountMenu';
import { getNativeLanguageName } from '../utils/locale';
import { DESKTOP_NAVIGATION_BREAKPOINT, isPlainLeftClick } from '../utils/navigation';
import GlasJenaLineIcon from './GlasJenaLineIcon.vue';
import GlasJenaMobileNavigation from './GlasJenaMobileNavigation.vue';
import GlasJenaNavigation from './GlasJenaNavigation.vue';
import GlasJenaPageBanner from './GlasJenaPageBanner.vue';
import { NAVIGATION_BLOCK_NAME } from '~/utils/blocks/block-names';
import type { HeaderContainerBlock } from '~/components/blocks/structure/HeaderContainer/types';
import type { NavigationBlockProps } from '~/components/blocks/Navigation/types';
import type { GlasJenaAuthView } from './types';

const viewport = useViewport();
const localePath = useLocalizedPath();
const { isEditing } = useEditor();
const { headerContainer } = useBlocks();
const { data: cart } = useCart();
const { isAuthorized, logout } = useCustomer();
const { open: openMegaMenu } = useMegaMenu();
const { getAvailableLocales, switchLocale, toggle: toggleLanguageSelect } = useLocalization();
const { locale: currentLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();

/** The block editor keeps the original, editor-configurable header. */
const useOriginalHeader = computed(() => isEditing.value);

/** The editor's "sticky" layout setting, like the original header: sticky on all widths (from 992 px it always is, see CSS). */
const isSticky = computed(
  () => (headerContainer.value as HeaderContainerBlock | undefined)?.configuration?.layout?.sticky ?? false,
);

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

/**
 * The language link switches via `switchLocale` (which also updates the session). Modifier clicks keep the
 * browser's default, e.g. opening the other language in a new tab.
 */
const onLanguageLinkClick = async (event: MouseEvent) => {
  if (!alternativeLocale.value || !isPlainLeftClick(event)) {
    return;
  }
  event.preventDefault();
  // `false`: switching directly must not open the language selector panel
  await switchLocale(alternativeLocale.value, false);
};

const isSearchOpen = ref(false);

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;
};

const closeSearch = () => {
  isSearchOpen.value = false;
  return true;
};

/* Moving to another page (e.g. via a category in the navigation) closes the search bar; filters on the same page do not */
const route = useRoute();
watch(() => route.path, closeSearch);

/*
 * Account like the original header (components/blocks/Header/Header.vue): signed in, a menu with the account pages
 * and "log out"; otherwise the login dialog with a switch to the registration. The tile stays a real link to the
 * login page (opening it in a new tab keeps working); a plain click opens the dialog instead – handled in the
 * capture phase, so NuxtLink sees the prevented click and does not navigate. After logging in the page reloads,
 * like in the original.
 */
const { isOpen: isAccountMenuOpen, toggle: toggleAccountMenu, close: closeAccountMenu } = useDisclosure();
const { isOpen: isLoginOpen, open: openLogin, close: closeLogin } = useDisclosure();
const isLoginView = ref(true);

const accountMenuLinks = computed(() =>
  ACCOUNT_MENU_LINKS.map(({ pathKey, labelKey }) => ({ label: t(labelKey), link: localePath(paths[pathKey]) })),
);

const logOut = () => handleLogout({ logout, toggle: toggleAccountMenu });

/* Below 992 px the account tile moves into the burger menu: a still open account menu closes (see also the CSS) */
watch(
  () => viewport.isLessThan(DESKTOP_NAVIGATION_BREAKPOINT),
  (isBelowDesktop) => {
    if (isBelowDesktop) {
      closeAccountMenu();
    }
  },
);

const onLoginLinkClick = (event: MouseEvent) => {
  if (!isPlainLeftClick(event)) {
    return;
  }
  event.preventDefault();
  openLoginDialog(AUTH_VIEW_LOGIN);
};

/** The view the dialog starts with: the login, or the registration ("create an account" in the mobile menu). */
const startView = ref<GlasJenaAuthView>(AUTH_VIEW_LOGIN);
/** The element that had the focus when the dialog opened (account tile or menu button); it gets it back on close. */
let loginOpener: HTMLElement | null = null;

const openLoginDialog = (view: GlasJenaAuthView) => {
  startView.value = view;
  loginOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  openLogin();
};

const reloadAfterLogin = () => {
  window.location.reload();
};

/*
 * Each time the dialog opens, it starts with the login like the original, or with the registration when chosen in
 * the mobile menu. Beyond the original, for keyboard and screen reader users: the focus moves into the dialog (its
 * first field), so the dialog's focus trap and Esc work, and returns to the element that opened it when it closes.
 */
const LOGIN_DIALOG_SELECTOR = '[data-testid="gj-header-login-dialog"]';

watch(isLoginOpen, async (open) => {
  isLoginView.value = !open || startView.value === AUTH_VIEW_LOGIN;
  await nextTick();
  if (open) {
    document.querySelector<HTMLElement>(`${LOGIN_DIALOG_SELECTOR} input:not([type='hidden'])`)?.focus();
    return;
  }
  if (loginOpener?.isConnected) {
    loginOpener.focus();
  }
  loginOpener = null;
});
</script>

<style scoped>
/*
 * Layer `z-dropdown` (class in the template) like the original header: the overhanging logo and the open search
 * bar lie over the page content; cookie bar and mobile menu stay above.
 */
.gj-header-wrapper {
  position: relative;
  background-color: #fff;
}

.gj-header-wrapper--sticky {
  position: sticky;
  top: 0;
}

/* From the desktop navigation on (window width 992 px, like the LTS shop) the header always stays at the top */
@media (min-width: 992px) {
  .gj-header-wrapper {
    position: sticky;
    top: 0;
  }
}

/* Logo and tiles are partly links (logo, account, language, cart): no underline from the shop's global `html a` */
.gj-header a {
  text-decoration: none;
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

/*
 * Logo field like the LTS shop: the logo image (136 × 139 px, with its own blue background) fills the
 * field's width and overhangs the header where it is taller. Where it is lower, the field is filled in
 * the image's blue down to the header's lower edge and the logo sits at the bottom.
 */
.gj-header__logo {
  display: flex;
  flex-shrink: 0;
  align-items: flex-end;
  justify-content: center;
  align-self: flex-start;
  width: var(--gj-logo-width);
  min-height: var(--gj-header-height);
  background-color: var(--gj-logo-blue);
}

.gj-header__logo :deep(img) {
  width: 100%;
  max-width: 8.5rem;
  height: auto;
  max-height: none;
  /* Reserves the logo's height before the image has loaded, so the field does not jump */
  aspect-ratio: 136 / 139;
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

/* Language tile: the text like the navigation links (GlasJenaNavigation.vue), not light grey */
.gj-header__tile--text {
  font-size: 0.875rem;
  font-weight: 400;
  color: #263238;
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
  top: calc(50% - 1.4rem);
  right: 1.1rem;
  min-width: 1.1rem;
  padding: 0 0.25rem;
  font-size: 0.7rem;
  line-height: 1.1rem;
  text-align: center;
  background-color: var(--gj-slate-blue);
  color: #fff;
}

/*
 * Search bar like the LTS shop: exactly as high as the logo overhangs the header (47 px), so both end at the same
 * line; the input is 34 px high and centred. It starts next to the logo field (`--gj-logo-width`), so it never
 * covers the overhanging logo. Like the logo, it lies over the page content instead of pushing it down.
 */
.gj-header__search {
  position: absolute;
  top: var(--gj-header-height);
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  max-width: var(--gj-box-width);
  height: var(--gj-logo-overhang);
  margin: 0 auto;
  padding: 0 1rem 0 calc(var(--gj-logo-width) + 1rem);
  background-color: var(--gj-footer-bg);
}

.gj-header__search :deep(form[role='search'] > span) {
  height: 2.125rem;
}

/* Tablet: smaller tiles */
@container (max-width: 1279px) {
  .gj-header {
    --gj-tile-width: 4.25rem;
  }
}

/*
 * With the desktop navigation (window width from 992 px) the four tiles (account, language, search, cart) are
 * together exactly as wide as the "Did you know" box below them on the home page, a third of the header, as
 * requested by the shop owner: each a twelfth of the header's width (100 px at the full 1200 px). Unlike the LTS
 * shop the language tile is no narrower than the others.
 */
@media (min-width: 992px) {
  .gj-header__tile {
    width: calc(100% / 12);
  }
}

/*
 * Below the desktop navigation (window width under 992 px, same breakpoint as `DESKTOP_NAVIGATION_MIN_WIDTH`),
 * like the LTS shop. Media queries on purpose: like on the LTS shop, the window width including the scrollbar
 * counts (the shop's container is narrower by the scrollbar and would switch about 15 px later).
 * - The logo field takes 15 % of the header's width (`--gj-logo-width` in glas-jena.css, so the search bar and the
 *   page banner indent by the same width). The image stays at most 136 px wide; where the field is wider, the logo
 *   blue fills the sides.
 * - Burger layout: logo field, then menu, search and cart as three equally wide tiles across the full width.
 *   Account and language move into the menu, so no empty navigation area is left next to the logo.
 */
@media (max-width: 991.98px) {
  .gj-header__nav,
  .gj-header__tile--account,
  .gj-header__account-menu,
  .gj-header__tile--language {
    display: none;
  }

  .gj-header__tile {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
  }

  .gj-header__badge {
    right: calc(50% - 1.5rem);
  }
}

/* Phones: the search input takes the full width */
@media (max-width: 619.98px) {
  .gj-header__search {
    padding-left: 1rem;
  }
}

/*
 * Account menu (signed in): the dropdown wraps the tile, which keeps the full header height (stretched as a flex
 * item). The tile's own `display` stays untouched, so it is hidden below 992 px like when signed out.
 */
.gj-header__account {
  display: flex;
  align-self: stretch;
}

/*
 * Directly below the tile: Storefront UI places dropdowns 8 px below their trigger (`offset(8)` in useDropdown),
 * the negative margin takes that back.
 */
.gj-header__account-menu {
  min-width: 11.25rem;
  margin: -0.5rem 0 0;
  padding: 0;
  border: 1px solid var(--gj-tile-grey-blue);
  background-color: #fff;
  list-style: none;
}

/* Like the submenus of the navigation: 36 px high entries (above the 24 px minimum target size), current page highlighted */
.gj-header__account-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.375rem 0.625rem;
  font-size: 0.875rem;
  line-height: 1.5rem;
  white-space: nowrap;
  text-align: left;
  color: #263238;
  text-decoration: none;
}

.gj-header__account-item:hover,
.gj-header__account-item:focus-visible {
  background-color: #f8f9fa;
}

.gj-header__account-item[aria-current='page'] {
  background-color: var(--gj-tile-grey-blue);
}

.gj-header__account-separator {
  border-top: 1px solid var(--gj-tile-grey-blue);
}
</style>
