import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {localClock} from './publish-editorial.mjs';
export function chooseAiPost(queue,published,now,existingPaths=[]) {
 const {date}=localClock(now);
 if(published.some(p=>p.publicationSeries==='ai-growth' && p.displayDate===date)) return null;
 const used=new Set([...existingPaths,...published.map(p=>p.path)]);
 return queue.filter(p=>p.publishDate<=date&&!used.has(p.path)).sort((a,b)=>a.publishDate.localeCompare(b.publishDate))[0] || null;
}
export function releaseAi(now=new Date(),dryRun=false){
 const queue=readdirSync('content/ai-queue').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync('content/ai-queue/'+f,'utf8')));
 const published=JSON.parse(readFileSync('src/data/editorial-posts.json','utf8'));
 const existing=JSON.parse(readFileSync('src/data/blog-routes.json','utf8')).map(p=>p.path);
 const post=chooseAiPost(queue,published,now,existing);
 if(!post){console.log('No AI article due.');return null;}
 console.log(`${dryRun?'Would publish':'Publishing'}: ${post.title}`);
 if(dryRun)return post;
 const {publishDate,primaryKeyword,secondaryKeywords,targetKeywords,researchDate,sources,...content}=post;
 const stamp=now.toISOString();published.push({...content,published:stamp,modified:stamp,displayDate:localClock(now).date});
 writeFileSync('src/data/editorial-posts.json',JSON.stringify(published,null,2)+'\n');
 writeFileSync('src/data/editorial-routes.json',JSON.stringify(published.map(p=>({path:p.path,modified:p.modified})),null,2)+'\n');
 return post;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)releaseAi(new Date(),process.argv.includes('--dry-run'));
