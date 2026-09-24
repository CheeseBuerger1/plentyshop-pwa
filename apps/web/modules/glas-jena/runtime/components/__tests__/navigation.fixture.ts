import type { CategoryTreeItem } from '@plentymarkets/shop-api';

const category = (id: number, name: string, children: CategoryTreeItem[] = []) =>
  ({
    id,
    type: 'item',
    right: 'all',
    childCount: children.length,
    children: children.length > 0 ? children : undefined,
    details: [{ lang: 'de', name, nameUrl: name.toLowerCase().replace(/\W+/g, '-') }],
  }) as CategoryTreeItem;

/** Shortened copy of the glas-jena.de tree, four levels deep like the LTS navigation. */
export const navigationCategoriesFixture: CategoryTreeItem[] = [
  category(1, 'Tee & Kaffee', [
    category(11, 'Kaffee & mehr'),
    category(12, 'Teekannen', [
      category(121, 'mit Glasfilter', [category(1211, 'kleiner 1 L'), category(1212, 'größer 1 L')]),
      category(122, 'Leuchtkannen'),
    ]),
  ]),
  category(2, 'Diverses'),
];
