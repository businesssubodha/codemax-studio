import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest, studioPath } from './worker.mjs';
import { readFileSync } from 'node:fs';
import { servicePaths } from './routes.mjs';
const env = { ENABLED: 'true', PAGES_ORIGIN: 'https://codemax-web.pages.dev' };
const req = (path, options) => new Request('https://codemax.com.au' + path, options);

test('Service routing stays in sync with the site', () => {
  const services = JSON.parse(readFileSync(new URL('../../src/data/services.json', import.meta.url)));
  assert.deepEqual([...servicePaths].sort(), services.map(s => '/services/' + s.slug + '/').sort());
});
for (const path of ['/blog/', '/dont-miss-out-crucial-mobile-seo-services-australian-website-needs/', '/category/seo/', '/tag/design/', '/feed/', '/wp-admin/', '/wp-login.php', '/wp-json/wp/v2/posts', '/wp-content/uploads/2024/01/Food.jpg', '/robots.txt', '/sitemap.xml', '/sitemap_index.xml', '/?p=42', '/?s=website', '/?preview=true', '/?rest_route=/wp/v2/posts', '/services/old-wordpress-page/']) {
  test('Keeps WordPress route: ' + path, async () => {
    const request = req(path); const response = new Response('original');
    assert.equal(studioPath(request), null);
    assert.equal(await handleRequest(request, env, async passed => { assert.equal(passed, request); return response; }), response);
  });
}
test('Forwards POST and authenticated WordPress visits untouched', async () => {
  for (const request of [req('/', {method:'POST',body:'private=data'}), req('/', {headers:{Cookie:'wordpress_logged_in_abc=private'}})]) {
    assert.equal(studioPath(request), null);
    await handleRequest(request, env, async passed => { assert.equal(passed, request); return new Response('wp'); });
  }
});
test('Disabled or invalid configuration keeps the original origin', async () => {
  for (const config of [{...env, ENABLED:'false'}, {...env, PAGES_ORIGIN:''}, {...env, PAGES_ORIGIN:'https://codemax.com.au'}, {...env, PAGES_ORIGIN:'https://example.pages.dev.evil.com'}]) {
    const request = req('/');
    await handleRequest(request, config, async passed => { assert.equal(passed, request); return new Response('wp'); });
  }
});
test('Serves allowed static page, strips preview noindex and keeps private data at origin', async () => {
  const response = await handleRequest(req('/?utm_source=test', {headers:{Cookie:'analytics=private',Authorization:'Bearer private'}}), env, async passed => {
    assert.equal(passed.url, 'https://codemax-web.pages.dev/');
    assert.equal(passed.headers.get('Cookie'), null);assert.equal(passed.headers.get('Authorization'), null);
    return new Response('new page',{headers:{'X-Robots-Tag':'noindex, follow','Set-Cookie':'bad=1','Content-Type':'text/html'}});
  });
  assert.equal(await response.text(),'new page');assert.equal(response.headers.get('X-Robots-Tag'), null);assert.equal(response.headers.get('Set-Cookie'), null);
});
test('Pages failures fall back to WordPress without stripping its headers', async () => {
  for (const mode of ['throw','500','404','redirect']) {
    const request=req('/'); let calls=0;
    const r=await handleRequest(request,env,async passed=>{
      calls++;if(passed===request)return new Response('wp',{headers:{'X-Robots-Tag':'noindex'}});
      if(mode==='throw')throw new Error('network');
      return new Response(null,{status:mode==='redirect'?302:Number(mode)});
    });
    assert.equal(calls,2);assert.equal(await r.text(),'wp');assert.equal(r.headers.get('X-Robots-Tag'),'noindex');
  }
});
test('Submitted sitemap is valid XML on the production host without fetching Pages', async () => {
  let fetched = false;
  const response = await handleRequest(req('/studio-sitemap.xml'),env,async () => { fetched = true; return new Response('unexpected'); });
  const xml = await response.text();
  assert.equal(response.status,200);
  assert.match(response.headers.get('Content-Type'),/application\/xml/);
  assert.equal(response.headers.get('X-CodeMax-Site'),'studio');
  assert.equal((xml.match(/<url>/g)||[]).length,servicePaths.size+1);
  assert.match(xml,/<loc>https:\/\/codemax\.com\.au\/services\/web-design-melbourne\/</);
  assert.equal(fetched,false);
  const head = await handleRequest(req('/studio-sitemap.xml',{method:'HEAD'}),env);
  assert.equal(head.status,200); assert.equal(await head.text(),'');
  const www = await handleRequest(new Request('https://www.codemax.com.au/studio-sitemap.xml'),env);
  assert.equal(www.status,308);
  // Existing WordPress sitemap endpoints continue to bypass the studio router.
  const legacy = req('/sitemap.xml');
  assert.equal(studioPath(legacy),null);
});
test('Canonical redirects preserve tracking parameters', async () => {
  const r=await handleRequest(new Request('https://www.codemax.com.au/services/web-design-melbourne?utm_source=test'),env,async()=>new Response('page'));
  assert.equal(r.status,308);assert.equal(r.headers.get('Location'),'https://codemax.com.au/services/web-design-melbourne/?utm_source=test');
});
test('HEAD requests return no body and assets use the new host', async () => {
  const r=await handleRequest(req('/fonts/inter-latin.woff2',{method:'HEAD'}),env,async passed=>{
    assert.equal(passed.method,'HEAD');assert.equal(new URL(passed.url).hostname,'codemax-web.pages.dev');return new Response(null,{headers:{'Content-Type':'font/woff2'}});
  });
  assert.equal(await r.text(),'');assert.equal(r.headers.get('Content-Type'),'font/woff2');
});
