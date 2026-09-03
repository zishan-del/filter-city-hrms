(function(){
  'use strict';
  if(window.__fcStoreComplianceUi)return;
  window.__fcStoreComplianceUi=true;

  function isArabic(){
    return document.documentElement.dir==='rtl' || String(document.documentElement.lang||'').toLowerCase().startsWith('ar');
  }

  function labels(){
    return isArabic()
      ? {privacy:'سياسة الخصوصية',support:'الدعم'}
      : {privacy:'Privacy Policy',support:'Support'};
  }

  function addLoginLinks(){
    var card=document.querySelector('.login-card');
    if(!card||document.getElementById('fc-store-login-links'))return;
    var l=labels();
    var box=document.createElement('div');
    box.id='fc-store-login-links';
    box.style.cssText='text-align:center;font-size:12px;margin-top:14px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap';
    box.innerHTML='<a href="/privacy.html" style="color:#124f87">'+l.privacy+'</a><a href="/support.html" style="color:#124f87">'+l.support+'</a>';
    card.appendChild(box);
  }

  function addSidebarLinks(){
    var sidebar=document.getElementById('sidebar');
    if(!sidebar||document.getElementById('fc-store-sidebar-links'))return;
    var l=labels();
    var box=document.createElement('div');
    box.id='fc-store-sidebar-links';
    box.style.cssText='font-size:11px;margin-top:14px;display:flex;gap:10px;flex-wrap:wrap';
    box.innerHTML='<a href="/privacy.html" style="color:#cfe2f5">'+l.privacy+'</a><a href="/support.html" style="color:#cfe2f5">'+l.support+'</a>';
    sidebar.appendChild(box);
  }

  function refreshLabels(){
    var l=labels();
    var login=document.getElementById('fc-store-login-links');
    if(login&&login.children.length>=2){login.children[0].textContent=l.privacy;login.children[1].textContent=l.support;}
    var side=document.getElementById('fc-store-sidebar-links');
    if(side&&side.children.length>=2){side.children[0].textContent=l.privacy;side.children[1].textContent=l.support;}
  }

  function ensure(){addLoginLinks();addSidebarLinks();refreshLabels();}
  setTimeout(ensure,0);
  setTimeout(ensure,500);
  new MutationObserver(function(){setTimeout(ensure,0);}).observe(document.documentElement,{attributes:true,attributeFilter:['dir','lang']});
})();
