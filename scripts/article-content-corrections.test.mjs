import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { parseFragment } from 'parse5';
import imported from '../src/data/blog-posts.json' with { type:'json' };
import audit from './fixtures/article-content-corrections.json' with { type:'json' };
const posts = new Map(imported.map(post => [post.path, post]));
const at = path => posts.get(path);
const digest = html => createHash('sha256').update(html).digest('hex');
function nodes(node) { return [node,...(node.childNodes || []).flatMap(nodes)]; }
function visibleText(html) { return nodes(parseFragment(html)).filter(n => n.nodeName === '#text').map(n => n.value).join(' '); }

test('27 reviewed source corrections retain publication, author, URLs and image records', () => {
 assert.equal(audit.articles.length,27);
 assert.equal(new Set(audit.articles.map(row => row.path)).size,27);
 assert.equal(audit.articles.filter(row => row.changedFields.includes('modified')).length,23);
 for (const row of audit.articles) {
  const post=at(row.path); assert.ok(post,row.path);
  for (const [field,value] of Object.entries(row.protectedFields)) assert.deepEqual(post[field],value,`${row.path}: ${field}`);
  for (const [field,value] of Object.entries(row.expected)) assert.equal(post[field],value,`${row.path}: ${field}`);
  assert.equal(digest(post.html),row.htmlSha256,`${row.path}: reviewed body changed`);
  assert.notEqual(row.oldHtmlSha256,row.htmlSha256,`${row.path}: no body correction`);
  assert.equal(post.modified,row.modified);
  if (row.changedFields.includes('modified')) assert.ok(Date.parse(post.modified) >= Date.parse(post.published));
  else assert.equal(post.modified,row.previousModified,'Formatting alone must not invent freshness');
 }
});

test('unsupported ranking, course and agency promises are replaced with transparent guides', () => {
 const ranking=at('/top-10-creative-website-designers-in-australia-2025-codemax-leads-the-way/');
 assert.equal(ranking.title,'How to Compare Creative Website Designers in Australia');
 assert.ok(ranking.html.includes('Search rankings cannot be guaranteed.'));
 assert.ok(!/100% success|20 years|CodeMax Leads the Way/.test(ranking.html));
 assert.ok(ranking.html.includes('href="https://codemax.com.au/#enquiry">contact CodeMax</a>'));
 const course=at('/master-your-market-comprehensive-small-business-course-guide/');
 assert.ok(course.html.includes('It is not an offer of a CodeMax training course.'));
 assert.ok(!/enroll now|enrol now|download.*syllabus/i.test(course.html));
 const agency=at('/australias-premier-social-media-marketing-agency/');
 assert.equal(agency.title,'How to Choose a Social Media Marketing Agency in Australia');
 assert.ok(!/Facebook Premium|exclusive partnerships|award-winning/i.test(agency.html));
});

test('duplicated body, corrupted keywords and authoring placeholders stay removed', () => {
 const local=at('/outrank-rivals-smart-aussie-guide-local-search-engine-optimisation/');
 assert.equal((local.html.match(/The Australian market is a buzzing hub/g)||[]).length,1);
 assert.equal((local.html.match(/<h3>/g)||[]).length,6);
 for (const path of ['/secret-to-style-success-australian-bloggers-uploadblog-for-fashion-shine-online/','/dominate-local-search-rank-higher-google-maps-maphighe-now/']) {
  const post=at(path); assert.ok(!/uploadblog|maphighe/i.test(post.title+' '+post.description+' '+visibleText(post.html)));
 }
 assert.ok(!/prompt indicates no videos/.test(at('/secret-to-style-success-australian-bloggers-uploadblog-for-fashion-shine-online/').html));
 assert.ok(!/YOUTUBE_VIDEO_1/.test(at('/the-aussie-secret-how-to-create-seo-content-that-ranks-1-on-google/').html));
 assert.ok(!/incorporating a number determiner/.test(at('/what-are-effective-ways-to-make-websites-accessible-for-visually-impaired-users/').html));
});

test('four Markdown articles have real headings/lists without changing into executable embeds', () => {
 const paths=['/budgeting-for-success-how-to-get-top-tier-seo-at-a-price-for-seo-20-per-article-in-australia/','/aussie-businesses-level-up-impact-professional-web-page-development-services/','/unlock-growth-why-affordable-websites-for-small-businesses-are-essential/','/website-cost-calculator-how-much-does-this-website-cost-for-your-project/'];
 for (const path of paths) {
  const html=at(path).html; const elements=nodes(parseFragment(html));
  assert.ok(elements.some(n=>n.tagName==='h2'),path);
  assert.ok(elements.some(n=>n.tagName==='li'),path);
  assert.ok(!elements.some(n=>['h1','script','iframe','pre','code'].includes(n.tagName)),path);
  assert.ok(!/\*\*|(?:^|\s)#{2,6}\s/.test(visibleText(html)),path);
 }
 const embed=at('/maximise-roi-australia-wordpress-website-maintenance-services/').html;
 assert.ok(!/<iframe|&lt;iframe|&lt;div/.test(embed));
 for (const id of ['kYv_6_16f38','S2fF_T8z7sI']) assert.ok(embed.includes(`href="https://www.youtube.com/embed/${id}"`));
});

test('corrected security and Australian setup guidance retains verified official references', () => {
 const storage=at('/essential-website-security-checklist-for-small-businesses/').html;
 assert.ok(storage.includes('plain SHA-256 is not sufficient for password storage'));
 assert.ok(storage.includes('https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'));
 const passwords=at('/top-3-foolproof-website-security-tips/');
 assert.equal(passwords.title,'3 Website Security Tips to Reduce Risk');
 assert.ok(!passwords.html.includes('Yes, you can use the same strong and complex password'));
 assert.ok(passwords.html.includes('https://pages.nist.gov/800-63-4/sp800-63b.html'));
 const company=at('/set-up-a-company/').html;
 assert.ok(!/social security number|SSN|limited liability company \(LLC\)|sales tax permit/i.test(company));
 assert.ok(company.includes('does not replace current legal or tax advice'));
 assert.ok(company.includes('https://www.asic.gov.au/for-business-and-companies/companies/register-a-company'));
 assert.ok(company.includes('https://www.abr.gov.au/business-super-funds-charities/applying-abn/what-you-need-your-abn-application'));
});

test('contrast figures and statistical corrections agree with their stated calculations', () => {
 const lum=hex=>{const values=hex.match(/../g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return values[0]*.2126+values[1]*.7152+values[2]*.0722;};
 const html=at('/9-tips-for-enhancing-website-accessibility-for-visually-impaired-users/').html;
 for (const [a,b] of [['FF0000','00FF00'],['FF0000','000000'],['FFFFFF','FFFF00']]) {
  const ratio=((Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05)).toFixed(2);
  assert.ok(html.includes(`<td>#${a}</td><td>#${b}</td><td>${ratio}:1</td>`));
 }
 for (const path of ['/simple-guide-analyzing-ab-test-results-for-website-optimization/','/why-analyze-ab-testing-results-for-website-optimization/','/8-essential-tips-for-ab-testing-website-conversion-rates/']) {
  const body=at(path).html; assert.ok(body.includes('under the null model and its assumptions'));
  assert.ok(body.includes('https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf'));
  assert.ok(!body.includes('5% or lower likelihood that the differences are due to chance'));
 }
});

test('every corrected article remains built at its original canonical URL', {skip:process.env.ARTICLE_CONTENT_CHECK_DIST!=='1'}, () => {
 for(const row of audit.articles) {
  const html=readFileSync(new URL(`../dist${row.path}index.html`,import.meta.url),'utf8');
  assert.ok(html.includes(`rel="canonical" href="https://codemax.com.au${row.path}"`),row.path);
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,row.path);
  assert.ok(!/<script[^>]*src=["']https:\/\/www.youtube/.test(html));
 }
});
