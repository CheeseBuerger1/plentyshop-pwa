import { createApp, eventHandler, sendRedirect, toWebHandler } from 'h3';
import hsts from '../server/hsts';

/* HSTS as server middleware in front of a page and a redirect */
const app = createApp();
app.use(hsts);
app.use(
  '/redirect',
  eventHandler((event) => sendRedirect(event, '/target/', 301)),
);
app.use(eventHandler(() => 'page'));
const handle = toWebHandler(app);

const request = (path: string, method = 'GET') => handle(new Request(`https://www.glas-jena.de${path}`, { method }));

describe('hsts (server)', () => {
  it('should tell browsers to use https for a year on every page', async () => {
    const response = await request('/kueche-helfer/');

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('page');
    expect(response.headers.get('strict-transport-security')).toBe('max-age=31536000; includeSubDomains');
  });

  it('should send the header with redirects and other methods too', async () => {
    const redirect = await request('/redirect');
    const post = await request('/cart/', 'POST');

    expect(redirect.status).toBe(301);
    expect(redirect.headers.get('strict-transport-security')).toBe('max-age=31536000; includeSubDomains');
    expect(post.headers.get('strict-transport-security')).toBe('max-age=31536000; includeSubDomains');
  });
});
