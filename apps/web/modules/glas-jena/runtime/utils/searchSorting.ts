/**
 * Sort options of the search page. The editor's list of sort options applies to categories and search alike; the
 * shop owner removed "Relevanz" (`item.score`) from it because it means nothing on category pages. The search page
 * sorts by relevance by default, so it puts its default in front of the list again – otherwise its select showed the
 * first other option ("Empfohlen") while the results were sorted by relevance.
 *
 * @param available Sort options from the editor (`availableSortingOptions`)
 * @param searchDefault Default sort of the search (`defaultSortingSearch`)
 */
export const getSearchSortingOptions = (available: string[], searchDefault: string | undefined) =>
  searchDefault && !available.includes(searchDefault) ? [searchDefault, ...available] : available;
