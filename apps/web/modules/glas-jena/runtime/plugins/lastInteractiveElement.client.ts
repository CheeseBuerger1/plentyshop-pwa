import { rememberInteractiveElement } from '../utils/lastInteractiveElement';

/*
 * Remembers the last control the visitor used, for windows that give the focus back when they close (the cart window,
 * GlasJenaQuickCheckout.vue), see utils/lastInteractiveElement.ts. Capturing listeners, so nothing can stop them.
 */
export default defineNuxtPlugin(() => {
  const remember = (event: Event) => rememberInteractiveElement(event.target);

  document.addEventListener('pointerdown', remember, true);
  document.addEventListener('focusin', remember, true);
});
