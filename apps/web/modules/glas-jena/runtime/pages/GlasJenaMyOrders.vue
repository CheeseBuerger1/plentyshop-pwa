<template>
  <ClientOnly>
    <UiDivider class="col-span-full -mx-4 !w-auto @md:mx-0" />
    <h2
      class="hidden @md:block col-span-full typography-headline-4 font-bold mx-4 capitalize"
      data-testid="account-orders-heading"
    >
      {{ t('account.ordersAndReturns.myOrders') }}
    </h2>

    <div v-if="loading && !data" class="col-span-full flex justify-center items-center min-h-[400px]">
      <SfLoaderCircular size="2xl" />
    </div>

    <div
      v-else-if="!data || data.data.entries.length === 0"
      class="col-span-full text-center"
      data-testid="account-orders-content"
    >
      <h3 class="typography-headline-3 font-bold mt-6 mb-4">{{ t('account.ordersAndReturns.noOrders') }}</h3>
      <UiButton :tag="NuxtLink" :to="localePath(paths.category)" variant="secondary" class="!ring-neutral-200">
        {{ t('account.ordersAndReturns.continue') }}
      </UiButton>
    </div>

    <div v-else class="gj-orders col-span-full" data-testid="account-orders-content">
      <div class="relative" :class="{ 'pointer-events-none opacity-50': loading }">
        <SfLoaderCircular v-if="loading" class="absolute top-0 bottom-0 right-0 left-0 m-auto z-loader" size="2xl" />

        <!-- Column headings of the wide layout; each order names its fields itself for screen readers -->
        <div class="gj-orders__row gj-orders__head" aria-hidden="true">
          <span>{{ t('account.ordersAndReturns.orderId') }}</span>
          <span>{{ t('account.ordersAndReturns.orderDate') }}</span>
          <span class="gj-orders__amount">{{ t('account.ordersAndReturns.amount') }}</span>
          <span>{{ t('account.ordersAndReturns.shippingDate') }}</span>
          <span>{{ t('account.ordersAndReturns.status') }}</span>
          <span />
        </div>

        <ul class="gj-orders__list" :aria-label="t('account.ordersAndReturns.listOfOrders')">
          <li
            v-for="order in data.data.entries"
            :key="orderGetters.getId(order)"
            class="gj-orders__row gj-orders__order"
            :class="{ 'gj-orders__order--no-ship': !orderGetters.getShippingDate(order, locale) }"
            data-testid="gj-order"
          >
            <dl class="gj-orders__fields">
              <div class="gj-orders__field">
                <dt>{{ t('account.ordersAndReturns.orderId') }}</dt>
                <dd class="gj-orders__nowrap gj-orders__id" data-testid="gj-order-id">
                  {{ orderGetters.getId(order) }}
                </dd>
              </div>
              <div class="gj-orders__field">
                <dt>{{ t('account.ordersAndReturns.orderDate') }}</dt>
                <dd>{{ orderGetters.getDate(order, locale) }}</dd>
              </div>
              <div class="gj-orders__field gj-orders__amount">
                <dt>{{ t('account.ordersAndReturns.amount') }}</dt>
                <dd class="gj-orders__nowrap" data-testid="gj-order-amount">{{ getAmount(order) }}</dd>
              </div>
              <div
                class="gj-orders__field"
                :class="{ 'gj-orders__field--empty': !orderGetters.getShippingDate(order, locale) }"
              >
                <dt>{{ t('account.ordersAndReturns.shippingDate') }}</dt>
                <dd>{{ orderGetters.getShippingDate(order, locale) || '–' }}</dd>
              </div>
              <div class="gj-orders__field">
                <dt>{{ t('account.ordersAndReturns.status') }}</dt>
                <dd>{{ orderGetters.getStatus(order) }}</dd>
              </div>
            </dl>
            <div class="gj-orders__details">
              <NuxtLink
                :to="generateOrderDetailsLink(order)"
                class="gj-orders__link"
                data-testid="gj-order-details-link"
              >
                {{ t('account.ordersAndReturns.details') }}
                <span class="sr-only">{{ t('account.ordersAndReturns.orderId') }} {{ orderGetters.getId(order) }}</span>
              </NuxtLink>
            </div>
          </li>
        </ul>

        <UiPagination
          v-if="data.data.lastPageNumber > 1"
          :disabled="loading"
          :current-page="data.data.page"
          :total-items="data.data.totalsCount"
          :page-size="data.data.itemsPerPage"
          :max-visible-pages="maxVisiblePages"
        />
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { type Order, orderGetters } from '@plentymarkets/shop-api';
import { SfLoaderCircular } from '@storefront-ui/vue';
import type { Locale } from '#i18n';

/*
 * "My orders" like the original page (pages/my-account/my-orders.vue: same data, paging, empty state), as requested by
 * the shop owner with one layout for all widths instead of a long list on phones and a table that is cut off next to
 * the account menu on tablets: each order is a block whose fields stand in one row with column headings where the
 * content area is wide enough, otherwise in two columns with their labels. Without the three-dot menu ("buy again",
 * "return": neither is offered); "Details" is a link.
 */
defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

definePageMeta({
  layout: 'account',
  pageType: 'static',
  middleware: ['auth-guard'],
});

const NuxtLink = resolveComponent('NuxtLink');
const route = useRoute();
const localePath = useLocalizedPath();
const { formatWithSymbol } = usePriceFormatter();
const { locale } = useI18n();
const { fetchCustomerOrders, data, loading } = useCustomerOrders();
const viewport = useViewport();
/*
 * Page numbers: up to five from 640 px and for lists of up to five pages. Only longer lists on phones show one number
 * (the original: below 1024 px always one, where the shop's pagination then lists the second page twice ("1 2 2")).
 */
const MAX_VISIBLE_PAGES = 5;
const maxVisiblePages = computed(() =>
  viewport.isGreaterOrEquals('sm') || (data.value?.data.lastPageNumber ?? 0) <= MAX_VISIBLE_PAGES
    ? MAX_VISIBLE_PAGES
    : 1,
);

/** Order total like the original table: net for net orders, otherwise gross. */
const getAmount = (order: Order) => {
  const totals = orderGetters.getTotals(order);
  const amount = totals.isNet ? orderGetters.getTotalNet(totals) : orderGetters.getTotal(totals);
  return formatWithSymbol(amount, orderGetters.getCurrency(order));
};

const generateOrderDetailsLink = (order: Order) =>
  localePath(`${paths.confirmation}/${orderGetters.getId(order)}/${orderGetters.getAccessKey(order)}`);

watch(
  () => route.query.page,
  (page) => fetchCustomerOrders({ page: Number(page) || defaults.DEFAULT_PAGE }),
  { immediate: true },
);
</script>

<style scoped>
/* The layout follows the width of the content area (next to the account menu), not of the window */
.gj-orders {
  container-type: inline-size;
  margin: 0;
  font-size: 1rem;
}

.gj-orders__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.gj-orders dl {
  margin: 0;
}

.gj-orders dd {
  margin: 0;
}

/*
 * Narrow: every order its own card (wish of the shop owner, variant C): a grey header with the order ID and the status,
 * below date and amount (right) with their labels above; at the bottom the shipping date at the left (only if there is
 * one) and "Details" at the right.
 */
.gj-orders__order {
  position: relative;
  margin-bottom: 0.75rem;
  overflow: hidden;
  background: #fff;
  border: 1px solid #c5ced6;
  border-radius: 0.5rem;
}

.gj-orders__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* Column headings only in the wide layout */
.gj-orders__row.gj-orders__head {
  display: none;
}

.gj-orders__fields {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
  padding: 0 0.875rem 0.625rem;
}

/* No shipping date: room for the "Details" link in the footer line of the card (with a shipping date it stands next to it) */
.gj-orders__order--no-ship .gj-orders__fields {
  padding-bottom: 2.5rem;
}

/* The grey header band: a grid item in the first row, as wide as the card */
.gj-orders__fields::before {
  content: '';
  grid-area: 1 / 1 / 2 / -1;
  margin: 0 -0.875rem;
  background: #eef2f5;
  border-bottom: 1px solid #d5dde3;
}

/* Order ID with its label in front on one line ("Auftrags-ID 43942") */
.gj-orders__field:nth-child(1) {
  display: flex;
  grid-area: 1 / 1;
  gap: 0.5rem;
  align-items: baseline;
  padding: 0.625rem 0;
}

.gj-orders__field:nth-child(5) {
  grid-area: 1 / 2;
  padding: 0.625rem 0;
  text-align: right;
}

.gj-orders__field:nth-child(2) {
  grid-area: 2 / 1;
  margin-top: 0.25rem;
}

.gj-orders__field:nth-child(3) {
  grid-area: 2 / 2;
  margin-top: 0.25rem;
  text-align: right;
}

.gj-orders__field:nth-child(4) {
  grid-area: 3 / 1;
}

/* No shipping date yet: no empty field in the card (the table shows a dash) */
.gj-orders__field--empty:nth-child(n) {
  display: none;
}

/* Labels smaller and lighter than the values (#595959 on white 7:1), so the values stand out */
.gj-orders__field dt {
  font-size: 0.875rem;
  font-weight: 400;
  color: #595959;
}

/* The status speaks for itself: its label only for screen readers */
.gj-orders__field:nth-child(5) dt {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.gj-orders__nowrap {
  white-space: nowrap;
}

/* The order ID stands out (semi-bold, darker) so that the orders can be told apart at a glance */
.gj-orders__id {
  font-weight: 600;
  color: #263238;
}

/* Footer line of the card: "Details" at the right, level with the shipping date at the left (if there is one) */
.gj-orders__details {
  position: absolute;
  right: 0.875rem;
  bottom: 0.625rem;
}

/* Link in the shop's link colour, underlined (#2c5572 on white 7.9:1); at least 24 px high as a target */
.gj-orders__link {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  color: var(--gj-link);
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.gj-orders__link:is(:hover, :focus-visible) {
  color: var(--gj-link-hover);
}

/*
 * Wide: one row per order under column headings, without the card; the labels of the fields are only for screen readers
 * there. Columns: order ID, date, amount (right-aligned), shipping date, status, "Details". From 33rem (528 px) of
 * content width, with 14 px text like the original table: its columns need about 500 px (order ID, dates and amount
 * never wrap, the status may wrap onto two lines), so the table holds down to a window width of about 560 px (the
 * account menu is hidden below 825 px; before: 40rem and 16 px text next to a 300 px menu, switching at about 1010 px).
 */
@container (min-width: 33rem) {
  .gj-orders__list {
    font-size: 0.875rem;
  }

  .gj-orders__order {
    margin: 0;
    padding: 1rem 0;
    overflow: visible;
    background: none;
    border: 0;
    border-bottom: 1px solid #ddd;
    border-radius: 0;
  }

  .gj-orders__row {
    grid-template-columns:
      minmax(5em, 1fr) minmax(6.5em, 1fr) minmax(5.75em, 1fr) minmax(5.5em, 1fr) minmax(5.75em, 1.2fr)
      auto;
    column-gap: 1rem;
    align-items: baseline;
  }

  .gj-orders__row.gj-orders__head {
    display: grid;
    padding: 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    border-bottom: 2px solid #ddd;
    white-space: nowrap;
  }

  /* The fields take the row's columns (subgrid), so they line up with the headings and between the orders */
  .gj-orders__fields {
    grid-column: 1 / 6;
    grid-template-columns: subgrid;
    padding: 0;
  }

  .gj-orders__fields::before {
    display: none;
  }

  .gj-orders__order--no-ship .gj-orders__fields {
    padding-bottom: 0;
  }

  .gj-orders__field dt {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .gj-orders__field:nth-child(n) {
    display: block;
    grid-area: auto;
    margin: 0;
    padding: 0;
    text-align: left;
  }

  .gj-orders__field:nth-child(3) {
    text-align: right;
  }

  .gj-orders__head .gj-orders__amount {
    text-align: right;
  }

  .gj-orders__details {
    position: static;
    grid-column: 6;
  }
}
</style>

<style>
/*
 * Next to the menu (wide account layout, class set by GlasJenaAccountLayout.vue) the table lines up with the page title
 * (margin of 16 px); otherwise the page margin of the layout is enough. Not scoped: Vue drops the part after
 * `:global(...)` of a scoped rule.
 */
.gj-account-layout--wide .gj-orders {
  margin: 0 1rem;
}
</style>
