/*
 * The last button, link or other control the visitor used (mouse, touch or keyboard), so that a window can give the
 * focus back to it when it closes. The window cannot ask the browser at that point: the "add to cart" button is
 * disabled while the item is being added, and a disabled button loses the focus before the window opens.
 */
const INTERACTIVE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

let lastInteractiveElement: HTMLElement | null = null;

/** Remembers the control that contains `target`, if there is one (clicks on text or icons count for their button). */
export const rememberInteractiveElement = (target: EventTarget | null) => {
  const element = target instanceof Element ? target.closest<HTMLElement>(INTERACTIVE_SELECTOR) : null;

  if (element) {
    lastInteractiveElement = element;
  }
};

export const getLastInteractiveElement = () => lastInteractiveElement;
