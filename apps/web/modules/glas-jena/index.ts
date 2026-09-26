import { addTemplate, createResolver, defineNuxtModule } from 'nuxt/kit';
import type { NuxtPage } from 'nuxt/schema';
import { DESKTOP_NAVIGATION_BREAKPOINT, DESKTOP_NAVIGATION_MIN_WIDTH } from './runtime/utils/navigation';

/** Original components (Nuxt name) replaced by the module's own ones. */
export const COMPONENT_OVERRIDES: Record<string, string> = {
  UiFooterBlocks: './runtime/components/GlasJenaFooterBlocks.vue',
  UiHeaderBlocks: './runtime/components/GlasJenaHeaderBlocks.vue',
  /* Checkout: the original simplified header plus the page banner */
  UiSimplifiedHeader: './runtime/components/GlasJenaSimplifiedHeader.vue',
  /* No bottom navbar on phones, like the LTS shop (the auth layout still renders it) */
  UiNavbarBottom: './runtime/components/GlasJenaNavbarBottom.vue',
};

/** Alias under which nuxt-viewport provides its generated options to its runtime plugins. */
const VIEWPORT_OPTIONS_ALIAS = '#viewport-options';

/** The shop has no wishlist: these pages are removed, so old links end on the 404 page. */
const REMOVED_PAGE_FILES = ['/pages/wishlist.vue', '/pages/my-account/wishlist.vue'];

const isRemovedPage = (page: NuxtPage) => {
  const file = page.file?.replace(/\\/g, '/') ?? '';
  return REMOVED_PAGE_FILES.some((removed) => file.endsWith(removed));
};

const removePages = (pages: NuxtPage[]) => {
  for (let index = pages.length - 1; index >= 0; index--) {
    const page = pages[index];
    if (!page) {
      continue;
    }
    if (isRemovedPage(page)) {
      pages.splice(index, 1);
      continue;
    }
    if (page.children) {
      removePages(page.children);
    }
  }
};

/**
 * GLAS IN JENA theme module.
 *
 * Keeps all shop-specific design customisations out of the original plentyshop-pwa files,
 * so updates from plentymarkets/plentyshop-pwa can be merged without conflicts.
 * See docs/glas-jena/glas-jena-design.md for the design rules.
 */
export default defineNuxtModule({
  meta: {
    name: 'glas-jena',
  },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    nuxt.options.css.push(resolve('./runtime/glas-jena.css'));

    /*
     * Own nuxt-viewport breakpoint for the desktop navigation, so the shop's `lg` (1024 px) and its config stay
     * untouched. nuxt-viewport has already read its options when this local module runs, so its generated options
     * are extended instead: our template re-exports them with the extra breakpoint and takes over the alias.
     */
    const viewportOptionsPath = nuxt.options.alias[VIEWPORT_OPTIONS_ALIAS];
    if (viewportOptionsPath) {
      nuxt.options.alias[VIEWPORT_OPTIONS_ALIAS] = addTemplate({
        filename: 'glas-jena/viewport-options.mjs',
        getContents: () =>
          [
            `import options from ${JSON.stringify(viewportOptionsPath)};`,
            `export default { ...options, breakpoints: { ...options.breakpoints, ${JSON.stringify(DESKTOP_NAVIGATION_BREAKPOINT)}: ${DESKTOP_NAVIGATION_MIN_WIDTH} } };`,
          ].join('\n'),
      }).dst;
    } else {
      console.warn('[glas-jena] nuxt-viewport options not found; the desktop navigation breakpoint is missing.');
    }

    nuxt.hook('components:extend', (components) => {
      for (const component of components) {
        const override = COMPONENT_OVERRIDES[component.pascalName];
        if (override) {
          component.filePath = resolve(override);
        }
      }
    });

    nuxt.hook('pages:extend', removePages);
  },
});
