import { labelNotOrderableButtons } from '../utils/notOrderable';

/**
 * Changes after which a button can start or stop matching (the CSS keys on these attributes), and its name: the shop's
 * button sets its empty `aria-label` again when the card renders anew. Setting the same name again changes nothing, so
 * the observer does not loop.
 */
const WATCHED_ATTRIBUTES = ['disabled', 'data-gj-not-orderable', 'aria-label'];

/*
 * Names the disabled buttons of items "Aktuell nicht lieferbar" for screen readers, see labelNotOrderableButtons in
 * utils/notOrderable.ts. Item cards and the buy area render their buttons at any time (lists hydrate later, the
 * product page changes the variation), so one observer on the page checks again after every change, at most once per
 * frame. Starts after the app is mounted, so the server HTML and hydration stay untouched.
 */
export default defineNuxtPlugin((nuxtApp) => {
  let scheduled = false;
  const label = () => {
    scheduled = false;
    labelNotOrderableButtons(document, nuxtApp.$i18n.locale.value);
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(label);
    }
  };

  nuxtApp.hook('app:mounted', () => {
    label();
    new MutationObserver(schedule).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: WATCHED_ATTRIBUTES,
    });
  });
});
