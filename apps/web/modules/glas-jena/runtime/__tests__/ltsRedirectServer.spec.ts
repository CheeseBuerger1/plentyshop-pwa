import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createApp, eventHandler, toWebHandler } from 'h3';
import ltsRedirect from '../server/ltsRedirect';

/* The languages of the shop come from the runtime config (`activeLanguages`, German and English) */

/* The redirect as server middleware in front of a page that answers everything else */
const app = createApp();
app.use(ltsRedirect);
app.use(eventHandler(() => 'page'));
const handle = toWebHandler(app);

const request = (path: string, method = 'GET') => handle(new Request(`https://www.glas-jena.de${path}`, { method }));

describe('ltsRedirect (server)', () => {
  it('should redirect old LTS addresses permanently before the page is built', async () => {
    const response = await request('/sbc5/gtc/');

    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('/terms-and-conditions/');
  });

  it('should keep the language, the query and the trailing slash of the old address', async () => {
    expect((await request('/en/sbc5/our-glass/')).headers.get('location')).toBe('/en/our-glass/');
    expect((await request('/sbc5/our-glass/')).headers.get('location')).toBe('/hitzebestaendiges-glas/');
    expect((await request('/search/?query=tasse')).headers.get('location')).toBe('/search/?term=tasse');
    expect((await request('/sbc5/gtc/?utm_source=x')).headers.get('location')).toBe(
      '/terms-and-conditions/?utm_source=x',
    );
    expect((await request('/basket')).headers.get('location')).toBe('/cart');
  });

  it('should leave other pages, other methods and languages the shop does not have to the page', async () => {
    for (const [path, method] of [
      ['/kueche-helfer/', 'GET'],
      ['/sbc5/gtc/', 'POST'],
      ['/fr/sbc5/gtc/', 'GET'],
    ]) {
      const response = await request(path!, method);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('page');
    }
  });

  it('should find the languages of the shop in the runtime config (upstream contract)', () => {
    /* Vitest runs in apps/web */
    expect(readFileSync(join(process.cwd(), 'nuxt.config.ts'), 'utf8')).toContain(
      "activeLanguages: process.env.LANGUAGELIST || 'en,de',",
    );
  });
});
