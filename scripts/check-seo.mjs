// Validate generated production HTML and hybrid routing before release.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { servicePaths, archivePaths, articlePaths, assetPaths } from '../cloudflare/production/routes.mjs';
const origin = 'https://codemax.com.au';
const xml = readFileSync('dist/sitemap.xml', 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap entries');
const titles = new Set(), descriptions = new Set();
for (const address of urls) {
 const url = new URL(address);
 assert.equal(url.origin, origin, 'Preview hostname in sitemap');
 const path = url.pathname;
 assert.ok(path === '/' || servicePaths.has(path) || articlePaths.has(path) || archivePaths.has(path), `Unrouted studio page: ${path}`);
 const html = readFileSync('dist' + path + 'index.html', 'utf8');
 assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `H1: ${path}`);
 assert.ok(html.includes(`rel="canonical" href="${address}"`), `Canonical: ${path}`);
 assert.ok(!/<meta[^>]*name="robots"[^>]*noindex/i.test(html), `Noindex: ${path}`);
 const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
 const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
 assert.ok(title && !titles.has(title), `Missing/duplicate title: ${path}`);
 assert.ok(description && !descriptions.has(description), `Missing/duplicate description: ${path}`);
 titles.add(title); descriptions.add(description);
 const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
 assert.ok(schemas.length, `Missing schema: ${path}`);
 for (const [,schema] of schemas) JSON.parse(schema);
 for (const [,asset] of html.matchAll(/(?:src|href)="(\/(?:brand|fonts|portfolio|editorial)\/[^"?]+)"/g)) {
  assert.ok(existsSync('public' + asset), `Missing asset: ${asset}`);
  assert.ok(assetPaths.has(asset), `Unrouted asset: ${asset}`);
 }
}
assert.equal(urls.length, servicePaths.size + articlePaths.size + 1 + archivePaths.size);
for (const path of articlePaths) assert.ok(urls.includes(origin + path), `Article missing from sitemap: ${path}`);
console.log(`SEO checks passed for ${urls.length} production URLs: titles, descriptions, H1s, canonicals, indexability, schema, sitemap and asset routes.`);
