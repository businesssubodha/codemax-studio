import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
const queue=readdirSync('content/queue').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync('content/queue/'+f,'utf8')));
const existing=JSON.parse(readFileSync('src/data/blog-routes.json','utf8'));
const titles=new Set(), paths=new Set(existing.map(p=>p.path)), dates=new Set();
for (const p of queue) {
 assert.ok(/^\/[a-z0-9-]+\/$/.test(p.path));
 assert.ok(!paths.has(p.path),'Duplicate article URL: '+p.path); paths.add(p.path);
 assert.ok(!titles.has(p.title),'Duplicate title'); titles.add(p.title);
 assert.ok(!dates.has(p.publishDate),'Duplicate publication date'); dates.add(p.publishDate);
 assert.ok(p.description.length>=80 && p.description.length<=180,'Description length: '+p.path);
 assert.ok(p.primaryKeyword && p.secondaryKeywords.length);
 assert.ok(p.html.replace(/<[^>]+>/g,' ').split(/\s+/).length>=450,'Incomplete draft: '+p.path);
 assert.ok(!/<(?:script|iframe)|\bon\w+=|javascript:|\[YOUTUBE:|lorem ipsum/i.test(p.html),'Unsafe or unfinished content');
 assert.ok(!/plumb|tradie/i.test(p.title+' '+p.primaryKeyword+' '+p.html),'Off-topic trade content');
 assert.ok(p.html.includes('Sources and further reading') && p.html.includes('https://'),'Missing sources');
 assert.ok(p.html.includes('/#enquiry'),'Missing enquiry link');
 for (const [,asset] of p.html.matchAll(/src="(\/editorial\/[^"?]+)"/g)) assert.ok(existsSync('public'+asset),'Missing image');
 for (const [,url] of p.html.matchAll(/href="(\/[^"#]*)/g)) {
  assert.ok(url==='/' || url.startsWith('/services/'),'Unexpected local link');
 }
}
assert.equal(queue.length,15);
console.log('15 complete CodeMax drafts validated: unique URLs and dates, keywords, sources, media and contact links.');
