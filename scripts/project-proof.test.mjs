import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const html = readFileSync('dist/index.html', 'utf8');
// Check customer-facing claims, not infrastructure hostnames in form attributes.
const pageText = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, '').replace(/<[^>]*>/g, ' ');
const section = html.match(/<section\b[^>]*id="project-proof"[^>]*>[\s\S]*?<\/section>/)?.[0];
test('homepage leads with an accurately labelled CodeMax-only working example', () => {
 assert.ok(section);
 assert.match(section, /In-house project \/ The CodeMax website/);
 assert.doesNotMatch(section.replace(/<[^>]*>/g, ' '), /client results|guaranteed|increased (traffic|rankings|enquiries)|\d+%|testimonials/i);
 assert.ok(html.indexOf('id="project-proof"') < html.indexOf('id="work"'));
 assert.equal((html.match(/id="project-proof"/g) || []).length, 1);
 assert.doesNotMatch(pageText, /PowerPlumbers|CitizenshipExam|16 client|Search rankings and lead growth are still being measured/i);
});
test('proof links point to existing pages and the intact enquiry section', () => {
 const links = [...section.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
 assert.deepEqual(links, ['/services/web-design-melbourne/', '/blog/', '#enquiry']);
 for (const path of links.filter(link => link.startsWith('/') && !link.includes('?'))) assert.ok(existsSync('dist' + path + 'index.html'), path);
 assert.match(html, /id="enquiry"/);
 assert.match(html, /id="enquiry-form"/);
 assert.match(html, /href="tel:\+61494597993"/);
 assert.match(html, /href="mailto:info@codemax.com.au"/);
});
test('gallery distinguishes image examples and keeps its progressive disclosure', () => {
 assert.match(html, /View all 16 design images/);
 assert.match(html, /Browse website design images/);
 assert.match(html, /Select a design to view it at full size/);
 assert.equal((html.match(/<small>Design image \/ \d{2}<\/small>/g) || []).length, 16);
 assert.match(html, /<details class="more-work">/);
 assert.match(html, /href="#project-proof">See the CodeMax rebuild/);
});
test('proof stays compact with wrapping links and visible focus treatment', () => {
 const source = readFileSync('src/components/ProjectProof.astro', 'utf8');
 assert.match(source, /\.proof-links\{display:flex;flex-wrap:wrap/);
 assert.match(source, /\.proof-links\{flex-direction:column;align-items:start;gap:0\}/);
 const words = section.replace(/<[^>]*>/g, ' ').match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) || [];
 assert.ok(words.length <= 60, `Compact example: ${words.length} words`);
 assert.equal((section.match(/<p\b/g) || []).length, 2);
 assert.doesNotMatch(section, /<article|proof-next|proof-brief|proof-note/);
 assert.match(source, /a:focus-visible\{outline-color:#ffac94\}/);
 assert.match(source, /aria-labelledby="proof-title"/);
});
