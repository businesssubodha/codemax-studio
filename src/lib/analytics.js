export function setupAnalytics(win = window, doc = document) {
 const panel=doc.querySelector('#analytics-choice');
 const id=panel?.dataset.measurementId;
 if(!/^G-[A-Z0-9]+$/.test(id || '')) return;
 if(!['codemax.com.au','www.codemax.com.au'].includes(win.location.hostname)) return;
 const key='codemax-analytics-choice';
 let allowed=false,started=false;
 const remember=value=>{try{win.localStorage.setItem(key,value);}catch{}};
 const cleanLocation=()=>win.location.origin+win.location.pathname;
 const send=name=>{
  if(!allowed || !started) return;
  win.gtag('event',name,{page_location:cleanLocation(),page_referrer:'',send_to:id});
 };
 const start=()=>{
  allowed=true;win['ga-disable-'+id]=false;
  if(started){win.gtag('consent','update',{analytics_storage:'granted'});return;}
  started=true;
  win.dataLayer=win.dataLayer||[];
  win.gtag=function(){win.dataLayer.push(arguments);};
  win.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  win.gtag('js',new Date());
  win.gtag('config',id,{send_page_view:false,page_location:cleanLocation(),page_referrer:'',allow_google_signals:false,allow_ad_personalization_signals:false});
  const script=doc.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;doc.head.appendChild(script);
  send('page_view');
 };
 let preference;try{preference=win.localStorage.getItem(key);}catch{}
 if(preference==='allow')start();else if(preference!=='decline')panel.hidden=false;
 panel.querySelectorAll('[data-analytics]').forEach(button=>button.addEventListener('click',()=>{
  const choice=button.dataset.analytics;remember(choice);panel.hidden=true;
  if(choice==='allow')start();else{
   allowed=false;win['ga-disable-'+id]=true;
   if(started)win.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  }
 }));
 doc.querySelector('#analytics-settings')?.addEventListener('click',()=>{panel.hidden=false;panel.querySelector('button')?.focus();});
 doc.addEventListener('codemax:enquiry-success',()=>send('generate_lead'));
 doc.addEventListener('click',event=>{
  const link=event.target?.closest?.('a[href]');if(!link)return;
  const href=link.getAttribute('href')||'';
  if(href.startsWith('tel:'))send('contact_phone_click');
  else if(href.startsWith('mailto:'))send('contact_email_click');
 });
}
