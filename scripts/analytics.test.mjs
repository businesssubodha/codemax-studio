import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setupAnalytics} from '../src/lib/analytics.js';
function fixture(id='G-TEST123',preference=null,hostname='codemax.com.au'){
 const handlers={},buttons={},scripts=[];
 for(const choice of ['allow','decline'])buttons[choice]={dataset:{analytics:choice},addEventListener:(_,fn)=>buttons[choice].click=fn};
 const panel={dataset:{measurementId:id},hidden:true,querySelectorAll:()=>Object.values(buttons),querySelector:()=>({focus(){}})};
 const doc={querySelector:s=>s==='#analytics-choice'?panel:null,addEventListener:(n,fn)=>handlers[n]=fn,createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}};
 const win={location:{hostname,origin:'https://'+hostname,pathname:'/',search:'?email=private@example.com',hash:'#secret'},localStorage:{getItem:()=>preference,setItem:(_,v)=>preference=v}};
 setupAnalytics(win,doc);return {win,doc,panel,handlers,buttons,scripts,events:()=>win.dataLayer?.filter(x=>x[0]==='event').map(x=>Array.from(x))||[]};
}
test('no analytics request before consent or without configuration',()=>{
 const f=fixture();assert.equal(f.scripts.length,0);assert.equal(f.panel.hidden,false);
 f.handlers['codemax:enquiry-success']();assert.equal(f.events().length,0);
 assert.equal(fixture('').scripts.length,0);
 assert.equal(fixture('G-TEST123','allow','preview.pages.dev').scripts.length,0);
});
test('only fixed contact event names, no contact details or URL parameters',()=>{
 const f=fixture();f.buttons.allow.click();f.handlers['codemax:enquiry-success']({detail:{email:'private@example.com'}});
 for(const href of ['tel:+611234','mailto:private@example.com','/#enquiry'])f.handlers.click({target:{closest:()=>({getAttribute:()=>href})}});
 assert.deepEqual(f.events().map(x=>x[1]),['page_view','generate_lead','contact_phone_click','contact_email_click']);
 assert.ok(!JSON.stringify(f.win.dataLayer).includes('private@example.com'));
 assert.ok(!JSON.stringify(f.win.dataLayer).includes('#secret'));
});
test('declining stops events and reallowing restores consent without a second tag',()=>{
 const f=fixture('G-TEST123','allow');f.buttons.decline.click();f.handlers['codemax:enquiry-success']();assert.equal(f.events().length,1);
 f.buttons.allow.click();f.handlers['codemax:enquiry-success']();assert.equal(f.events().length,2);assert.equal(f.scripts.length,1);
 assert.ok(f.win.dataLayer.some(x=>x[0]==='consent'&&x[1]==='update'&&x[2].analytics_storage==='granted'));
});
