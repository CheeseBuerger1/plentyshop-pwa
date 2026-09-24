import { createResolver, defineNuxtModule } from 'nuxt/kit';
import type { NuxtPage } from 'nuxt/schema';

const COMPONENT_OVERRIDES: Record<string, string> = {
  UiFooterBlocks: './runtime/components/GlasJenaFooterBlocks.vue',
  UiHeaderBlocks: './runtime/components/GlasJenaHeaderBlocks.vue',
  /* No bottom navbar on phones, like the LTS shop (the auth layout still renders it) */
  UiNavbarBottom: './runtime/components/GlasJenaNavbarBottom.vue',
};

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
