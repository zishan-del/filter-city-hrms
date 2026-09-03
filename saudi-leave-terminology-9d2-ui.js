(function(){
  'use strict';
  if(window.__fcSaudiLeaveTerminology9D2)return;
  window.__fcSaudiLeaveTerminology9D2=true;

  const style=document.createElement('style');
  style.textContent=`
    #fc-saudi-leave-note-9d2{margin:0 0 18px;border:1px solid #dce3eb;border-inline-start:4px solid #ed1c24;border-radius:12px;background:#fff;overflow:hidden}
    #fc-saudi-leave-note-9d2 .fc-9d2-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #edf0f4;font-weight:800;color:#0b3158}
    #fc-saudi-leave-note-9d2 .fc-9d2-badge{font-size:11px;font-weight:700;border-radius:999px;padding:4px 9px;background:#eef4fa;color:#0b3158;white-space:nowrap}
    #fc-saudi-leave-note-9d2 .fc-9d2-body{padding:12px 16px;line-height:1.6;color:#516175;font-size:13px}
    @media(max-width:600px){#fc-saudi-leave-note-9d2 .fc-9d2-head{align-items:flex-start;flex-direction:column}#fc-saudi-leave-note-9d2 .fc-9d2-badge{white-space:normal}}
  `;
  document.head.appendChild(style);

  function isArabic(){return document.body.classList.contains('fc-lang-ar')||document.documentElement.lang==='ar';}
  function activePage(){const b=document.querySelector('#nav button.active');return b&&b.id?b.id.replace(/^nav-/,''):'';}
  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

  const copy={
    en:{
      title:'Saudi HR presentation — Annual Leave Reference',
      badge:'Step 9D.2 · Leave only',
      body:'Annual leave is at least 21 paid days for each year and increases to at least 30 days after five consecutive years with the same employer. The employer schedules annual leave according to work requirements and should notify the worker at least 30 days in advance. Company policy or the employment contract may provide a more generous entitlement. The planning tracker below is an internal scheduling tool and does not calculate statutory entitlement.',
      tracker:'Employee Leave Planning Tracker',
      trackerBadge:'Internal planning · not statutory entitlement',
      next:'Planned Next Leave',
      planned:'Planned Days (Internal)',
      cycle:'Planning Cycle',
      last:'Last Leave End',
      until:'Days Until Planned Leave'
    },
    ar:{
      title:'عرض الموارد البشرية السعودية — مرجع الإجازة السنوية',
      badge:'الخطوة 9D.2 · الإجازات فقط',
      body:'يستحق العامل إجازة سنوية مدفوعة لا تقل عن 21 يوماً عن كل سنة، وتزداد إلى ما لا يقل عن 30 يوماً بعد خمس سنوات متصلة لدى صاحب العمل نفسه. يحدد صاحب العمل موعد الإجازة وفق مقتضيات العمل مع إشعار العامل قبلها بمدة لا تقل عن 30 يوماً. ويجوز أن تمنح سياسة الشركة أو عقد العمل استحقاقاً أفضل. سجل التخطيط أدناه أداة داخلية للجدولة ولا يحسب الاستحقاق النظامي.',
      tracker:'سجل تخطيط إجازات الموظفين',
      trackerBadge:'تخطيط داخلي · لا يحسب الاستحقاق النظامي',
      next:'الإجازة المخططة القادمة',
      planned:'الأيام المخططة (داخلي)',
      cycle:'دورة التخطيط',
      last:'نهاية آخر إجازة',
      until:'الأيام حتى الإجازة المخططة'
    }
  };

  function patchTracker(root,c,ar){
    const sections=[...root.querySelectorAll('.section')];
    const tracker=sections.find(section=>{
      const head=section.querySelector('.section-head b');
      if(!head)return false;
      const t=head.textContent.trim();
      return /Upcoming Employee Leave|Employee Leave Planning Tracker|الإجازات القادمة للموظفين|سجل تخطيط إجازات الموظفين/.test(t);
    });
    if(!tracker)return;
    const head=tracker.querySelector('.section-head');
    const title=head&&head.querySelector('b');
    const badge=head&&head.querySelector('.badge');
    if(title)title.textContent=c.tracker;
    if(badge)badge.textContent=c.trackerBadge;
    const headers=tracker.querySelectorAll('thead th');
    const labels=[ar?'الموظف':'Employee',ar?'الاسم':'Name',c.next,c.planned,c.cycle,c.last,c.until];
    headers.forEach((th,i)=>{if(labels[i])th.textContent=labels[i];});
  }

  let scheduled=false;
  function apply(){
    scheduled=false;
    if(activePage()!=='leave'){
      document.getElementById('fc-saudi-leave-note-9d2')?.remove();
      return;
    }
    const root=document.getElementById('content');
    if(!root)return;
    const ar=isArabic();
    const c=copy[ar?'ar':'en'];
    let note=document.getElementById('fc-saudi-leave-note-9d2');
    if(!note){
      note=document.createElement('div');
      note.id='fc-saudi-leave-note-9d2';
      const existing=document.getElementById('fc-saudi-hr-note-9d1');
      if(existing&&existing.parentElement===root)existing.insertAdjacentElement('afterend',note);
      else root.insertBefore(note,root.firstChild);
    }
    note.innerHTML=`<div class="fc-9d2-head"><span>${esc(c.title)}</span><span class="fc-9d2-badge">${esc(c.badge)}</span></div><div class="fc-9d2-body">${esc(c.body)}</div>`;
    patchTracker(root,c,ar);
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','lang','dir']});
  document.addEventListener('click',schedule,true);
  window.addEventListener('load',schedule);
  schedule();
})();
