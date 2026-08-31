(()=>{
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  function token(){return localStorage.getItem('fc_hrms_token')||'';}
  function user(){try{return JSON.parse(sessionStorage.getItem('fc_user')||'null')}catch(_){return null}}
  function isEmployee(){const u=user();return u&&u.role==='EMPLOYEE'}
  function addBanner(){
    if(!isEmployee()||document.getElementById('pushNotifyCard'))return;
    const content=document.getElementById('content');if(!content)return;
    const box=document.createElement('div');box.id='pushNotifyCard';box.className='section';box.innerHTML='<div class="section-head"><b>📱 Mobile Notifications</b><button id="enablePushBtn">Enable Notifications</button></div><div id="pushNotifyMsg" style="padding:14px">Enable notifications to receive task assignments and attendance reminders even when the HRMS is closed.</div>';
    content.prepend(box);
    document.getElementById('enablePushBtn').onclick=enable;
    if(localStorage.getItem('fc_push_enabled')==='1') markEnabled();
  }
  function markEnabled(){const b=document.getElementById('enablePushBtn'),m=document.getElementById('pushNotifyMsg');if(b){b.textContent='Notifications Enabled';b.disabled=true}if(m)m.textContent='Your phone is registered for FILTER CITY HRMS push notifications.';}
  function base64ToBytes(s){const pad='='.repeat((4-s.length%4)%4);const raw=atob((s+pad).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
  async function enable(){
    const msg=document.getElementById('pushNotifyMsg'),btn=document.getElementById('enablePushBtn');
    try{
      if(!('serviceWorker'in navigator))throw Error('This browser does not support background notifications.');
      if(!('PushManager'in window))throw Error('Push notifications are not supported on this browser.');
      if(!window.isSecureContext)throw Error('Notifications require the secure HRMS link (HTTPS).');
      btn.disabled=true;btn.textContent='Enabling...';msg.textContent='Requesting notification permission...';
      const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
      if(permission!=='granted')throw Error('Notification permission was not granted.');
      msg.textContent='Registering your phone...';
      const reg=await navigator.serviceWorker.register('/sw.js',{scope:'/'});await navigator.serviceWorker.ready;
      const keyRes=await fetch('/api/push/public-key',{headers:{Authorization:'Bearer '+token()}});const keyData=await keyRes.json();if(!keyRes.ok)throw Error(keyData.error||'Push service is not configured.');
      let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64ToBytes(keyData.publicKey)});
      const r=await fetch('/api/push/subscribe',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify(sub.toJSON())});const d=await r.json();if(!r.ok)throw Error(d.error||'Could not register this phone.');
      localStorage.setItem('fc_push_enabled','1');markEnabled();msg.textContent='Notifications are enabled. You can close the HRMS; task notifications can now arrive on this phone.';
    }catch(e){btn.disabled=false;btn.textContent='Try Again';msg.textContent=e.message||'Notification setup failed.';}
  }
  async function init(){for(let i=0;i<20;i++){if(isEmployee()&&document.getElementById('content')){addBanner();return}await sleep(500)}addBanner()}
  const obs=new MutationObserver(()=>addBanner());obs.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',init);init();
})();
