import {
  BREADCRUMBS_MODE_ATTRIBUTE,
  BREADCRUMBS_MODE_FULL,
  BREADCRUMBS_MODE_SHORT,
  getBreadcrumbsMode,
  updateBreadcrumbs,
} from '../breadcrumbsFit';

/** Breadcrumbs in a container of the given inner width whose full path needs `pathWidth`. */
const mountBreadcrumbs = (containerWidth: number, pathWidth: number) => {
  const container = document.createElement('div');
  container.innerHTML = '<nav data-testid="breadcrumbs"><ol><li>…</li><li>Start</li><li>Teekannen</li></ol></nav>';
  const navigation = container.querySelector('nav') as HTMLElement;
  Object.defineProperty(container, 'clientWidth', { value: containerWidth });
  Object.defineProperty(navigation.querySelector('ol'), 'scrollWidth', { value: pathWidth });
  document.body.append(container);
  return navigation;
};

describe('breadcrumbsFit', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should choose the whole path while it fits and the short form when it does not', () => {
    expect(getBreadcrumbsMode(300, 360)).toBe(BREADCRUMBS_MODE_FULL);
    expect(getBreadcrumbsMode(360, 360)).toBe(BREADCRUMBS_MODE_FULL);
    expect(getBreadcrumbsMode(366, 360)).toBe(BREADCRUMBS_MODE_SHORT);
  });

  it('should tolerate one pixel of rounding', () => {
    expect(getBreadcrumbsMode(361, 360)).toBe(BREADCRUMBS_MODE_FULL);
    expect(getBreadcrumbsMode(361.5, 360)).toBe(BREADCRUMBS_MODE_SHORT);
  });

  it('should mark breadcrumbs that fit as full', () => {
    const navigation = mountBreadcrumbs(360, 220);

    updateBreadcrumbs(navigation);

    expect(navigation.getAttribute(BREADCRUMBS_MODE_ATTRIBUTE)).toBe(BREADCRUMBS_MODE_FULL);
  });

  it('should mark breadcrumbs that are too long as short', () => {
    const navigation = mountBreadcrumbs(360, 382);

    updateBreadcrumbs(navigation);

    expect(navigation.getAttribute(BREADCRUMBS_MODE_ATTRIBUTE)).toBe(BREADCRUMBS_MODE_SHORT);
  });

  it('should leave a navigation without a list untouched', () => {
    const navigation = document.createElement('nav');
    document.body.append(navigation);

    updateBreadcrumbs(navigation);

    expect(navigation.hasAttribute(BREADCRUMBS_MODE_ATTRIBUTE)).toBe(false);
  });
});
