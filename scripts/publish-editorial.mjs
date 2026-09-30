import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
export function localClock(now) {
 const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
 return {date:`${parts.year}-${parts.month}-${parts.day}`,hour:Number(parts.hour)};
}
export function choosePost(queue, published, now, existingPaths = []) {
 const clock=localClock(now);
 if (clock.hour<9 || published.some(p=>p.publicationSeries!=='ai-growth' && p.displayDate===clock.date)) return null;
 const used=new Set([...existingPaths,...published.map(p=>p.path)]);
 return queue.filter(p=>p.publishDate<=clock.date && !used.has(p.path)).sort((a,b)=>a.publishDate.localeCompare(b.publishDate))[0] || null;
}
export function release(now = new Date(), dryRun = false) {
 const queue=readdirSync('content/queue').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync('content/queue/'+f,'utf8')));
 const published=JSON.parse(readFileSync('src/data/editorial-posts.json','utf8'));
 const existing=JSON.parse(readFileSync('src/data/blog-routes.json','utf8')).map(p=>p.path);
 const post=choosePost(queue,published,now,existing);
 if (!post) { console.log('No post due.'); return null; }
 console.log(`${dryRun?'Would publish':'Publishing'}: ${post.title}`);
 if (dryRun) return post;
 const stamp=now.toISOString();
 const {publishDate,primaryKeyword,secondaryKeywords,researchDate,...content}=post;
 published.push({...content,published:stamp,modified:stamp,displayDate:localClock(now).date});
 writeFileSync('src/data/editorial-posts.json',JSON.stringify(published,null,2)+'\n');
 writeFileSync('src/data/editorial-routes.json',JSON.stringify(published.map(p=>({path:p.path,modified:p.modified})),null,2)+'\n');
 return post;
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) release(new Date(),process.argv.includes('--dry-run'));
