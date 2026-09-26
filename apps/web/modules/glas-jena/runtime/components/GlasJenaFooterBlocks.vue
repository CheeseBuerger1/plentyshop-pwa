<template>
  <div ref="rootRef">
    <FooterBlocks v-if="isEditing" />
    <footer v-else class="gj-footer" :class="{ 'gj-footer--stacked': isStacked }" data-testid="gj-footer">
      <div ref="innerRef" class="gj-footer__inner">
        <nav ref="navRef" class="gj-footer__nav" :aria-label="t('legalLinks')">
          <ul class="gj-footer__links">
            <li v-for="link in FOOTER_LINKS" :key="link.pathKey">
              <NuxtLink :to="localePath(paths[link.pathKey])" class="gj-footer__link">{{ t(link.labelKey) }}</NuxtLink>
            </li>
          </ul>
        </nav>
        <p ref="copyrightRef" class="gj-footer__copyright" data-testid="gj-footer-copyright">
          © {{ currentYear }} GLAS<sup>IN</sup>JENA
        </p>
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
import { useResizeObserver } from '@vueuse/core';
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

const innerRef = ref<HTMLElement | null>(null);
const navRef = ref<HTMLElement | null>(null);
const copyrightRef = ref<HTMLElement | null>(null);
/**
 * Whether the copyright does not fit next to the links. Then it gets a line of its own (with a separating line)
 * and links and copyright are centred. Measured instead of a fixed breakpoint, as the link texts differ in length
 * between the languages. Computed from the natural widths (links, gap, copyright text) rather than from where the
 * copyright ended up, because in the stacked state it takes the whole width and would otherwise never move back.
 */
const isStacked = ref(false);

const getTextWidth = (element: HTMLElement) => {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().width;
};

const checkStacked = () => {
  if (!innerRef.value || !navRef.value || !copyrightRef.value) {
    return;
  }
  const innerStyle = getComputedStyle(innerRef.value);
  const available =
    innerRef.value.clientWidth - parseFloat(innerStyle.paddingLeft) - parseFloat(innerStyle.paddingRight);
  const linksWidth = [...navRef.value.querySelectorAll('li')].reduce(
    (sum, item) => sum + item.getBoundingClientRect().width,
    0,
  );
  const gap = parseFloat(innerStyle.columnGap) || 0;
  isStacked.value = linksWidth + gap + getTextWidth(copyrightRef.value) > available;
};

/* The bar (window width) and the links (texts change with the language) */
useResizeObserver(innerRef, checkStacked);
useResizeObserver(navRef, checkStacked);

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
    "termsAndConditions": "T&Cs",
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

  overflow-x: clip;
  background-color: var(--gj-footer-bg);
  color: #fff;
  /* Regular instead of the LTS shop's Light: better legible on the dark background */
  font-weight: 400;
}

.gj-footer__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  /*
   * Links on the left, copyright on the right (the links' auto margin takes the free space). Where the copyright
   * does not fit next to the links, it moves to a line of its own; then links and copyright are centred
   * (`gj-footer--stacked`, set by the component).
   */
  justify-content: center;
  column-gap: 2rem;
  max-width: var(--gj-box-width);
  min-height: 5rem;
  margin: 0 auto;
  padding: 0 max(1rem, calc(var(--gj-footer-clearance-right) - var(--gj-footer-box-offset)))
    var(--gj-mobile-navbar-height) max(1rem, calc(var(--gj-footer-clearance-left) - var(--gj-footer-box-offset)));
}

/* At most as wide as the bar: the copyright moves to the next line before the links would wrap */
.gj-footer__nav {
  max-width: 100%;
  margin-right: auto;
}

.gj-footer--stacked .gj-footer__nav {
  margin-right: 0;
}

/*
 * Copyright on a line of its own (from 768 px; phones see below): centred, separated by the same thin line, drawn
 * across the whole window like the bar itself (the bar clips it at the window's edges).
 */
@media (min-width: 768px) {
  .gj-footer--stacked .gj-footer__copyright {
    position: relative;
    flex-basis: 100%;
    text-align: center;
  }

  .gj-footer--stacked .gj-footer__copyright::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 100vw;
    border-top: 1px solid rgb(255 255 255 / 0.12);
    transform: translateX(-50%);
  }
}

/*
 * The links stay in one line wherever they fit (German always from 768 px); only where even that is too narrow
 * (long English texts just above 768 px) they wrap, centred. A single link never wraps.
 */
.gj-footer__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0;
  padding: 0;
  list-style: none;
  white-space: nowrap;
}

/*
 * Like the LTS shop: each link is a box as high as the bar (28 px above and below, 18 px at the sides); on hover
 * the box turns lighter instead of the text being underlined (clearly visible, unlike the LTS shop's darker tone).
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
 * Phones: the links as centred boxes in two columns across the full width (25 px above and below, thin separating
 * lines) – half the height of the LTS shop's single column –, the copyright centred below them. Instead of the
 * floating button, a light blue bar across the whole width (45 px) with an arrow ends the page, like the LTS shop;
 * it stays above the original NavbarBottom where that is shown.
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

  /* The bottom line separates the links from the copyright, like the lines between the boxes */
  .gj-footer__links {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid rgb(255 255 255 / 0.12);
    white-space: normal;
  }

  .gj-footer__link {
    padding: 1.5625rem 0.5rem;
    text-align: center;
  }

  /* Thin lines between the columns and the rows */
  .gj-footer__links li:nth-child(odd) .gj-footer__link {
    border-right: 1px solid rgb(255 255 255 / 0.12);
  }

  .gj-footer__links li:nth-child(n + 3) .gj-footer__link {
    border-top: 1px solid rgb(255 255 255 / 0.12);
  }

  .gj-footer__copyright {
    text-align: center;
  }
}
</style>
