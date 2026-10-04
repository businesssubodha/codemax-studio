import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { repairLegacyLinks } from '../src/lib/repair-legacy-links.mjs';
import audit from '../src/data/legacy-link-repairs.json' with { type: 'json' };
import posts from '../src/data/blog-posts.json' with { type: 'json' };
import { articlePaths } from '../cloudflare/production/routes.mjs';

const origin = 'https://codemax.com.au';
const mapping = new Map(audit.repairs.map(repair => [repair.path, repair]));
const sourcePaths = new Set(audit.repairs.flatMap(repair => repair.sourcePaths));
const anchorPattern = /<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;

test('mapping covers exactly 31 audited URLs and 38 occurrences across 17 articles', () => {
  assert.equal(audit.repairs.length, 31);
  assert.equal(mapping.size, 31);
  assert.equal(sourcePaths.size, 17);
  assert.equal(audit.repairs.reduce((sum, repair) => sum + repair.expectedOccurrences, 0), 38);
  assert.equal(audit.repairs.filter(repair => repair.action === 'replace').length, 11);
  assert.equal(audit.repairs.filter(repair => repair.text).length, 7);
  for (const repair of audit.repairs) {
    assert.match(repair.path, /^\/(?!\/)[^?#]+$/);
    assert.ok(['replace', 'unlink'].includes(repair.action));
    assert.ok(repair.reason);
    if (repair.action === 'replace') {
      assert.ok(articlePaths.has(repair.destination), `Missing generated route: ${repair.destination}`);
      assert.ok(posts.some(post => post.path === repair.destination), `Missing destination content: ${repair.destination}`);
      assert.ok(!mapping.has(repair.destination), 'Replacement must not need a second repair pass');
    } else {
      assert.equal(repair.destination, undefined);
      assert.equal(repair.text, undefined);
    }
  }
});

test('all 38 real source links are repaired: 11 replacements, 27 unlinks and 7 accurate labels', () => {
  const counts = new Map(audit.repairs.map(repair => [repair.path, 0]));
  const sources = new Map(audit.repairs.map(repair => [repair.path, new Set()]));
  let replaced = 0, unlinked = 0, relabelled = 0;
  const changedArticles = new Set();
  const snapshot = JSON.stringify(posts);
  for (const post of posts) {
    // Independent expected-output construction over the actual, double-quoted
    // imported fixtures verifies both the content and unchanged surrounding HTML.
    const expected = post.html.replace(anchorPattern, (anchor, href, content) => {
      if (!href.startsWith(origin + '/')) return anchor;
      const repair = mapping.get(href.slice(origin.length));
      if (!repair) return anchor;
      counts.set(repair.path, counts.get(repair.path) + 1);
      sources.get(repair.path).add(post.path);
      assert.ok(repair.sourcePaths.includes(post.path), `Unaudited source: ${post.path} -> ${repair.path}`);
      if (repair.action === 'unlink') { unlinked++; return content; }
      replaced++;
      const openingEnd = anchor.indexOf('>') + 1;
      const opening = anchor.slice(0, openingEnd).replace(`href="${href}"`, `href="${origin}${repair.destination}"`);
      if (repair.text) relabelled++;
      return opening + (repair.text ?? content) + '</a>';
    });
    const actual = repairLegacyLinks(post.html);
    assert.equal(actual, expected, `Unexpected content change: ${post.path}`);
    assert.equal(repairLegacyLinks(actual), actual, `Not idempotent: ${post.path}`);
    if (actual !== post.html) changedArticles.add(post.path);
    for (const [, href] of actual.matchAll(anchorPattern)) {
      if (!href.startsWith(origin + '/')) continue;
      assert.ok(!mapping.has(href.slice(origin.length)), `Dead href survives: ${post.path} -> ${href}`);
    }
  }
  assert.equal(replaced, 11);
  assert.equal(unlinked, 27);
  assert.equal(relabelled, 7);
  assert.deepEqual(changedArticles, sourcePaths);
  assert.equal(JSON.stringify(posts), snapshot, 'Source records or publication metadata mutated');
  for (const repair of audit.repairs) {
    assert.equal(counts.get(repair.path), repair.expectedOccurrences, `Wrong occurrence count: ${repair.path}`);
    assert.deepEqual(sources.get(repair.path), new Set(repair.sourcePaths));
  }
});

test('exact-title replacement preserves anchor text, inline markup, attributes and formatting', () => {
  const before = `<p>Before <a class="old" data-href="untouched" title="WordPress > management" href='http://www.codemax.com.au/wordpress-management/' rel="noopener"><strong>WordPress Management</strong> by Codemax</a> after.</p>`;
  const after = before.replace('http://www.codemax.com.au/wordpress-management/', origin + '/wordpress-management-by-codemax/');
  assert.equal(repairLegacyLinks(before), after);
});

test('CodeMax root-relative, protocol-relative and unquoted public links are scoped correctly', () => {
  assert.equal(repairLegacyLinks('<a href=/wordpress-management/>WordPress</a>'), `<a href=${origin}/wordpress-management-by-codemax/>WordPress</a>`);
  assert.equal(repairLegacyLinks('<A HREF="//www.codemax.com.au/wordpress-management/">WordPress</A>'), `<A HREF="${origin}/wordpress-management-by-codemax/">WordPress</A>`);
});

test('unlinks preserve readable inner HTML and audited slash variants', () => {
  for (const path of ['/seo-services', '/seo-services/', '/digital-marketing', '/digital-marketing/']) {
    const content = '<em>SEO &amp; marketing</em> support';
    assert.equal(repairLegacyLinks(`<p><a href="${origin}${path}" rel="noopener noreferrer">${content}</a>.</p>`), `<p>${content}.</p>`);
  }
});

test('unrelated destinations, query URLs, editing/preview links and fragments remain byte-identical', () => {
  const values = [
    'https://example.com/seo-services/', 'https://codemax.com.au.example.com/seo-services/',
    'https://codemax.com.au@evil.example/seo-services/', 'https://user@codemax.com.au/seo-services/',
    'https://codemax.com.au:8443/seo-services/', 'ftp://codemax.com.au/seo-services/',
    '/wp-admin/post.php?post=123&action=edit', '/seo-services/?preview=true',
    '/seo-services/?preview_id=123&amp;preview_nonce=sample', '/seo-services/?',
    '/wordpress-management/?utm_source=example', '/wordpress-management/#details',
    '/seo-services/&#63;preview=true', '/seo-services/&quest;preview=true',
    '/unrelated/', '/blog/local-seo-australia', 'wordpress-management/',
    '#seo-services', 'mailto:hello@codemax.com.au', ' https://codemax.com.au/seo-services/ ',
    'https://codemax.com.au\\example.com/seo-services/',
  ];
  for (const value of values) {
    const html = `<p>Before <a data-keep="yes" href="${value}">Unchanged label</a> after</p>`;
    assert.equal(repairLegacyLinks(html), html, value);
  }
});

test('href-like attributes, duplicate hrefs and malformed anchors are untouched', () => {
  const fixtures = [
    '<a data-href="/seo-services/">No navigation</a>',
    `<a title='href="/seo-services/"' href="/unrelated/">Other link</a>`,
    '<a href="/seo-services/" href="/other/">Ambiguous</a>',
    '<a href="/seo-services/">Unclosed',
    '<a href="/seo-services/" />Self-closing</a>',
    '<a href="/seo-services/"><a href="/wordpress-management/">Nested</a></a>',
    '<a href>Missing destination</a>',
  ];
  for (const fixture of fixtures) assert.equal(repairLegacyLinks(fixture), fixture);
});

test('comments, raw-text elements and escaped code samples are not links', () => {
  const sample = '<a href="/seo-services/">SEO</a>';
  const fixtures = [
    `<!-- ${sample} -->`, `<![CDATA[${sample}]]>`,
    '&lt;a href="/seo-services/"&gt;SEO&lt;/a&gt;',
    ...['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes'].map(tag => `<${tag}>${sample}</${tag}>`),
    `<plaintext>${sample}`,
  ];
  for (const fixture of fixtures) assert.equal(repairLegacyLinks(fixture), fixture);
  assert.equal(repairLegacyLinks(`<!-- ${sample} -->${sample}`), `<!-- ${sample} -->SEO`);
});

test('successive repairs do not retain parser state and new text labels are accurate', () => {
  for (const repair of audit.repairs.filter(repair => repair.text)) {
    const fixture = `<a href="${origin}${repair.path}">Unavailable article title</a>`;
    const expected = `<a href="${origin}${repair.destination}">${repair.text}</a>`;
    assert.equal(repairLegacyLinks(fixture), expected);
    assert.equal(repairLegacyLinks(fixture), expected);
    assert.equal(repairLegacyLinks(expected), expected);
  }
  assert.equal(repairLegacyLinks(''), '');
});

// Parent integration should run this suite again with LEGACY_LINK_CHECK_DIST=1
// after building. This mode fails if any output page or repaired href is absent.
test('built pages contain every repair and each destination is generated', { skip: process.env.LEGACY_LINK_CHECK_DIST !== '1' }, () => {
  const sitemap = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
  for (const repair of audit.repairs) {
    for (const source of repair.sourcePaths) {
      const html = readFileSync(new URL(`../dist${source}index.html`, import.meta.url), 'utf8');
      assert.ok(!html.includes(`href="${origin}${repair.path}"`), `Built dead link: ${source} -> ${repair.path}`);
      if (repair.action === 'replace') {
        assert.ok(html.includes(`href="${origin}${repair.destination}"`), `Built repair missing: ${source}`);
        if (repair.text) assert.ok(html.includes(`>${repair.text}</a>`), `Built label missing: ${source}`);
      }
    }
    if (repair.action === 'replace') {
      assert.ok(sitemap.includes(`<loc>${origin}${repair.destination}</loc>`));
      const destination = readFileSync(new URL(`../dist${repair.destination}index.html`, import.meta.url), 'utf8');
      assert.ok(destination.includes(`rel="canonical" href="${origin}${repair.destination}"`));
    }
  }
});
