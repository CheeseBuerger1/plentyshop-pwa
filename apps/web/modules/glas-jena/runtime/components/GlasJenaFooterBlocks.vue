<template>
  <div ref="rootRef">
    <FooterBlocks v-if="isEditing" />
    <footer v-else class="gj-footer" data-testid="gj-footer">
      <div class="gj-footer__inner">
        <nav class="gj-footer__nav" :aria-label="t('legalLinks')">
          <ul class="gj-footer__links">
            <li v-for="link in FOOTER_LINKS" :key="link.pathKey">
              <NuxtLink :to="localePath(paths[link.pathKey])" class="gj-footer__link">{{ t(link.labelKey) }}</NuxtLink>
            </li>
          </ul>
        </nav>
        <p class="gj-footer__copyright" data-testid="gj-footer-copyright">© {{ currentYear }} GLAS<sup>IN</sup>JENA</p>
      </div>
    </footer>
    <!-- From 768 px: floating button like the cookie settings button, mirrored to the right -->
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
    <!-- Phones: light blue bar across the whole width at the end of the page, like the LTS shop -->
    <button
      type="button"
      class="gj-back-to-top-bar"
      data-testid="gj-back-to-top-bar"
      :aria-label="t('backToTop')"
      @click="scrollToTop"
    >
      <SfIconArrowUpward size="lg" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { SfIconArrowUpward, SfIconExpandLess } from '@storefront-ui/vue';
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
const rootRef = ref<HTMLElement | null>(null);

/**
 * What scrolls the page: the window, or – with the editor UI (from 1024 px) – the page area of the editor, which
 * scrolls instead of the window. Scroll events do not bubble, so they are caught on the document in the capture
 * phase; only elements that contain the footer count (not e.g. a scrollable dropdown or slider).
 */
let scrollContainer: HTMLElement | undefined;

const onScroll = (event?: Event) => {
  const target = event?.target;
  if (target instanceof HTMLElement) {
    if (!rootRef.value || !target.contains(rootRef.value)) {
      return;
    }
    scrollContainer = target;
    showBackToTop.value = target.scrollTop > SCROLL_THRESHOLD;
    return;
  }
  scrollContainer = undefined;
  showBackToTop.value = window.scrollY > SCROLL_THRESHOLD;
};

const scrollToTop = () => {
  (scrollContainer ?? window).scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  onScroll();
});

onBeforeUnmount(() => {
  document.removeEventListener('scroll', onScroll, { capture: true });
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
 * Dark bar like the LTS shop (80 px high, #263238) across the whole window; links and copyright stay in the header
 * box (`__inner`): links in white Light on the left, copyright on the right. On phones (below 768 px window width)
 * the links stand one below the other and the copyright follows them. The bottom padding keeps clear of the
 * original mobile NavbarBottom where it is shown.
 *
 * The fixed buttons at the window's bottom corners (cookie settings on the left, back to top on the right) would
 * cover the links and the copyright at the end of the page. The side padding keeps their width free, minus the
 * space between window edge and box on wide windows (there the buttons sit next to the box and no extra padding
 * is needed).
 */
.gj-footer {
  --gj-footer-box-offset: max(0px, calc((100vw - var(--gj-box-width)) / 2));
  /* Width of the fixed buttons to keep free (only those customers see; the merchant's preview button is ignored) */
  --gj-footer-clearance-left: 3.75rem;
  --gj-footer-clearance-right: 3.75rem;

  background-color: var(--gj-footer-bg);
  color: #fff;
  font-weight: 300;
}

.gj-footer__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  /*
   * Links on the left, copyright on the right (the links' auto margin takes the free space). Where the copyright
   * does not fit next to the links, it moves to a line of its own and is centred there.
   */
  justify-content: center;
  column-gap: 2rem;
  max-width: var(--gj-box-width);
  min-height: 5rem;
  margin: 0 auto;
  padding: 0 max(1rem, calc(var(--gj-footer-clearance-right) - var(--gj-footer-box-offset)))
    var(--gj-mobile-navbar-height) max(1rem, calc(var(--gj-footer-clearance-left) - var(--gj-footer-box-offset)));
}

.gj-footer__nav {
  margin-right: auto;
}

/* The links always stay in one line (no "Impressum" on a line of its own) */
.gj-footer__links {
  display: flex;
  flex-wrap: nowrap;
  margin: 0;
  padding: 0;
  list-style: none;
}

/*
 * Like the LTS shop: each link is a box as high as the bar (28 px above and below, 18 px at the sides); on hover
 * the box turns darker instead of the text being underlined.
 */
.gj-footer__link {
  display: block;
  padding: 1.75rem 1.125rem;
  color: #fff;
  font-size: 1rem;
  line-height: 1.5rem;
  text-decoration: none;
}

.gj-footer__link:hover,
.gj-footer__link:focus-visible,
.gj-footer__link:active {
  background-color: var(--gj-footer-hover-bg);
}

.gj-footer__copyright {
  margin: 0;
  padding: 0.75rem 0;
  font-size: 0.9375rem;
}

.gj-footer__copyright sup {
  font-size: 0.6em;
}

/*
 * Floating back-to-top button (from 768 px): same look as the cookie settings button (GlasJenaCookiebar.vue) –
 * 44 px square in slate blue with a white icon, 8 px from the window's edges – mirrored to the bottom right.
 */
.gj-back-to-top {
  position: fixed;
  right: 0.5rem;
  bottom: 0.5rem;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background-color: var(--gj-slate-blue);
  color: #fff;
}

.gj-back-to-top:hover {
  filter: brightness(0.93);
}

/* Phones only, see below */
.gj-back-to-top-bar {
  display: none;
}

/* Narrower link boxes between 992 and 1199 px window width, like the LTS shop */
@media (min-width: 992px) and (max-width: 1199.98px) {
  .gj-footer__link {
    padding-right: 0.625rem;
    padding-left: 0.625rem;
  }
}

/*
 * Phones, like the LTS shop: the links one below the other as centred boxes across the full width (25 px above and
 * below), the copyright centred below them. Instead of the floating button, a light blue bar across the whole width
 * (45 px) with an arrow ends the page; it stays above the original NavbarBottom where that is shown.
 */
@media (max-width: 767.98px) {
  .gj-footer__inner {
    flex-direction: column;
    align-items: stretch;
    padding: 0;
  }

  .gj-back-to-top {
    display: none;
  }

  .gj-back-to-top-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 2.8125rem;
    margin-bottom: var(--gj-mobile-navbar-height);
    background-color: var(--gj-light-blue);
    color: #fff;
  }

  /* Full width for the centred link boxes (the auto margin would shrink the list to its content) */
  .gj-footer__nav {
    margin-right: 0;
  }

  .gj-footer__links {
    flex-direction: column;
  }

  .gj-footer__link {
    padding: 1.5625rem 1.125rem;
    text-align: center;
  }

  .gj-footer__copyright {
    text-align: center;
  }
}
</style>
