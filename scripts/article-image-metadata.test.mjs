import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getArticleImageVariants } from '../src/lib/article-image-variants.mjs';
import metadata from '../src/data/article-image-metadata.json' with { type: 'json' };
import imported from '../src/data/blog-posts.json' with { type: 'json' };
import editorial from '../src/data/editorial-posts.json' with { type: 'json' };
import { getArticleImageMetadata, addArticleImageDimensions } from '../src/lib/article-image-metadata.mjs';

const path = '/dont-miss-out-crucial-mobile-seo-services-australian-website-needs/';
const prefix = 'https://codemax.com.au/wp-content/uploads/2025/10/dont-miss-out-crucial-mobile-seo-services-australian-website-needs-';
const featured = prefix + 'featured-1.jpeg';
const inline = prefix + 'image-1.jpeg';
const posts = [...imported, ...editorial];
const dimensions = ' width="1024" height="1024"';

test('manifest contains only the two audited 1024-square images on the exact article', () => {
  assert.deepEqual(metadata, {
    [path]: {
      [featured]: { width: 1024, height: 1024, fetchpriority: 'high' },
      [inline]: { width: 1024, height: 1024 },
    },
  });
  const post = posts.find(post => post.path === path);
  assert.equal(post.featuredImage.url, featured);
  assert.equal(post.html.split(`src="${inline}"`).length - 1, 1);
});

test('metadata requires both exact article and source; unknown dimensions are not guessed', () => {
  assert.deepEqual(getArticleImageMetadata(path, featured), { width: 1024, height: 1024, fetchpriority: 'high' });
  for (const otherPath of ['/other/', path.slice(0, -1), path + '?preview=true', '__proto__']) {
    assert.equal(getArticleImageMetadata(otherPath, featured), undefined);
    const html = `<img src="${inline}">`;
    assert.equal(addArticleImageDimensions(otherPath, html), html);
  }
  for (const src of [undefined, '', '/image.jpeg', featured + '?size=small', featured + '#image', featured.replace('https:', 'http:'), featured.replace('codemax.com.au', 'www.codemax.com.au'), '__proto__']) {
    assert.equal(getArticleImageMetadata(path, src), undefined);
  }
});

test('only the target inline tag changes across all source articles; records stay immutable', () => {
  const snapshot = JSON.stringify(posts);
  const changed = [];
  for (const post of posts) {
    const actual = addArticleImageDimensions(post.path, post.html);
    let expected = post.html;
    if (post.path === path) {
      const tag = post.html.match(/<img\b[^>]*>/g).find(tag => tag.includes(`src="${inline}"`));
      assert.ok(tag.includes('loading="lazy"'));
      assert.ok(tag.includes('decoding="async"'));
      assert.ok(tag.includes('alt="'));
      expected = post.html.replace(tag, tag.replace(/>$/, dimensions + '>'));
    }
    assert.equal(actual, expected, post.path);
    assert.equal(addArticleImageDimensions(post.path, actual), actual, `Not idempotent: ${post.path}`);
    if (actual !== post.html) changed.push(post.path);
  }
  assert.deepEqual(changed, [path]);
  assert.equal(JSON.stringify(posts), snapshot);
});

test('real image attributes and formatting are preserved, including lazy loading and alt text', () => {
  for (const tag of [
    `<img src="${inline}" alt="A > B &amp; C" loading="lazy" decoding="async">`,
    `<IMG SRC='${inline}' data-src="other" alt='A > B' />`,
    `<img src=${inline} loading=lazy>`,
    `<img\n src="${inline}"\n alt=""\n>`,
  ]) {
    const expected = tag.replace(/(\s*\/?>)$/, dimensions + '$1');
    const html = `<figure class="keep">${tag}<figcaption>Unchanged</figcaption></figure>`;
    assert.equal(addArticleImageDimensions(path, html), html.replace(tag, expected));
  }
});

test('unverified URLs, fake attributes, ambiguous tags and existing dimensions are untouched', () => {
  for (const tag of [
    `<img src="${inline}?resize=300">`,
    `<img src="${inline}#detail">`,
    `<img src="/wp-content/uploads/2025/10/${inline.split('/').at(-1)}">`,
    `<img data-src="${inline}">`,
    `<img title='src="${inline}"' src="/other.jpeg">`,
    `<img src="${inline}" src="/other.jpeg">`,
    `<img src="${inline}" width="1024" height="1024">`,
    `<img src="${inline}" width="400">`,
    `<img src="${inline}" height>`,
    `<img src="${inline}"`,
    `<source src="${inline}">`,
  ]) assert.equal(addArticleImageDimensions(path, tag), tag);
});

test('comments, escaped samples and raw text are not image elements', () => {
  const img = `<img src="${inline}">`;
  for (const html of [
    `<!-- ${img} -->`, `<!-- ${img}`, `<![CDATA[${img}]]>`,
    `&lt;img src="${inline}"&gt;`,
    ...['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes'].map(tag => `<${tag}>${img}</${tag}>`),
    `<script>${img}`, `<plaintext>${img}`,
  ]) assert.equal(addArticleImageDimensions(path, html), html);
  assert.equal(addArticleImageDimensions(path, `<!-- ${img} -->${img}${img}`), `<!-- ${img} -->${img.replace('>', dimensions + '>')}${img.replace('>', dimensions + '>')}`);
  assert.equal(addArticleImageDimensions(path, ''), '');
});

// Run after the static build with ARTICLE_IMAGE_CHECK_DIST=1.
test('built pages use exact metadata only on the audited article and preserve display/loading behavior', { skip: process.env.ARTICLE_IMAGE_CHECK_DIST !== '1' }, () => {
  for (const post of posts) {
    const html = readFileSync(new URL(`../dist${post.path}index.html`, import.meta.url), 'utf8');
    const tag = html.match(/<img class="article-featured"[^>]*>/)?.[0];
    if (!post.featuredImage?.url) {
      assert.equal(tag, undefined);
      continue;
    }
    assert.ok(tag.includes(`src="${getArticleImageVariants(post.path, post.featuredImage.url)?.src ?? post.featuredImage.url}"`), post.path);
    assert.ok(tag.includes('decoding="async"'), post.path);
    assert.ok(!tag.includes('loading="lazy"'), post.path);
    if (post.path !== path) {
      assert.ok(tag.includes('width="1200" height="675"'), post.path);
      assert.ok(!tag.includes('fetchpriority='), post.path);
      continue;
    }
    assert.ok(tag.includes('width="1024" height="1024"'));
    assert.ok(tag.includes('fetchpriority="high"'));
    assert.match(tag, /\salt(?:="")?(?=\s|>)/); // Astro may serialize an empty alt without quotes.
    const inlineTag = html.match(/<img\b[^>]*>/g).find(tag => tag.includes(`src="${getArticleImageVariants(path, inline).src}"`));
    assert.ok(inlineTag.includes('width="1024" height="1024"'));
    assert.ok(inlineTag.includes('loading="lazy"'));
    assert.ok(inlineTag.includes('decoding="async"'));
    assert.ok(!inlineTag.includes('fetchpriority='));
    const featuredCss = html.match(/\.article-featured\{([^}]+)\}/)?.[1];
    assert.ok(featuredCss?.includes('width:100%'));
    assert.ok(featuredCss.includes('height:auto'));
    assert.ok(featuredCss.includes('aspect-ratio:16/9'));
    assert.ok(featuredCss.includes('object-fit:cover'));
  }
});
