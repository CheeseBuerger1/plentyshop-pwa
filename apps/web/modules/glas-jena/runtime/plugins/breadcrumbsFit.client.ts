import { BREADCRUMBS_SELECTOR, updateBreadcrumbs } from '../utils/breadcrumbsFit';

/**
 * Breadcrumbs on one line: full path or short form, depending on what fits, see utils/breadcrumbsFit.ts.
 * Measured again whenever a page has finished, the breadcrumbs' container changes its width, the breadcrumbs change
 * (other page, other language) or the web font has loaded.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const observed = new WeakSet<Element>();
  let timer = 0;

  /* A timer, not an animation frame: frames stop in background tabs, and the next visible state must be right */
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(update);
  };

  /* Resize observations arrive before the browser paints, so the new mode shows without a flicker */
  const resizeObserver = new ResizeObserver(() => update());

  const update = () => {
    for (const navigation of document.querySelectorAll<HTMLElement>(BREADCRUMBS_SELECTOR)) {
      updateBreadcrumbs(navigation);
      const container = navigation.parentElement;
      if (container && !observed.has(container)) {
        observed.add(container);
        resizeObserver.observe(container);
      }
    }
  };

  const affectsBreadcrumbs = ({ target }: MutationRecord) => {
    const element = target instanceof Element ? target : target.parentElement;
    return !!element && (!!element.closest(BREADCRUMBS_SELECTOR) || !!element.querySelector(BREADCRUMBS_SELECTOR));
  };

  /* New or changed breadcrumbs (the layouts render them, outside the pages) */
  const mutationObserver = new MutationObserver((records) => {
    if (records.some(affectsBreadcrumbs)) {
      schedule();
    }
  });

  nuxtApp.hook('app:mounted', () => {
    update();
    mutationObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
    document.fonts?.ready.then(schedule);
    window.addEventListener('resize', schedule);
  });
  nuxtApp.hook('page:finish', schedule);
});
