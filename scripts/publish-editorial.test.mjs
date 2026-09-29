import {test} from 'node:test';
import assert from 'node:assert/strict';
import {choosePost,localClock} from './publish-editorial.mjs';
const queue=[{path:'/a/',publishDate:'2026-10-01'},{path:'/b/',publishDate:'2026-10-02'}];
test('does not release before the first date or 9am Melbourne',()=>{
 assert.equal(choosePost(queue,[],new Date('2026-09-30T22:59:00Z')),null);
 assert.equal(choosePost(queue,[],new Date('2026-09-29T23:07:00Z')),null);
 assert.equal(choosePost(queue,[],new Date('2026-09-30T23:07:00Z')).path,'/a/');
});
test('releases no more than one each local day including catch-up',()=>{
 assert.equal(choosePost(queue,[{path:'/a/',displayDate:'2026-10-02'}],new Date('2026-10-02T01:00:00Z')),null);
 assert.equal(choosePost(queue,[],new Date('2026-10-03T23:07:00Z')).path,'/a/');
});
test('handles the October daylight saving change',()=>{
 assert.deepEqual(localClock(new Date('2026-10-03T22:07:00Z')),{date:'2026-10-04',hour:9});
});
test('does not duplicate an existing URL or a released article',()=>{
 assert.equal(choosePost(queue,[{path:'/a/',displayDate:'2026-10-01'}],new Date('2026-10-02T00:00:00Z')).path,'/b/');
 assert.equal(choosePost(queue,[],new Date('2026-10-01T23:07:00Z'),['/a/','/b/']),null);
});
