import { toRootManifestEntries, toRootPrecacheUrls } from '../servicePrecache';

describe('servicePrecache', () => {
  it('should give the precache addresses from the root of the shop, so they do not depend on the worker folder', async () => {
    const result = await toRootPrecacheUrls([
      { url: '_nuxt-plenty/favicon.ico', revision: 'a', size: 1 },
      { url: '/offline', revision: 'b', size: 1 },
      { url: 'https://cdn.example.com/font.woff2', revision: null, size: 1 },
    ]);

    expect(result.manifest.map((entry) => entry.url)).toEqual([
      '/_nuxt-plenty/favicon.ico',
      '/offline',
      'https://cdn.example.com/font.woff2',
    ]);
    expect(result.manifest[0]).toMatchObject({ revision: 'a', size: 1 });
  });

  it('should give the extra entries (web manifest, offline page) from the root as well, strings and objects', () => {
    expect(
      toRootManifestEntries(['offline', { url: 'manifest.webmanifest', revision: 'c' }, { url: '/x', revision: null }]),
    ).toEqual(['/offline', { url: '/manifest.webmanifest', revision: 'c' }, { url: '/x', revision: null }]);
  });
});
