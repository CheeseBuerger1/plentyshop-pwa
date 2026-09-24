import { NAVIGATION_HOVER_DELAY_MS } from '../utils/navigation';

/**
 * A single cancellable timer for delayed hover actions (opening, switching or closing a submenu).
 * Scheduling replaces a pending action; the timer is cleared when the component unmounts.
 */
export const useHoverIntent = (delay = NAVIGATION_HOVER_DELAY_MS) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  const schedule = (action: () => void) => {
    cancel();
    timer = setTimeout(() => {
      timer = undefined;
      action();
    }, delay);
  };

  onBeforeUnmount(cancel);

  return { schedule, cancel };
};
