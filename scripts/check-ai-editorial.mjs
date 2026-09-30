import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const queue=readdirSync('content/ai-queue').filter(p=>p.endsWith('.json')).map(p=>read('content/ai-queue/'+p));
const existing=[...read('src/data/blog-routes.json'),...readdirSync('content/queue').filter(p=>p.endsWith('.json')).map(p=>read('content/queue/'+p))];
const paths=new Set(existing.map(p=>p.path)),titles=new Set(),dates=new Set();
const expected=read('content/ai-keyword-evidence.json').rows.map(r=>r.Keyword).sort();
assert.deepEqual(queue.flatMap(p=>p.targetKeywords).sort(),expected,'Every positive-YoY keyword must be mapped exactly once');
assert.equal(queue.length,29);assert.equal(expected.length,34);
for(const p of queue){
 assert.ok(/^\/[a-z0-9-]+\/$/.test(p.path)&&!paths.has(p.path),'Duplicate/invalid path');paths.add(p.path);
 assert.ok(!titles.has(p.seoTitle),'Duplicate title');titles.add(p.seoTitle);
 assert.ok(!dates.has(p.publishDate),'Duplicate AI publication date');dates.add(p.publishDate);
 assert.ok(p.description.length>=80&&p.description.length<=180,'Description length: '+p.path);
 assert.ok(p.html.replace(/<[^>]*>/g,' ').split(/\s+/).length>=450,'Incomplete article: '+p.path);
 assert.equal(p.publicationSeries,'ai-growth');assert.ok(p.categories.includes('AI'));
 assert.ok(p.sources.length&&p.html.includes('/blog/ai/'),'Missing sources or archive link');
 assert.ok(!/<(?:script|iframe)|\bon\w+=|javascript:|lorem ipsum/i.test(p.html));
 for(const [,src,alt] of p.html.matchAll(/<img src="([^"]+)" alt="([^"]*)"/g)){assert.ok(alt.length>20);assert.ok(existsSync('public'+src),'Missing illustration');}
 assert.ok(p.html.includes('<figure>'),'Missing explanatory illustration');
}
const calendar=read('content/ai-calendar.json');
assert.deepEqual(calendar.map(x=>[x.path,x.date]).sort(),queue.map(x=>[x.path,x.publishDate]).sort());
console.log('29 AI drafts validated: all 34 growing keywords covered, unique metadata, dates, sources and illustrated content.');
