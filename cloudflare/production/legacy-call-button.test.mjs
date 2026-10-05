import test from 'node:test';
import assert from 'node:assert/strict';
import { repairLegacyCallButton, repairPublicLegacyResponse } from './legacy-call-button.mjs';
import {handleRequest} from './worker.mjs';
const old = '<a  href="tel:0435 193 756" id="callnowbutton" class="call-now-button cnb-text">Call Now</a>';
const fixed = old.replace('tel:0435 193 756','tel:0494597993');
const req = (path='/category/digital-marketing/',options) => new Request('https://codemax.com.au'+path,options);
const response = (body=old,options={}) => new Response(body,{headers:{'Content-Type':'text/html; charset=UTF-8'},...options});
test('Changes only exact verified plugin anchor and is idempotent',()=>{
 assert.equal(repairLegacyCallButton('before'+old+'after'),'before'+fixed+'after');
 assert.equal(repairLegacyCallButton(fixed),fixed);
 assert.equal(repairLegacyCallButton(old.replaceAll('"',"'")),fixed.replaceAll('"',"'"));
 for(const html of [old.replace('callnowbutton','other'),old.replace('call-now-button','other'),old.replace('0435 193 756','0494 597 993'),old.replace('id="callnowbutton"','id="callnowbutton" id="other"'),old.replace('href=','data-href='),`<!-- ${old} -->`,`<script>${old}</script>`,`<textarea>${old}</textarea>`,`<style>${old}</style>`,`<plaintext>${old}`,`<div data-test='${old}'>`]) assert.equal(repairLegacyCallButton(html),html);
});
test('Preserves unrelated phone links, comments, raw text, markup, status and headers',async()=>{
 const extra='<a href="tel:0435 193 756">Elsewhere</a><!-- '+old+' --><script>'+old+'</script>';
 const r=await repairPublicLegacyResponse(req('/not-found/'),response(old+extra,{status:404,headers:{'Content-Type':'text/html','ETag':'old','Last-Modified':'date','Content-Length':'5','Content-Encoding':'gzip','X-Robots-Tag':'noindex','Cache-Control':'public, max-age=60'}}));
 assert.equal(await r.text(),fixed+extra);assert.equal(r.status,404);
 for(const key of ['ETag','Last-Modified','Content-Length','Content-Encoding'])assert.equal(r.headers.get(key),null);
 assert.equal(r.headers.get('X-Robots-Tag'),'noindex');assert.equal(r.headers.get('Cache-Control'),'public, max-age=60');
});
test('Bypasses all private, query, application, non-HTML and non-GET responses',async()=>{
 for(const request of [req('/wp-admin/'),req('/wp-login.php'),req('/wp-json/wp/v2/posts'),req('/?s=query'),req('/',{method:'POST',body:'a'}),req('/',{method:'HEAD'}),req('/',{headers:{Authorization:'Bearer token'}}),req('/',{headers:{Cookie:'wordpress_logged_in_x=secret'}}),req('/',{headers:{Cookie:'wordpress_sec_x=secret'}}),new Request('https://other.test/')]) {
  const r=response();assert.equal(await repairPublicLegacyResponse(request,r),r);
 }
 for(const headers of [{'Content-Type':'application/json'},{'Content-Type':'text/html','Set-Cookie':'a=b'}]){
  const r=response(old,{headers});assert.equal(await repairPublicLegacyResponse(req(),r),r);
 }
 for(const status of [301,500]) {const r=response(old,{status});assert.equal(await repairPublicLegacyResponse(req(),r),r);}
 const unchanged=response('no button');assert.equal(await repairPublicLegacyResponse(req(),unchanged),unchanged);assert.equal(await unchanged.text(),'no button');
});
test('Router corrects public origin only while enabled',async()=>{
 const env={ENABLED:'true',PAGES_ORIGIN:'https://codemax-web.pages.dev'};
 let r=await handleRequest(req(),env,async()=>response());assert.equal(await r.text(),fixed);
 r=await handleRequest(req(),{...env,ENABLED:'false'},async()=>response());assert.equal(await r.text(),old);
 r=await handleRequest(req('/'),env,async()=>response());assert.equal(await r.text(),old);
});

test('Anonymous WordPress 404 no-store/private policy is preserved',async()=>{
 const policy='no-cache, must-revalidate, max-age=0, no-store, private';
 const r=await repairPublicLegacyResponse(req('/legacy-missing/'),response(old,{status:404,headers:{'Content-Type':'text/html; charset=UTF-8','Cache-Control':policy}}));
 assert.equal(await r.text(),fixed);assert.equal(r.status,404);assert.equal(r.headers.get('Cache-Control'),policy);
});
