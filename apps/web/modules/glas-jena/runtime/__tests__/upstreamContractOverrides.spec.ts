/**
 * Upstream contract of the components the module replaces (COMPONENT_OVERRIDES) and the plugins it removes
 * (REMOVED_PLUGINS).
 *
 * Part of the upstream contract of the glas-jena module, see upstreamContract.spec.ts; in its own file because that
 * one has reached the maximum length of a file (ESLint `max-lines`).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENT_OVERRIDES, REMOVED_PLUGINS, isRemovedPlugin } from '../../index';

/* Vitest runs in apps/web (the Nuxt test environment gives no file URL for this module) */
const APP_DIR = join(process.cwd(), 'app');

/**
 * The file of an original component by its Nuxt name: `UiHeaderBlocks` → components/ui/HeaderBlocks…, `Cookiebar` →
 * components/Cookiebar…, or with its folder as prefix: `PreferredDeliveryPackstationFinder` →
 * components/PreferredDelivery/PackstationFinder.vue.
 */
const componentFile = (name: string) => {
  const path = name.startsWith('Ui') ? name.replace(/^Ui/, 'components/ui/') : `components/${name}`;
  const fileName = path.split('/').pop();
  const words = name.match(/[A-Z][a-z0-9]*/g) ?? [];
  const prefixed = words
    .slice(1)
    .map((_, index) => `components/${words.slice(0, index + 1).join('')}/${words.slice(index + 1).join('')}.vue`);
  return [`${path}.vue`, `${path}/${fileName}.vue`, ...prefixed].find((file) => existsSync(join(APP_DIR, file)));
};

describe('upstream contract of the glas-jena module: replaced components', () => {
  it('should find every original component the module replaces', () => {
    const missing = Object.keys(COMPONENT_OVERRIDES).filter((name) => !componentFile(name));

    expect(missing).toEqual([]);
  });

  it('should find every original plugin the module removes', () => {
    const missing = REMOVED_PLUGINS.filter((file) => !existsSync(join(APP_DIR, 'plugins', file)));

    expect(missing).toEqual([]);
  });

  it('should only remove the listed plugins of the shop', () => {
    expect(isRemovedPlugin('C:\\shop\\apps\\web\\app\\plugins\\06.clean-url.client.ts')).toBe(true);
    expect(isRemovedPlugin('/shop/apps/web/app/plugins/06.clean-url.client.ts')).toBe(true);
    expect(isRemovedPlugin('/shop/apps/web/app/plugins/05.other.client.ts')).toBe(false);
    expect(isRemovedPlugin('/shop/modules/glas-jena/runtime/plugins/06.clean-url.client.ts')).toBe(false);
  });
});
