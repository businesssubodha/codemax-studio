import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse, parseFragment } from 'parse5';
import audit from '../src/data/article-heading-repairs.json' with { type: 'json' };
import imported from '../src/data/blog-posts.json' with { type: 'json' };
import editorial from '../src/data/editorial-posts.json' with { type: 'json' };
import { repairArticleHeadings } from '../src/lib/article-heading-repairs.mjs';

const posts = [...imported, ...editorial];
const path = audit.articles[0].path;
const targets = new Map(audit.articles.map(article => [article.path, article]));
function* walk(node) { yield node; for (const child of node.childNodes ?? []) yield* walk(child); }
const headings = node => [...walk(node)].filter(node => /^h[1-6]$/.test(node.tagName));
const attributes = node => Object.fromEntries(node.attrs.map(attribute => [attribute.name, attribute.value]));
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const read = relative => readFileSync(new URL(relative, import.meta.url), 'utf8');

test('manifest covers exactly the 45 audited H3-first article bodies and their full heading counts', () => {
  assert.equal(audit.articles.length, 45);
  assert.equal(targets.size, 45);
  const found = [];
  const totals = { h3: 0, h4: 0 };
  for (const post of posts) {
    const nodes = headings(parseFragment(post.html));
    if (nodes[0]?.tagName !== 'h3') continue;
    found.push(post.path);
    const counts = {};
    for (const node of nodes) {
      assert.ok(['h3', 'h4'].includes(node.tagName), post.path);
      counts[node.tagName] = (counts[node.tagName] ?? 0) + 1;
      totals[node.tagName]++;
    }
    assert.deepEqual(counts, targets.get(post.path)?.sourceHeadingCounts, post.path);
  }
  assert.deepEqual(found.sort(), [...targets.keys()].sort());
  assert.deepEqual(totals, { h3: 267, h4: 82 });
});

test('all source articles retain every byte except audited heading tags and the new style attribute', () => {
  const snapshot = JSON.stringify(posts);
  const changed = [];
  for (const post of posts) {
    const actual = repairArticleHeadings(post.path, post.html);
    let expected = post.html;
    if (targets.has(post.path)) {
      expected = post.html.replace(/<(\/?)[hH]([34])(\b[^>]*>)/g, (_, close, level, rest) =>
        `<${close}h${Number(level) - 1}${close ? rest : rest.replace(/>$/, ` data-original-heading-level="${level}">`)}`);
    }
    assert.equal(actual, expected, post.path);
    assert.equal(repairArticleHeadings(post.path, actual), actual, `Not idempotent: ${post.path}`);
    if (actual !== post.html) changed.push(post.path);
  }
  assert.deepEqual(changed.sort(), [...targets.keys()].sort());
  assert.equal(JSON.stringify(posts), snapshot);
});

test('the complete outline, heading text and original attributes are preserved for every repaired heading', () => {
  for (const post of posts) {
    const oldNodes = headings(parseFragment(post.html));
    const newNodes = headings(parseFragment(repairArticleHeadings(post.path, post.html)));
    assert.equal(newNodes.length, oldNodes.length, post.path);
    let previousLevel = 1;
    for (let i = 0; i < newNodes.length; i++) {
      const before = oldNodes[i], after = newNodes[i];
      assert.equal(after.tagName, targets.has(post.path) ? `h${Number(before.tagName[1]) - 1}` : before.tagName);
      assert.equal(text(after), text(before));
      assert.deepEqual(attributes(after), { ...attributes(before), ...(targets.has(post.path) ? { 'data-original-heading-level': before.tagName[1] } : {}) });
      const level = Number(after.tagName[1]);
      assert.ok(level <= previousLevel + 1, `${post.path}: H${previousLevel} to H${level}`);
      previousLevel = level;
    }
  }
});

test('exact paths are required; no other article, prototype key or near-match is changed', () => {
  const html = '<h3>Section</h3><h4>Detail</h4>';
  for (const other of ['/other/', path.slice(0, -1), path + '?preview=true', path.toUpperCase(), '__proto__', 'constructor']) {
    assert.equal(repairArticleHeadings(other, html), html);
  }
});

test('all original IDs, classes, attributes, inline styles and tag formatting survive', () => {
  const before = `<H3 id='intro' class="keep" title="A > B" style="color:red">Words &amp; <em>more</em></H3 >\n<h4\n data-note='x' id="detail">Detail</h4>`;
  const expected = `<H2 id='intro' class="keep" title="A > B" style="color:red" data-original-heading-level="3">Words &amp; <em>more</em></H2 >\n<h3\n data-note='x' id="detail" data-original-heading-level="4">Detail</h3>`;
  assert.equal(repairArticleHeadings(path, before), expected);
});

test('comments, escaped headings, attributes and raw text remain untouched', () => {
  const sample = '<h3>Sample</h3>';
  const actual = '<h3>Real</h3>';
  const fixed = '<h2 data-original-heading-level="3">Real</h2>';
  for (const sampleHtml of [
    `<!-- ${sample} -->`, `<![CDATA[${sample}]]>`, '&lt;h3&gt;Sample&lt;/h3&gt;',
    `<div title='${sample}'>Untouched</div>`,
    ...['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes'].map(tag => `<${tag}>${sample}</${tag}>`),
  ]) assert.equal(repairArticleHeadings(path, sampleHtml + actual), sampleHtml + fixed);
  for (const sampleHtml of [`<!-- ${sample}`, `<script>${sample}`, `<plaintext>${sample}`]) assert.equal(repairArticleHeadings(path, sampleHtml), sampleHtml);
});

test('newly authored, mixed, already annotated and malformed outlines fail closed', () => {
  for (const html of [
    '', '<h2>Existing section</h2><h3>Existing subsection</h3>',
    '<h3>Before</h3><h2>New top level</h2>', '<h4>Starts too deep</h4>',
    '<h3>Before</h3><h5>New deep section</h5>',
    '<h3 data-original-heading-level="4">Already repaired</h3>',
    '<h3>Unclosed', '<h3>Mismatch</h4>', '<h3>Outer<h4>Nested</h4></h3>',
    '<h3/>Self closing', '<h3>Before</h3></h3>',
  ]) assert.equal(repairArticleHeadings(path, html), html);
});

test('scoped CSS preserves audited heading sizes and weights at desktop and mobile widths', () => {
  const css = read('../src/styles/blog.css');
  assert.match(css, /\.article-body h2\[data-original-heading-level="3"\]\{font-size:26px;font-weight:800\}/);
  assert.match(css, /\.article-body h3\[data-original-heading-level="4"\]\{font-size:22px;font-weight:bold\}/);
  assert.match(css, /@media\(max-width:700px\)\{\.article-body h2\[data-original-heading-level="3"\]\{font-size:23px\}\}/);
});

// Run after building with ARTICLE_HEADING_CHECK_DIST=1.
test('all 392 rendered articles have a complete outline and only audited headings receive style markers', { skip: process.env.ARTICLE_HEADING_CHECK_DIST !== '1' }, () => {
  let marked = 0;
  for (const post of posts) {
    const html = read(`../dist${post.path}index.html`);
    const dom = parse(html);
    const nodes = headings(dom);
    let previousLevel = 0;
    for (const node of nodes) {
      const level = Number(node.tagName[1]);
      assert.ok(level <= previousLevel + 1, `${post.path}: H${previousLevel} to H${level}`);
      previousLevel = level;
    }
    const body = [...walk(dom)].find(node => (node.attrs ?? []).some(a => a.name === 'class' && a.value.split(/\s+/).includes('article-body')));
    const bodyNodes = headings(body);
    const sourceNodes = headings(parseFragment(post.html));
    assert.equal(bodyNodes.length, sourceNodes.length, post.path);
    for (let i = 0; i < bodyNodes.length; i++) {
      const attr = attributes(bodyNodes[i]);
      assert.equal(attr['data-original-heading-level'], targets.has(post.path) ? sourceNodes[i].tagName[1] : undefined, post.path);
      assert.equal(text(bodyNodes[i]), text(sourceNodes[i]), post.path);
      if (attr['data-original-heading-level']) marked++;
    }
  }
  assert.equal(marked, 349);
});
