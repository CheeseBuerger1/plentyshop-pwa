<template>
  <div>
    <FooterBlocks v-if="isEditing" />
    <footer v-else class="gj-footer" data-testid="gj-footer">
      <nav class="gj-footer__nav" :aria-label="t('legalLinks')">
        <ul class="gj-footer__links">
          <li v-for="link in FOOTER_LINKS" :key="link.pathKey">
            <NuxtLink :to="localePath(paths[link.pathKey])" class="gj-footer__link">{{ t(link.labelKey) }}</NuxtLink>
          </li>
        </ul>
      </nav>
      <p class="gj-footer__copyright" data-testid="gj-footer-copyright">© {{ currentYear }} GLAS<sup>IN</sup>JENA</p>
    </footer>
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
import { FOOTER_LINKS } from '../utils/footer';

const SCROLL_THRESHOLD = 300;

/**
 * Footer like the LTS shop: a dark bar with the legal links on the left and the copyright on the right (where the
 * LTS shop shows shipping and payment icons). The block editor keeps the original, editor-configurable footer.
 */
const { t } = useI18n({ useScope: 'local' });
const { isEditing } = useEditor();
const localePath = useLocalizedPath();

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
  "de": {
    "backToTop": "Nach oben",
    "legalLinks": "Rechtliches",
    "termsAndConditions": "AGB",
    "cancellationRights": "Widerruf",
    "privacyPolicy": "Datenschutz",
    "shipping": "Versand",
    "contact": "Kontakt",
    "legalDisclosure": "Impressum"
  },
  "en": {
    "backToTop": "Back to top",
    "legalLinks": "Legal",
    "termsAndConditions": "Terms and conditions",
    "cancellationRights": "Cancellation",
    "privacyPolicy": "Privacy policy",
    "shipping": "Shipping",
    "contact": "Contact",
    "legalDisclosure": "Legal disclosure"
  }
}
</i18n>

<style scoped>
/*
 * Dark bar like the LTS shop (80 px high, #263238), as wide as the header box: links in white Light on the left,
 * copyright on the right. On phones (below 768 px window width) the links stand one below the other and the
 * copyright follows them. The bottom padding keeps clear of the original mobile NavbarBottom where it is shown.
 *
 * The fixed buttons at the window's bottom corners (cookie settings on the left, back to top on the right) would
 * cover the links and the copyright at the end of the page. The side padding keeps their width free, minus the
 * space between window edge and box on wide windows (there the buttons sit next to the box and no extra padding
 * is needed).
 */
.gj-footer {
  --gj-footer-box-offset: max(0px, calc((100vw - var(--gj-box-width)) / 2));
  /* Width of the fixed buttons to keep free; larger in preview mode, see glas-jena.css */
  --gj-footer-clearance-left: 3.75rem;
  --gj-footer-clearance-right: 4.5rem;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
  max-width: var(--gj-box-width);
  min-height: 5rem;
  margin: 0 auto;
  padding: 1.25rem max(1rem, calc(var(--gj-footer-clearance-right) - var(--gj-footer-box-offset)))
    calc(1.25rem + var(--gj-mobile-navbar-height))
    max(1rem, calc(var(--gj-footer-clearance-left) - var(--gj-footer-box-offset)));
  background-color: var(--gj-footer-bg);
  color: #fff;
  font-weight: 300;
}

.gj-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gj-footer__link {
  color: #fff;
  font-size: 1rem;
  text-decoration: none;
}

.gj-footer__link:hover,
.gj-footer__link:focus-visible {
  text-decoration: underline;
}

.gj-footer__copyright {
  margin: 0;
  font-size: 0.9375rem;
}

.gj-footer__copyright sup {
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

/* Phones: links one below the other; the fixed buttons are kept clear below the copyright instead of at the sides */
@media (max-width: 767.98px) {
  .gj-footer {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem 1rem calc(4rem + var(--gj-mobile-navbar-height));
  }

  .gj-footer__links {
    flex-direction: column;
  }
}

@container (min-width: 768px) {
  .gj-back-to-top {
    bottom: 1rem;
  }
}
</style>
