import { ref } from 'vue';

/**
 * Stand-in for `virtual:pwa-register/vue` in unit tests on Windows, where Vitest cannot load
 * the virtual module of vite-plugin-pwa (see vitest.config.ts). No service worker is registered.
 */
export const useRegisterSW = () => ({
  needRefresh: ref(false),
  offlineReady: ref(false),
  updateServiceWorker: async () => {},
});
