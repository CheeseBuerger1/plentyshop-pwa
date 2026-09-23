import { createResolver, defineNuxtModule } from 'nuxt/kit';

const FOOTER_BLOCKS_COMPONENT = 'UiFooterBlocks';

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
      const footerBlocks = components.find((component) => component.pascalName === FOOTER_BLOCKS_COMPONENT);
      if (footerBlocks) {
        footerBlocks.filePath = resolve('./runtime/components/GlasJenaFooterBlocks.vue');
      }
    });
  },
});
