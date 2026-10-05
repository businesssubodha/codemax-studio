import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import manifest from '../src/data/article-image-variants.json' with {type:'json'};
import imported from '../src/data/blog-posts.json' with {type:'json'};
import editorial from '../src/data/editorial-posts.json' with {type:'json'};
import {getArticleImageVariants, optimizeArticleImages} from '../src/lib/article-image-variants.mjs';
import {assetPaths} from '../cloudflare/production/routes.mjs';
import {studioPath} from '../cloudflare/production/worker.mjs';
const path='/dont-miss-out-crucial-mobile-seo-services-australian-website-needs/';
const urls=Object.keys(manifest[path]);const inline=urls.find(u=>u.endsWith('image-1.jpeg'));const data=manifest[path][inline];
const posts=[...imported,...editorial];
test('Two inspected images only, exact route/URL scoping, six routed local assets',()=>{
 assert.deepEqual(Object.keys(manifest),[path]);assert.equal(urls.length,2);
 assert.equal(getArticleImageVariants('/elsewhere/',inline),undefined);assert.equal(getArticleImageVariants(path,inline+'?x=1'),undefined);
 for(const source of urls){const v=manifest[path][source];assert.equal(v.sizes,'(max-width: 700px) 90vw, (max-width: 1022px) 92vw, 940px');
  const entries=v.srcset.split(', ');assert.equal(entries.length,3);
  for(const entry of entries){const [asset,width]=entry.split(' ');assert.match(width,/^(480|768|1024)w$/);assert.ok(assetPaths.has(asset));assert.ok(existsSync(new URL('../public'+asset,import.meta.url)));assert.equal(studioPath(new Request('https://codemax.com.au'+asset)),asset);const bytes=readFileSync(new URL('../public'+asset,import.meta.url));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');}
 }
 assert.equal(studioPath(new Request('https://codemax.com.au/article-media/not-allowed.webp')),null);
});
test('Exact inline replacement preserves original metadata and formatting',()=>{
 for(const quote of ['"',"'",'']) {
  const tag=`<img src=${quote}${inline}${quote} width="1024" height="1024" alt="Content > unchanged" loading="lazy" decoding="async" />`;
  const out=optimizeArticleImages(path,tag);
  assert.equal(out,tag.replace(inline,data.src).replace(' />',` srcset="${data.srcset}" sizes="${data.sizes}" />`));assert.equal(optimizeArticleImages(path,out),out);
 }
});
test('Preserves existing responsive attributes, ambiguity, raw text and unrelated content',()=>{
 for(const tag of [`<img data-src="${inline}">`,`<img src="${inline}" src="other">`,`<img src="${inline}" srcset="existing">`,`<img src="${inline}" sizes="10px">`,`<img src="${inline}?other">`,`<img title='src="${inline}"' src="other">`,`<img src="${inline}"`])assert.equal(optimizeArticleImages(path,tag),tag);
 const image=`<img src="${inline}">`;
 for(const html of [`<!-- ${image} -->`,`<![CDATA[${image}]]>`,`<plaintext>${image}`,...['script','style','textarea','title','xmp','iframe','noembed','noframes'].map(t=>`<${t}>${image}</${t}>`)])assert.equal(optimizeArticleImages(path,html),html);
 assert.equal(optimizeArticleImages('/elsewhere/',image),image);
});
test('Only audited article changes across all immutable source records',()=>{
 const snapshot=JSON.stringify(posts),changes=[];
 for(const post of posts){const out=optimizeArticleImages(post.path,post.html);if(out!==post.html)changes.push(post.path);assert.equal(optimizeArticleImages(post.path,out),out);}
 assert.deepEqual(changes,[path]);assert.equal(JSON.stringify(posts),snapshot);
});
test('Built target contains responsive variants and both original image sources remain in records',{skip:process.env.ARTICLE_IMAGE_CHECK_DIST!=='1'},()=>{
 const html=readFileSync(new URL('../dist'+path+'index.html',import.meta.url),'utf8');
 for(const source of urls){const data=manifest[path][source];const tags=html.match(/<img\b[^>]*>/g).filter(t=>t.includes(`src="${data.src}"`));assert.equal(tags.length,1);assert.ok(tags[0].includes(`srcset="${data.srcset}"`));assert.ok(tags[0].includes(`sizes="${data.sizes}"`));assert.ok(tags[0].includes('width="1024" height="1024"'));}
 const post=posts.find(p=>p.path===path);assert.ok(urls.includes(post.featuredImage.url));assert.ok(post.html.includes(inline));
});
