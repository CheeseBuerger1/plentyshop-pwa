/**
 * Upstream contract of the product page (breadcrumbs, buy area, "Ersatzteile" and "Zubehör").
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const readApp = (path: string) => readFileSync(join(process.cwd(), 'app', path), 'utf8');

describe('upstream contract of the glas-jena module: product page', () => {
  it('should find the product page layout that the breadcrumbs and the buy area rely on', () => {
    /* glas-jena.css: breadcrumbs right of the logo when no `.gj-page-banner` comes before their container */
    expect(readApp('layouts/default.vue')).toMatch(/<UiHeaderBlocks \/>\s*<NarrowContainer[^>]*>\s*<LazyUiBreadcrumbs/);
    /* `[data-testid='purchase-card'] [data-testid='product-name']` and `... [data-testid='price']` */
    const purchaseCard = readApp('components/ui/PurchaseCard/PurchaseCard.vue');
    expect(purchaseCard).toContain('data-testid="purchase-card"');
    expect(purchaseCard).toMatch(/<h1[^>]*data-testid="product-name"/);
    expect(purchaseCard).toContain('<Price :crossed-price="crossedPrice"');
    expect(readApp('components/Price/Price.vue')).toContain("testId: 'price'");
  });

  it('should find the add-to-cart buttons that items "Aktuell nicht lieferbar" disable', () => {
    /* plugins/notOrderable.ts: the buy area disables its button and hides PayPal through `productGetters.isSalable` */
    const purchaseCard = readApp('components/ui/PurchaseCard/PurchaseCard.vue');
    expect(purchaseCard).toContain(':disabled="loading || !productGetters.isSalable(product)"');
    expect(purchaseCard).toContain('productGetters.isSalable(props?.product));');
    /*
     * GlasJenaProductCard.vue wraps the card and disables its button: the original binds `disabled` to `loading` only.
     * If the original disables it by itself one day, the wrapper may no longer be needed.
     */
    const card = readApp('components/ui/ProductCard/ProductCard.vue');
    expect(card).toMatch(/data-testid="add-to-basket-short"\s*:disabled="loading"/);
    expect(card).toMatch(/<template>\s*<div[^>]*\n?[^>]*data-testid="product-card"/);
  });

  it('should find the gallery parts that show the thumbnails on narrow screens too', () => {
    /*
     * glas-jena.css: `[data-testid='gallery'] > div:nth-child(2) > div:first-child` (and its `.swiper`) shown, the
     * row of bars `> div:nth-child(2) > div:nth-child(2)` hidden below 768 px
     */
    const gallery = readApp('components/Gallery/Gallery.vue');
    expect(gallery).toMatch(/data-testid="gallery">\s*<div\s+ref="mainBox"/);
    expect(gallery).toMatch(
      /v-show="configuration\.thumbnails\.showThumbnails"[\s\S]*?>\s*<div class="hidden @md:block/,
    );
    expect(gallery).toContain("'hidden md:block md:w-full md:min-h-[5.5rem]'");
    expect(gallery).toContain('<div v-if="hasMoreImages" class="flex @md:hidden gap-0.5"');
  });

  it('should find the block wrappers that an empty block loses its margin by', () => {
    /* glas-jena.css: `[data-testid='block-wrapper']:has(> .block-wrapper:empty)` */
    expect(readApp('components/EditableBlocks/BlockItem.vue')).toContain('data-testid="block-wrapper"');
    expect(readApp('components/PageBlock/PageBlock.vue')).toMatch(
      /<template>\s*<div[^>]*>\s*<PageBlockContent[\s\S]*?wrapper-class="relative block-wrapper h-full"/,
    );
    expect(readApp('components/PageBlock/PageBlockContent.vue')).toMatch(
      /<template>\s*<div[^>]*:class="wrapperClass">/,
    );
  });

  it('should find what the item carousel needs for the cross-selling items of product pages', () => {
    /* GlasJenaProductCarousel: the item of the product page, the editor mode and the shop's cross-selling search */
    const products = readApp('composables/useProducts/useProducts.ts');
    expect(products).toContain('currentProduct: {} as Product,');
    expect(products).toContain('state.value.currentProduct = product;');
    expect(readApp('composables/useEditorState/useEditorState.ts')).toContain('const isEditMode = computed(');
    const recommended = readApp('components/blocks/ProductRecommendedProducts/ProductRecommendedProducts.vue');
    expect(recommended).toContain("props.content.source?.type === 'cross_selling'");
    expect(readApp('composables/useProductRecommended/useProductRecommended.ts')).toContain(
      'crossSellingRelation: params.crossSellingRelation,',
    );
  });
});
