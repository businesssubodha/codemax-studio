import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { publicModifiedDate } from '../src/lib/article-dates.mjs';

test('prepublication edits are omitted without inventing a new update date', () => {
  assert.equal(publicModifiedDate('2025-12-14T00:00:00Z', '2025-10-21T00:00:00Z'), null);
  assert.equal(publicModifiedDate('2026-01-01T00:00:00Z', null), null);
  assert.equal(publicModifiedDate('not a date', '2026-01-02T00:00:00Z'), null);
  assert.equal(publicModifiedDate('2026-01-01T00:00:00Z', 'not a date'), null);
});

test('real publication and later update times are retained exactly, including offsets', () => {
  assert.equal(publicModifiedDate('2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'), '2026-01-01T00:00:00Z');
  assert.equal(publicModifiedDate('2026-01-01T00:00:00Z', '2026-01-02T01:23:45.000Z'), '2026-01-02T01:23:45.000Z');
  assert.equal(publicModifiedDate('2026-01-01T11:00:00+11:00', '2026-01-01T00:30:00Z'), '2026-01-01T00:30:00Z');
});

test('compact production routing manifest uses the same public dates as rendered articles', () => {
  const read = name => JSON.parse(readFileSync(new URL('../src/data/' + name, import.meta.url)));
  const posts = [...read('blog-posts.json'), ...read('editorial-posts.json')];
  const routes = new Map([...read('blog-routes.json'), ...read('editorial-routes.json')].map(p => [p.path, p.modified]));
  for (const post of posts) assert.equal(routes.get(post.path), publicModifiedDate(post.published, post.modified), post.path);
});
