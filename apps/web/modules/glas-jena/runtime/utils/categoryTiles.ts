import type { CategoryTreeItem } from '@plentymarkets/shop-api';

/**
 * Category with its subcategories: a category that has subcategories shows only these (as tiles), one without shows
 * its articles – the rule of the LTS shop. Pure helpers, see GlasJenaCategoryTiles.vue and GlasJenaCategoryPage.vue.
 */

/** The category with the id, searched through all levels of the tree. */
export const findCategory = (tree: CategoryTreeItem[] | undefined, id: number | string): CategoryTreeItem | null => {
  for (const category of tree ?? []) {
    if (String(category.id) === String(id)) {
      return category;
    }
    const found = findCategory(category.children, id);
    if (found) {
      return found;
    }
  }
  return null;
};

/** Subcategories in the order of the category tree (empty for a category without any). */
export const getSubcategories = (tree: CategoryTreeItem[] | undefined, id: number | string | undefined) => {
  if (id === undefined) {
    return [];
  }
  return findCategory(tree, id)?.children ?? [];
};

/** Name and image paths of the category in the current language (the tree holds one details entry per language). */
export const getCategoryTileDetails = (category: CategoryTreeItem) => {
  const details = category.details?.[0];
  return {
    name: details?.name ?? '',
    imagePath: details?.imagePath || details?.image2Path || null,
  };
};

/** Image of a category (path as the tree has it, e.g. `category/56/katkaff2.jpg`) in the shop's document folder. */
export const getCategoryImageUrl = (domain: string, imagePath: string | null) =>
  imagePath ? `${domain}/documents/${imagePath}` : '';
