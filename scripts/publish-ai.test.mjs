import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chooseAiPost} from './publish-ai.mjs';
import {choosePost} from './publish-editorial.mjs';
const q=[{path:'/ai-one/',publishDate:'2026-09-30'},{path:'/ai-two/',publishDate:'2026-10-02'}];
test('AI release starts today and never releases a future item',()=>{
 assert.equal(chooseAiPost(q,[],new Date('2026-09-29T12:00:00Z')),null);
 assert.equal(chooseAiPost(q,[],new Date('2026-09-30T01:00:00Z')).path,'/ai-one/');
 assert.equal(chooseAiPost(q,[{path:'/ai-one/',publicationSeries:'ai-growth',displayDate:'2026-09-30'}],new Date('2026-10-01T01:00:00Z')),null);
});
test('AI is idempotent and catches up at most one per local day',()=>{
 const pub=[{path:'/ai-one/',publicationSeries:'ai-growth',displayDate:'2026-10-03'}];
 assert.equal(chooseAiPost(q,pub,new Date('2026-10-03T01:00:00Z')),null);
 assert.equal(chooseAiPost(q,pub,new Date('2026-10-03T22:00:00Z')).path,'/ai-two/');
 assert.equal(chooseAiPost(q,[],new Date('2026-10-05T01:00:00Z'),q.map(p=>p.path)),null);
});
test('AI and website schedules cannot block each other',()=>{
 const now=new Date('2026-10-02T01:00:00Z');
 const ai=[{path:'/ai-one/',publicationSeries:'ai-growth',displayDate:'2026-10-02'}];
 const web=[{path:'/website/',displayDate:'2026-10-02'}];
 assert.equal(choosePost([{path:'/website/',publishDate:'2026-10-02'}],ai,now).path,'/website/');
 assert.equal(chooseAiPost(q,web,now).path,'/ai-one/');
});
