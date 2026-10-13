/**
 * Breadcrumbs on one line: the whole path if it fits, otherwise the short form of the shop (a "…" menu with the
 * levels above, then the current page). The original decides by the container width alone (short below 640 px);
 * here the width of the path itself decides, see plugins/breadcrumbsFit.client.ts and glas-jena.css.
 */

/** The breadcrumb navigation of the shop (components/ui/Breadcrumbs) */
export const BREADCRUMBS_SELECTOR = '[data-testid="breadcrumbs"]';

/** Attribute on the navigation that glas-jena.css reads; without it the original's behaviour applies */
export const BREADCRUMBS_MODE_ATTRIBUTE = 'data-gj-breadcrumbs';
export const BREADCRUMBS_MODE_FULL = 'full';
export const BREADCRUMBS_MODE_SHORT = 'short';

/** The whole path if it needs no more than the available width (one pixel tolerance for rounding). */
export const getBreadcrumbsMode = (neededWidth: number, availableWidth: number) =>
  neededWidth <= availableWidth + 1 ? BREADCRUMBS_MODE_FULL : BREADCRUMBS_MODE_SHORT;

/** Inner width of the element that holds the navigation. */
const getAvailableWidth = (container: HTMLElement) => {
  const style = getComputedStyle(container);
  const padding = (Number.parseFloat(style.paddingLeft) || 0) + (Number.parseFloat(style.paddingRight) || 0);
  return container.clientWidth - padding;
};

/**
 * Measures the path laid out in full on one line and sets the mode. Both steps happen before the browser paints, so
 * nothing flickers.
 */
export const updateBreadcrumbs = (navigation: HTMLElement) => {
  const list = navigation.querySelector<HTMLElement>(':scope > ol');
  const container = navigation.parentElement;
  if (!list || !container) {
    return;
  }
  navigation.setAttribute(BREADCRUMBS_MODE_ATTRIBUTE, BREADCRUMBS_MODE_FULL);
  const mode = getBreadcrumbsMode(list.scrollWidth, getAvailableWidth(container));
  if (mode !== BREADCRUMBS_MODE_FULL) {
    navigation.setAttribute(BREADCRUMBS_MODE_ATTRIBUTE, mode);
  }
};
