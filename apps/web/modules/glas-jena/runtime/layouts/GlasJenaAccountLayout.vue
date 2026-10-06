<template>
  <NuxtLayout name="default" :breadcrumbs="breadcrumbs">
    <!-- `gj-account-layout--wide`: from 825 px window width, also for the page titles of the account pages (glas-jena.css) -->
    <NarrowContainer
      :class="['mb-20', { 'px-4': !isMenuPage && !isWide, 'gj-account-layout--wide': isWide }]"
      data-testid="account-layout"
    >
      <!-- Hidden while the page banner shows "Mein Konto" (glas-jena.css) -->
      <h1
        v-if="isWide || isMenuPage"
        :class="['font-bold', isWide ? 'my-10 mx-0 typography-headline-2' : 'mt-4 mb-10 mx-4 typography-headline-3']"
        data-testid="account-layout-heading"
      >
        {{ t('account.heading') }}
      </h1>

      <!--
        Phones, account subpage: the way back to the menu, then the page's name (below the banner's h1 "Mein Konto").
        Like the back button of iOS and Material Design: top left, named after its target, 44 px high for fingers.
      -->
      <div v-else class="mb-10 mt-4" data-testid="gj-account-subpage-heading">
        <UiButton
          :tag="NuxtLink"
          :to="menuPagePath"
          class="-ml-4 mb-2 min-h-11 whitespace-nowrap"
          variant="tertiary"
          data-testid="gj-account-back"
        >
          <template #prefix>
            <SfIconArrowBack aria-hidden="true" />
          </template>
          {{ t('account.heading') }}
        </UiButton>

        <h2 class="font-bold typography-headline-3">{{ currentSectionLabel }}</h2>
      </div>

      <!--
        Phone or wide layout by window width (`isWide`) for every part, unlike the original, which mixes the window
        width (heading) and the width of the shop area (menu, by `@md`, about 15 px later with a scrollbar): there,
        windows of 768–783 px showed neither the menu nor the way back. Here the switch is at 825 px (own breakpoint).
      -->
      <div :class="['gj-account-columns', { flex: isWide }]" data-testid="account-page-sidebar">
        <nav
          :aria-label="t('account.heading')"
          :class="[
            'border-neutral-200',
            isWide ? 'gj-account-menu border rounded-md' : 'border-t pt-4 pb-4',
            { hidden: !isMenuPage && !isWide },
          ]"
          data-testid="gj-account-menu"
        >
          <!--
            Each section with a real heading, bold and larger than its links (in the original only a list entry in
            medium weight, hard to tell apart from the links on phones)
          -->
          <section
            v-for="({ title, icon, subsections }, secIndex) in sections"
            :key="`section-${secIndex}`"
            :aria-labelledby="`gj-account-section-${secIndex}`"
            class="[&:not(:last-child)]:mb-4"
          >
            <h2
              :id="`gj-account-section-${secIndex}`"
              :class="[
                'flex items-center gap-2 px-4 pb-2 font-bold typography-text-lg text-neutral-900',
                isWide ? 'pt-2' : 'pt-4',
              ]"
              data-testid="gj-account-menu-heading"
            >
              <Component :is="icon" aria-hidden="true" />
              {{ title }}
            </h2>

            <ul>
              <li v-for="({ label, link }, subIndex) in subsections" :key="`subsection-${subIndex}`">
                <SfListItem
                  :tag="NuxtLink"
                  :to="link"
                  :aria-current="currentPath === link ? 'page' : undefined"
                  :class="[
                    '!pl-8 rounded-md active:bg-primary-100 !text-neutral-900',
                    isWide ? 'first-of-type:px-4 first-of-type:py-2' : 'first-of-type:py-4',
                    {
                      'font-medium bg-primary-100': currentPath === link,
                    },
                  ]"
                >
                  <template #prefix><SfIconBase /></template>
                  {{ label }}
                  <template v-if="!isWide" #suffix><SfIconChevronRight /></template>
                </SfListItem>
              </li>
            </ul>
          </section>
          <UiDivider />
          <!-- A real button (the original's is a clickable list entry, not reachable by keyboard); outline look in glas-jena.css -->
          <!-- Lined up with the text of the section headings (16 px padding + 24 px icon + 8 px gap) -->
          <div class="mt-4 pl-12 pr-4">
            <button type="button" data-testid="account-logout-button" @click="logOut">
              {{ t('account.logout') }}
            </button>
          </div>
        </nav>

        <!-- The menu page on phones shows only the menu -->
        <div class="flex-1 min-w-0" :class="{ hidden: isMenuPage && !isWide }">
          <section
            class="grid grid-cols-1 @2xs:grid-cols-2 gap-4 @md:gap-6 @md:grid-cols-2 @lg:grid-cols-3 @3xl:grid-cols-4 mb-10 @md:mb-5"
            data-testid="category-grid"
          >
            <NuxtPage />
          </section>
        </div>
      </div>
    </NarrowContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  SfIconBase,
  SfIconPerson,
  SfIconShoppingCart,
  SfListItem,
  SfIconArrowBack,
  SfIconChevronRight,
} from '@storefront-ui/vue';
import { ACCOUNT_MENU_BREAKPOINT, ACCOUNT_MENU_PAGE_PATH, logOutToHomePage } from '../utils/accountMenu';
import { ACCOUNT_ROUTE_PREFIX } from '../utils/pageBanner';

/**
 * Account layout like the original (layouts/account.vue), with one change for phones (below 825 px): the menu has
 * its own page, `/my-account/`, and every account page – also "Persönliche Daten", the start page of the account –
 * shows only its content with a link "← Mein Konto" back to the menu. In the original, the start page shows the menu above the
 * personal data and has no way back. From 825 px the menu stays next to the content as in the original (the original: 768 px); the menu
 * page then opens the start page. Without the wishlist and returns, which the shop does not offer (see index.ts).
 */
const localePath = useLocalizedPath();
const viewport = useViewport();
const route = useRoute();
const getRouteBaseName = useRouteBaseName();
const { logout } = useCustomer();

const sections = computed(() => [
  {
    title: t('account.accountSettings.heading'),
    icon: SfIconPerson,
    subsections: [
      {
        label: t('account.accountSettings.section.personalData'),
        link: localePath(paths.accountPersonalData),
      },
      {
        label: t('account.accountSettings.section.billingDetails'),
        link: localePath(paths.accountBillingDetails),
      },
      {
        label: t('account.accountSettings.section.shippingDetails'),
        link: localePath(paths.accountShippingDetails),
      },
    ],
  },
  {
    title: t('account.ordersAndReturns.heading'),
    icon: SfIconShoppingCart,
    subsections: [
      {
        label: t('account.ordersAndReturns.section.myOrders'),
        link: localePath(paths.accountMyOrders),
      },
    ],
  },
]);

const currentPath = computed(() => route.path);
const menuPagePath = computed(() => localePath(ACCOUNT_MENU_PAGE_PATH));
const isMenuPage = computed(() => getRouteBaseName(route) === ACCOUNT_ROUTE_PREFIX);
/** From 825 px window width: menu next to the content; below, the menu page and the account pages on their own. */
const isWide = computed(() => viewport.isGreaterOrEquals(ACCOUNT_MENU_BREAKPOINT));

const findCurrentPage = computed(() =>
  sections.value.flatMap(({ subsections }) => subsections).find(({ link }) => currentPath.value.includes(link)),
);

const currentSectionLabel = computed(() => findCurrentPage.value?.label || '');

const breadcrumbs = computed(() => [
  { name: t('common.labels.home'), link: localePath(paths.home) },
  { name: t('account.heading'), link: localePath(paths.account) },
  ...(isMenuPage.value ? [] : [{ name: currentSectionLabel.value, link: currentPath.value }]),
]);

/* From 825 px the menu is always next to the content: the menu page opens the start page of the account instead */
watch(
  [isMenuPage, isWide],
  ([menuPage, wide]) => {
    if (menuPage && wide) {
      navigateTo(localePath(paths.account), { replace: true });
    }
  },
  { immediate: true },
);

const NuxtLink = resolveComponent('NuxtLink');

const logOut = () => logOutToHomePage(logout, () => {}, localePath(paths.home));
</script>

<style scoped>
/*
 * Menu and content next to each other (from 825 px): the original gives the menu at least 300 px and a gap of 40 px
 * however narrow the window is, which leaves the content little room and a lot of empty space. Here the menu and the gap
 * shrink with the window: the menu from 300 px (at 1200 px window width and wider) to 240 px, the gap from 40 to 16 px. 240 px is
 * what the longest entry (heading "Kontoeinstellungen" with icon) needs, with the smaller padding below 1200 px.
 */
.gj-account-columns {
  gap: clamp(1rem, 3vw, 2.5rem);
}

.gj-account-menu {
  flex: 0 0 clamp(15rem, 25vw, 18.75rem);
  padding: 0.5rem;
}

@media (min-width: 1200px) {
  .gj-account-menu {
    padding: 1rem;
  }
}
</style>
