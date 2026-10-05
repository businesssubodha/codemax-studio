import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse, parseFragment } from 'parse5';
import audit from '../src/data/article-list-break-repairs.json' with { type: 'json' };
import imported from '../src/data/blog-posts.json' with { type: 'json' };
import editorial from '../src/data/editorial-posts.json' with { type: 'json' };
import { repairArticleListBreaks } from '../src/lib/article-list-break-repairs.mjs';

const posts = [...imported, ...editorial];
const path = audit.articles[0].path;
const targets = new Map(audit.articles.map(article => [article.path, article.breaks]));
function* walk(node) { yield node; for (const child of node.childNodes ?? []) yield* walk(child); }
const directListBreaks = dom => [...walk(dom)].filter(node => node.tagName === 'br' && ['ul', 'ol'].includes(node.parentNode?.tagName));
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');

test('manifest covers the 104 invalid direct-list breaks on exactly three source articles', () => {
  assert.equal(audit.articles.length, 3);
  assert.equal(targets.size, 3);
  const found = [];
  let count = 0;
  for (const post of posts) {
    const breaks = directListBreaks(parseFragment(post.html));
    if (breaks.length) found.push(post.path);
    assert.equal(breaks.length, targets.get(post.path) ?? 0, post.path);
    count += breaks.length;
  }
  assert.equal(count, 104);
  assert.deepEqual(found.sort(), [...targets.keys()].sort());
});

test('only the parsed invalid BR byte ranges are removed; every other byte and source record survives', () => {
  const snapshot = JSON.stringify(posts);
  let removed = 0;
  for (const post of posts) {
    const before = parseFragment(post.html, { sourceCodeLocationInfo: true });
    const breaks = directListBreaks(before);
    let expected = post.html;
    for (const node of breaks.toReversed()) {
      const { startOffset, endOffset } = node.sourceCodeLocation;
      assert.equal(post.html.slice(startOffset, endOffset), '<br>');
      expected = expected.slice(0, startOffset) + expected.slice(endOffset);
      removed++;
    }
    const actual = repairArticleListBreaks(post.path, post.html);
    assert.equal(actual, expected, post.path);
    assert.equal(repairArticleListBreaks(post.path, actual), actual, post.path);
    assert.equal(directListBreaks(parseFragment(actual)).length, 0, post.path);
    assert.equal(text(parseFragment(actual)), text(before), post.path);
  }
  assert.equal(removed, 104);
  assert.equal(JSON.stringify(posts), snapshot);
});

test('list item boundaries, order, nesting, attributes, content and intra-item BRs stay unchanged', () => {
  for (const post of posts) {
    const before = parseFragment(post.html);
    const after = parseFragment(repairArticleListBreaks(post.path, post.html));
    const select = dom => [...walk(dom)].filter(node => ['li', 'ul', 'ol'].includes(node.tagName));
    const oldNodes = select(before), newNodes = select(after);
    assert.equal(newNodes.length, oldNodes.length, post.path);
    for (let i = 0; i < newNodes.length; i++) {
      assert.equal(newNodes[i].tagName, oldNodes[i].tagName, post.path);
      assert.deepEqual(newNodes[i].attrs, oldNodes[i].attrs, post.path);
      assert.equal(text(newNodes[i]), text(oldNodes[i]), post.path);
      assert.equal(newNodes[i].parentNode.tagName, oldNodes[i].parentNode.tagName, post.path);
    }
    const itemBreaks = dom => [...walk(dom)].filter(node => node.tagName === 'br' && !['ul', 'ol'].includes(node.parentNode?.tagName)).length;
    assert.equal(itemBreaks(after), itemBreaks(before), post.path);
  }
});

test('leading, between-item, trailing and nested-list boundaries are handled without changing valid breaks', () => {
  const before = '<ol><br>\n<li id="one">First<br>line<ul><br><li>Inner<br>line</li><br></ul></li><br>\n<li>Second</li><br></ol>';
  const after = '<ol>\n<li id="one">First<br>line<ul><li>Inner<br>line</li></ul></li>\n<li>Second</li></ol>';
  assert.equal(repairArticleListBreaks(path, before), after);
  assert.equal(repairArticleListBreaks(path, '<UL> <BR /> <LI>Keep</LI> <br/> </UL>'), '<UL>  <LI>Keep</LI>  </UL>');
});

test('path gating, comments, raw text and escaped or attribute samples prevent unrelated changes', () => {
  const example = '<ul><br><li>Example</li><br></ul>';
  for (const other of ['/other/', path.slice(0, -1), path + '?preview', '__proto__']) assert.equal(repairArticleListBreaks(other, example), example);
  for (const html of [
    `<!-- ${example} -->`, `<!-- ${example}`, `<![CDATA[${example}]]>`,
    '&lt;ul&gt;&lt;br&gt;&lt;li&gt;Example&lt;/li&gt;&lt;/ul&gt;',
    `<div title='${example}'>Keep</div>`,
    ...['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes'].map(tag => `<${tag}>${example}</${tag}>`),
    `<script>${example}`, `<plaintext>${example}`,
  ]) assert.equal(repairArticleListBreaks(path, html), html);
});

test('attributed breaks, text gaps, comments and non-boundary breaks are left for explicit review', () => {
  for (const html of [
    '<ul><br class="space"><li>Item</li></ul>', '<ul><br id="target"><li>Item</li></ul>',
    '<ul>Text<br><li>Item</li></ul>', '<ul><br>Text<li>Item</li></ul>',
    '<ul><!-- marker --><br><li>Item</li></ul>', '<ul><br><!-- marker --><li>Item</li></ul>',
    '<ul><li>Item<br></li></ul>', '<p>Paragraph<br>line</p>',
    '<ul><div><br><li>Malformed</li></div></ul>', '<ul><br><br><li>Repeated</li></ul>',
  ]) assert.equal(repairArticleListBreaks(path, html), html);
});

// Run after building with ARTICLE_LIST_CHECK_DIST=1.
test('no generated article contains a BR directly inside a list', { skip: process.env.ARTICLE_LIST_CHECK_DIST !== '1' }, () => {
  for (const post of posts) {
    const html = readFileSync(new URL(`../dist${post.path}index.html`, import.meta.url), 'utf8');
    assert.equal(directListBreaks(parse(html)).length, 0, post.path);
  }
});
