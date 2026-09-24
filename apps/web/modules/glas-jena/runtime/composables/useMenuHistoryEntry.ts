import type { Ref } from 'vue';

/** Marks the browser history entry that belongs to the open mobile menu. */
const MENU_HISTORY_KEY = 'gjMobileMenu';
/** Fallback in case the browser never reports the history step (e.g. history already at its start). */
const HISTORY_EXIT_TIMEOUT_MS = 500;

const isOwnEntry = () => Boolean((window.history.state as Record<string, unknown> | null)?.[MENU_HISTORY_KEY]);

/**
 * Lets the browser's back button (Android back, iOS swipe) close the mobile menu instead of leaving the page.
 *
 * While the menu is open, an extra history entry with the same URL exists. Going back removes it and closes
 * the menu; closing the menu any other way removes the entry again. The router's own state is copied into the
 * entry, so going back is a navigation to the same location for the router.
 *
 * Returns `exitHistoryEntry()`: resolves once the entry is gone, so a link in the menu can navigate afterwards
 * (otherwise the pending back step would undo that navigation, or leave a dead entry in the history).
 */
export const useMenuHistoryEntry = (isOpen: Ref<boolean>, close: () => void) => {
  let isLeaving = false;
  const waiting: (() => void)[] = [];

  const settle = () => {
    isLeaving = false;
    waiting.splice(0).forEach((resolve) => resolve());
  };

  /*
   * history.back() is asynchronous: the step we started ourselves (closing the menu) may only arrive after
   * the menu was opened again. That step must not close the reopened menu – only a real back press does.
   */
  const onPopState = () => {
    const wasOwnStep = isLeaving;
    settle();
    if (!wasOwnStep && isOpen.value && !isOwnEntry()) {
      close();
    }
  };

  const addEntry = () => {
    if (isOpen.value && !isOwnEntry()) {
      window.history.pushState({ ...(window.history.state ?? {}), [MENU_HISTORY_KEY]: true }, '');
    }
  };

  const leaveEntry = () => {
    if (isLeaving || !isOwnEntry()) {
      return;
    }
    isLeaving = true;
    window.history.back();
  };

  const exitHistoryEntry = () =>
    new Promise<void>((resolve) => {
      if (!isOwnEntry() && !isLeaving) {
        resolve();
        return;
      }
      waiting.push(resolve);
      leaveEntry();
      setTimeout(settle, HISTORY_EXIT_TIMEOUT_MS);
    });

  watch(isOpen, (open) => {
    if (!import.meta.client) {
      return;
    }
    if (!open) {
      leaveEntry();
      return;
    }
    /* Reopened while our previous entry is still being removed: add the new one once that step is done */
    if (isLeaving) {
      waiting.push(addEntry);
      return;
    }
    addEntry();
  });

  onMounted(() => {
    window.addEventListener('popstate', onPopState);
    /* A reload while the menu was open leaves the marked entry behind; the menu starts closed, so unmark it */
    if (isOwnEntry() && !isOpen.value) {
      const { [MENU_HISTORY_KEY]: _marker, ...state } = window.history.state as Record<string, unknown>;
      window.history.replaceState(state, '');
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', onPopState);
  });

  return { exitHistoryEntry };
};
