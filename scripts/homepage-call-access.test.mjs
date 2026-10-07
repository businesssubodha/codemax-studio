import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync('dist/index.html', 'utf8');
const source = readFileSync('src/pages/index.astro', 'utf8');
const styles = readFileSync('src/styles/bold.css', 'utf8');
const globalStyles = readFileSync('src/styles/global.css', 'utf8');
const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
const hero = html.match(/<section class="hero wrap"[\s\S]*?<\/section>/)?.[0];

test('header and hero each expose an accessible native call link', () => {
 for (const [name, section] of [['header', header], ['hero', hero]]) {
  assert.ok(section, name);
  const calls = [...section.matchAll(/<a\b[^>]*href="tel:\+61494597993"[^>]*>[\s\S]*?<\/a>/g)].map(match => match[0]);
  assert.equal(calls.length, 1, `${name}: one direct call option`);
  assert.match(calls[0], /aria-label="Call CodeMax on 0494 597 993"/);
  assert.match(calls[0], /0494 597 993/);
  assert.match(calls[0], /aria-hidden="true" focusable="false"/);
  assert.doesNotMatch(calls[0], /target=|onclick=|role="button"/);
 }
});

test('online enquiry and project proof remain available beside phone access', () => {
 assert.match(header, /href="#enquiry">Contact<\/a>/);
 assert.match(hero, /class="button enquiry-link" href="#enquiry">Start your project/);
 assert.match(hero, /href="#project-proof">See the CodeMax rebuild/);
 assert.match(html, /id="enquiry-form"/);
 assert.match(html, /id="project-proof"/);
 assert.match(html, /href="mailto:info@codemax.com.au"/);
 assert.doesNotMatch(source, /forEach\(link\s*=>\s*link\.href\s*=/, 'Do not replace native call destinations after page load');
});

test('call actions wrap, keep a touch target, and have a visible keyboard focus', () => {
 assert.match(styles, /\.call-link\{white-space:nowrap;flex-shrink:0\}/);
 assert.match(styles, /\.hero \.actions\{flex-wrap:wrap;gap:12px/);
 assert.match(styles, /@media\(max-width:900px\)\{\.header\{flex-wrap:wrap/);
 assert.match(styles, /@media\(max-width:600px\)\{\.header \.call-number\{display:none\}\}/);
 assert.match(globalStyles, /\.button\{[^}]*min-height:48px/);
 assert.match(styles, /\.header \.call-link:focus-visible,[^{]+\{outline:3px solid #ffac94;outline-offset:5px\}/);
 assert.match(styles, /\.hero \.enquiry-link\{background:transparent;color:var\(--paper\);border:1px solid #777b6e\}/);
});

test('phone clicks retain the existing consent-gated analytics event', () => {
 const analytics = readFileSync('src/lib/analytics.js', 'utf8');
 assert.match(analytics, /if\(!allowed \|\| !started\) return/);
 assert.match(analytics, /if\(href\.startsWith\('tel:'\)\)send\('contact_phone_click'\)/);
});

test('built homepage initialization preserves phone destinations and enquiry behavior', () => {
 const script = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)]
  .map(match => match[1]).find(content => content.includes('#enquiry-form'));
 assert.ok(script, 'Built homepage interaction script exists');
 for (const endpoint of ['', 'https://contact.example.test/contact']) {
  const calls = [{ href: 'tel:+61494597993' }, { href: 'tel:+61494597993' }];
  const enquiry = { href: '#enquiry' };
  const handlers = new Map();
  const submit = { disabled: true };
  const select = { value: '', options: [{ value: 'Web design & development' }] };
  const form = {
   dataset: { endpoint },
   querySelector: selector => selector.startsWith('select') ? select : submit,
   addEventListener: (name, handler) => handlers.set(name, handler),
  };
  class IntersectionObserver { observe() {} disconnect() {} }
  const context = {
   document: {
    querySelector: selector => selector === '#enquiry-form' ? form : null,
    querySelectorAll: selector => selector.includes('.header') || selector.includes('.hero') ? [...calls, enquiry] : [],
   },
   window: {
    location: { search: '?service=Web%20design%20%26%20development' },
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    IntersectionObserver,
   },
   IntersectionObserver,
   URLSearchParams,
  };
  runInNewContext(script, context);
  assert.deepEqual(calls.map(link => link.href), ['tel:+61494597993', 'tel:+61494597993']);
  assert.equal(enquiry.href, '#enquiry');
  assert.equal(submit.disabled, false);
  assert.equal(select.value, 'Web design & development');
  assert.equal(typeof handlers.get('submit'), 'function');
  if (endpoint) assert.equal(typeof handlers.get('focusin'), 'function');
 }
});

test('call text, enquiry text and focus ring meet contrast thresholds', () => {
 const luminance = hex => hex.match(/[\da-f]{2}/gi)
  .map(channel => parseInt(channel, 16) / 255)
  .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
 const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
 assert.ok(contrast('#111210', '#ff5428') >= 4.5);
 assert.ok(contrast('#f3f2ec', '#111210') >= 4.5);
 assert.ok(contrast('#ffac94', '#111210') >= 3);
});
