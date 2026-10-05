// Validate generated production HTML and hybrid routing before release.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { servicePaths, archivePaths, articlePaths, assetPaths, legacyRedirects } from '../cloudflare/production/routes.mjs';
import { handleRequest } from '../cloudflare/production/worker.mjs';
import { publicModifiedDate } from '../src/lib/article-dates.mjs';
const repairs = JSON.parse(readFileSync('src/data/legacy-link-repairs.json', 'utf8'));
const confirmedDeadPaths = new Set(repairs.repairs.map(repair => repair.path));
const preservedWordPressPaths = new Set(JSON.parse(readFileSync('src/data/preserved-wordpress-links.json', 'utf8')));
const sourcePosts = [...JSON.parse(readFileSync('src/data/blog-posts.json', 'utf8')), ...JSON.parse(readFileSync('src/data/editorial-posts.json', 'utf8'))];
const origin = 'https://codemax.com.au';
const xml = readFileSync('dist/sitemap.xml', 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap entries');
const titles = new Set(), descriptions = new Set();
const pageHtml = new Map(urls.map(address => {
 const path = new URL(address).pathname;
 return [path, readFileSync('dist' + path + 'index.html', 'utf8')];
}));
for (const [source, replacement] of legacyRedirects) {
 const target = new URL(replacement, origin);
 assert.equal(target.origin, origin, `External legacy redirect: ${source}`);
 assert.ok(pageHtml.has(target.pathname), `Missing legacy redirect target: ${source}`);
 if (target.hash) assert.ok(pageHtml.get(target.pathname).includes(`id="${target.hash.slice(1)}"`), `Missing legacy redirect section: ${source}`);
}
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
 for (const [,schema] of schemas) {
  const parsed = JSON.parse(schema);
  for (const entry of parsed['@graph'] || [parsed]) {
   if (entry['@type'] === 'BlogPosting' && entry.dateModified) {
    assert.equal(entry.dateModified, publicModifiedDate(entry.datePublished, entry.dateModified), `Contradictory article update date: ${path}`);
   }
  }
 }
 for (const [,asset] of html.matchAll(/(?:src|href)="(\/(?:brand|fonts|portfolio|editorial)\/[^"?]+)"/g)) {
  assert.ok(existsSync('public' + asset), `Missing asset: ${asset}`);
  assert.ok(assetPaths.has(asset), `Unrouted asset: ${asset}`);
 }
 for (const [,href] of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
  assert.ok(!/[<>]|&(?:lt|gt|quot);|&#(?:0*(?:34|60|62)|x0*(?:22|3c|3e));/i.test(href), `Malformed link: ${path} -> ${href}`);
  const target = new URL(href.replace(/&amp;/g, '&'), address);
  if (!['codemax.com.au', 'www.codemax.com.au'].includes(target.hostname)) continue;
  const normalized = target.pathname.endsWith('/') ? target.pathname : target.pathname + '/';
  assert.ok(!confirmedDeadPaths.has(target.pathname), `Confirmed dead link: ${path} -> ${href}`);
  // Retained WordPress pages need explicit review instead of silently allowing
  // new unknown destinations. Existing uploaded media remains on WordPress.
  assert.ok(pageHtml.has(normalized) || preservedWordPressPaths.has(normalized) || assetPaths.has(target.pathname) || target.pathname.startsWith('/wp-content/uploads/'), `Unreviewed internal destination: ${path} -> ${href}`);
  if (!target.search) assert.ok(!legacyRedirects.has(normalized), `Link still uses retired route: ${path} -> ${href}`);
  if (pageHtml.has(normalized) && target.hash) {
   const fragment = decodeURIComponent(target.hash.slice(1));
   assert.ok(pageHtml.get(normalized).includes(`id="${fragment}"`), `Missing internal section: ${path} -> ${href}`);
  }
 }
}
assert.equal(urls.length, servicePaths.size + articlePaths.size + 1 + archivePaths.size);
for (const path of articlePaths) assert.ok(urls.includes(origin + path), `Article missing from sitemap: ${path}`);
const sitemapEntries = body => [...body.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([,entry]) => [entry.match(/<loc>([^<]+)<\/loc>/)?.[1], entry.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] || null]).sort(([a],[b]) => a.localeCompare(b));
const sitemapDates = new Map(sitemapEntries(xml));
const workerSitemap = await handleRequest(new Request(origin + '/studio-sitemap.xml'), { ENABLED: 'true', PAGES_ORIGIN: 'https://codemax-web.pages.dev' }, () => { throw new Error('Sitemap validation must not use network'); });
assert.equal(workerSitemap.status, 200);
assert.deepEqual(sitemapEntries(await workerSitemap.text()), sitemapEntries(xml), 'Astro/Worker sitemap mismatch');
for (const post of sourcePosts) {
 const expected = publicModifiedDate(post.published, post.modified);
 assert.equal(sitemapDates.get(origin + post.path), expected, `Sitemap modified date: ${post.path}`);
 const html = pageHtml.get(post.path);
 let previousHeadingLevel = 0;
 for (const [, levelText] of html.matchAll(/<h([1-6])(?:\s[^>]*|)>/gi)) {
  const level = Number(levelText);
  assert.ok(level <= previousHeadingLevel + 1, `Skipped heading level: ${post.path} H${previousHeadingLevel} -> H${level}`);
  previousHeadingLevel = level;
 }
 const graph = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(([,schema]) => { const parsed = JSON.parse(schema); return parsed['@graph'] || [parsed]; });
 const article = graph.find(entry => entry['@type'] === 'BlogPosting');
 assert.ok(article, `Missing article schema: ${post.path}`);
 assert.equal(article.datePublished, post.published, `Changed publication date: ${post.path}`);
 assert.equal(article.dateModified || null, expected, `Article modified schema: ${post.path}`);
 assert.equal(html.match(/<meta property="article:modified_time" content="([^"]+)"/)?.[1] || null, expected, `Article modified metadata: ${post.path}`);
}
const redesign = pageHtml.get('/website-redesign-drives-growth/');
for (const path of ['/exploring-latest-innovations-in-ai-technologies/', '/wordpress-management-services-by-codemax/', '/melbourne-wordpress-management-services/']) {
 assert.ok(pageHtml.has(path), `Missing repaired article target: ${path}`);
 assert.ok(redesign.includes(`href="${origin}${path}"`), `Article link repair missing: ${path}`);
}
console.log(`SEO checks passed for ${urls.length} production URLs: titles, descriptions, H1s, canonicals, indexability, schema, sitemap, asset routes, redirect targets and internal links.`);
