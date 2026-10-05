import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const services = JSON.parse(readFileSync('src/data/services.json', 'utf8'));
const decode = text => text.replace(/&amp;/g, '&');

test('homepage and article footer expose all existing services as ordinary named links', () => {
 const pages = ['/', '/blog/', '/dont-miss-out-crucial-mobile-seo-services-australian-website-needs/'];
 for (const path of pages) {
  const html = readFileSync('dist' + path + 'index.html', 'utf8');
  const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];
  assert.ok(footer, `Footer: ${path}`);
  const nav = footer.match(/<nav\b[^>]*aria-label="Services"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(nav, `Service navigation: ${path}`);
  const links = [...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
  assert.equal(links.length, services.length);
  for (const service of services) {
   const href = '/services/' + service.slug + '/';
   assert.ok(links.some(([, url, label]) => url === href && decode(label) === service.name), `Named service link: ${path} -> ${href}`);
   const target = readFileSync('dist' + href + 'index.html', 'utf8');
   assert.ok(target.includes(`rel="canonical" href="https://codemax.com.au${href}"`));
  }
 }
});

test('homepage cards use the same descriptive service names without changing enquiry options', () => {
 const html = readFileSync('dist/index.html', 'utf8');
 for (const service of services) {
  assert.ok(decode(html).includes(`<h3><a href="/services/${service.slug}/">${service.name}</a></h3>`), service.name);
  assert.ok(decode(html).includes(`<option>${service.enquiryService}</option>`), service.enquiryService);
 }
});
