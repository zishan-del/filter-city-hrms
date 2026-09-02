(function(){
  'use strict';
  if(window.__fcDashboardRedesign9C41Polish)return;
  window.__fcDashboardRedesign9C41Polish=true;

  const style=document.createElement('style');
  style.id='fc-dashboard-9c41-polish-style';
  style.textContent=`
    body.fc-theme-9c1 .fc-mini-name,
    body.fc-theme-9c1 .fc-brand-name{
      direction:ltr;
      unicode-bidi:isolate;
    }
    body.fc-theme-9c1 .fc-mini-name{
      text-align:left;
    }
    body.fc-theme-9c1 .fc-brand-name{
      white-space:nowrap;
      font-size:12px;
      letter-spacing:-.15px;
    }
    .fc-pay-mini b{
      font-size:13px!important;
      white-space:nowrap;
      overflow-wrap:normal!important;
      word-break:normal;
      font-variant-numeric:tabular-nums;
    }
    @media(max-width:1180px) and (min-width:851px){
      .fc-pay-mini b{font-size:12px!important}
    }
  `;
  document.head.appendChild(style);

  const leaveTypes={
    'Annual Leave':'إجازة سنوية',
    'Sick Leave':'إجازة مرضية',
    'Emergency Leave':'إجازة طارئة',
    'Unpaid Leave':'إجازة بدون راتب',
    'Paid Leave':'إجازة مدفوعة',
    'Personal Leave':'إجازة شخصية',
    'Maternity Leave':'إجازة أمومة',
    'Paternity Leave':'إجازة أبوة',
    'Hajj Leave':'إجازة حج',
    'Marriage Leave':'إجازة زواج',
    'Bereavement Leave':'إجازة وفاة',
    'Study Leave':'إجازة دراسية',
    'Other':'أخرى'
  };
  const leaveTypesReverse=Object.fromEntries(Object.entries(leaveTypes).map(([en,ar])=>[ar,en]));

  function arabic(){return document.documentElement.dir==='rtl'||document.documentElement.lang==='ar';}

  function fixBrandDirection(){
    document.querySelectorAll('.fc-mini-name,.fc-brand-name').forEach(el=>{
      el.setAttribute('dir','ltr');
    });
  }

  function fixLeaveTypes(){
    document.querySelectorAll('.fc-list-sub').forEach(el=>{
      const text=String(el.textContent||'');
      const split=text.indexOf(' · ');
      if(split<0)return;
      const type=text.slice(0,split).trim();
      const rest=text.slice(split);
      if(arabic()&&leaveTypes[type])el.textContent=leaveTypes[type]+rest;
      if(!arabic()&&leaveTypesReverse[type])el.textContent=leaveTypesReverse[type]+rest;
    });
  }

  function polish(){
    fixBrandDirection();
    fixLeaveTypes();
  }

  const content=document.getElementById('content');
  if(content)new MutationObserver(()=>setTimeout(polish,0)).observe(content,{childList:true,subtree:true});
  new MutationObserver(()=>setTimeout(polish,0)).observe(document.documentElement,{attributes:true,attributeFilter:['dir','lang']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(polish,0),{once:true});
  else setTimeout(polish,0);
})();
