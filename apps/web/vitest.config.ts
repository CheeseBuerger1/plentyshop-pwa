import { defineVitestConfig } from '@nuxt/test-utils/config';
import { coverageConfigDefaults } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const silenceLogsFromSuspenseComponent = (log: string): boolean => {
  return log.includes('<Suspense');
};

const isWindows = process.platform === 'win32';

/**
 * On Windows, Vitest treats the id of vite-plugin-pwa's virtual module (`/@vite-plugin-pwa/…`)
 * as a file path and every test file fails during setup. Use a stub there instead.
 */
const windowsAliases = isWindows
  ? {
      'virtual:pwa-register/vue': fileURLToPath(new URL('./__tests__/__mocks__/pwa-register.mock.ts', import.meta.url)),
    }
  : {};

export default defineVitestConfig({
  resolve: {
    alias: windowsAliases,
  },
  test: {
    environmentOptions: {
      nuxtRuntimeConfig: {
        public: {
          configId: '1',
        },
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'json', 'lcov'],
      reportsDirectory: fileURLToPath(new URL('./coverage', import.meta.url)),
      exclude: [...coverageConfigDefaults.exclude, 'assets/**', 'build/**'],
      reportOnFailure: true,
      thresholds: {
        lines: 50, // target 80
        statements: 50, // target 80
        functions: 80, // target 80
        branches: 80, // target 90
      },
    },
    testTimeout: 6000,
    // Booting the Nuxt test environment can take longer than Vitest's default 10 s on Windows
    hookTimeout: isWindows ? 30000 : undefined,
    environment: 'nuxt',
    globals: true,
    // Nuxt's own client plugins (e.g. nuxt-viewport) emit async unhandled rejections while running
    // inside the unit-test Nuxt environment. Vitest 3 ignored these; Vitest 4 fails the run on them.
    // They are environment noise, not assertion failures, so restore the previous behaviour.
    dangerouslyIgnoreUnhandledErrors: true,
    clearMocks: true,
    setupFiles: './vitest.config.setup.ts',
    include: ['**/*/?(*.)+(spec|test).[jt]s'],
    onConsoleLog: (log: string): boolean | undefined => {
      if (silenceLogsFromSuspenseComponent(log)) {
        return false;
      }
    },
  },
});
