<template>
  <div>
    <FooterBlocks />
    <div class="gj-footnote" data-testid="gj-footnote">
      <span>© {{ currentYear }} GLAS<sup>IN</sup>JENA</span>
      <span>webdesign by 3W FUTURE</span>
    </div>
    <button
      v-show="showBackToTop"
      type="button"
      class="gj-back-to-top"
      data-testid="gj-back-to-top"
      :aria-label="t('backToTop')"
      @click="scrollToTop"
    >
      <SfIconExpandLess />
    </button>
  </div>
</template>

<script setup lang="ts">
import { SfIconExpandLess } from '@storefront-ui/vue';
import FooterBlocks from '~/components/ui/FooterBlocks/FooterBlocks.vue';

const SCROLL_THRESHOLD = 300;

const { t } = useI18n({ useScope: 'local' });

const currentYear = new Date().getFullYear();
const showBackToTop = ref(false);

const onScroll = () => {
  showBackToTop.value = window.scrollY > SCROLL_THRESHOLD;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<i18n lang="json">
{
  "en": { "backToTop": "Back to top" },
  "de": { "backToTop": "Nach oben" }
}
</i18n>

<style scoped>
/* Below 768px (same container breakpoint as the shop's `@md:`) the fixed mobile NavbarBottom covers the page bottom */
.gj-footnote {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 2rem;
  padding: 1.25rem 1rem calc(1.25rem + var(--gj-mobile-navbar-height));
  background-color: var(--gj-footnote-bg);
  color: var(--gj-text-muted);
  font-size: 0.875rem;
}

.gj-footnote sup {
  font-size: 0.6em;
}

.gj-back-to-top {
  position: fixed;
  right: 1rem;
  bottom: calc(1rem + var(--gj-mobile-navbar-height));
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background-color: var(--gj-tile-blue);
  color: #fff;
}

.gj-back-to-top:hover {
  background-color: var(--gj-mid-blue);
}

@container (min-width: 768px) {
  .gj-footnote {
    padding: 1.25rem 2.5rem;
  }

  .gj-back-to-top {
    bottom: 1rem;
  }
}
</style>
