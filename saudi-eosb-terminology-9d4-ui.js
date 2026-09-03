(function(){
  'use strict';
  if(window.__fcSaudiEosbTerminology9D4)return;
  window.__fcSaudiEosbTerminology9D4=true;

  const copy={
    en:{
      title:'Saudi HR presentation — End-of-Service Award (EOSB)',
      badge:'Step 9D.4 · EOSB only',
      body:'Saudi Labor Law Article 84 bases the end-of-service award on half a month of the last wage for each of the first five years and one month for each following year, including proportional parts of a year. Resignation and some other separation circumstances can change the final entitlement. The current HRMS calculation below stores the Article 84 base award only; separation reason is not currently part of this saved calculation.',
      section:'End-of-Service Award (EOSB)',
      calculate:'+ Calculate Base EOSB',
      employee:'Employee',
      years:'Service Years',
      wage:'Last Wage (SAR)',
      first5:'First 5 Years Base',
      after5:'After 5 Years Base',
      award:'Stored Base Award',
      empty:'No EOSB calculations.',
      formTitle:'Calculate Base EOSB',
      save:'Calculate & Save Base Award',
      note:'Operational HRMS calculation only. Verify the separation reason, contract terms, service dates, wage basis and applicable Saudi Labor Law provisions before final settlement. This presentation does not change previously stored EOSB records or the existing formula.',
      breakdown:'Display breakdown: first five years = 0.5 month of last wage per service year; years after five = 1 month of last wage per service year.'
    },
    ar:{
      title:'عرض الموارد البشرية السعودية — مكافأة نهاية الخدمة',
      badge:'الخطوة 9D.4 · مكافأة نهاية الخدمة فقط',
      body:'تُحسب مكافأة نهاية الخدمة وفق الأساس الوارد في المادة 84 من نظام العمل السعودي: أجر نصف شهر عن كل سنة من السنوات الخمس الأولى، وأجر شهر عن كل سنة من السنوات التالية، على أساس الأجر الأخير، مع احتساب أجزاء السنة بنسبة مدة الخدمة. قد تؤثر الاستقالة وبعض حالات انتهاء العلاقة على الاستحقاق النهائي. الحساب الحالي في النظام يحفظ المكافأة الأساسية وفق هذا الأساس فقط، ولا يدخل سبب انتهاء العلاقة حالياً ضمن الحساب المحفوظ.',
      section:'مكافأة نهاية الخدمة (EOSB)',
      calculate:'+ حساب المكافأة الأساسية',
      employee:'الموظف',
      years:'سنوات الخدمة',
      wage:'الأجر الأخير (SAR)',
      first5:'أساس أول 5 سنوات',
      after5:'أساس ما بعد 5 سنوات',
      award:'المكافأة الأساسية المحفوظة',
      empty:'لا توجد حسابات لمكافأة نهاية الخدمة.',
      formTitle:'حساب المكافأة الأساسية لنهاية الخدمة',
      save:'حساب وحفظ المكافأة الأساسية',
      note:'حساب تشغيلي داخل نظام الموارد البشرية فقط. يجب التحقق من سبب انتهاء العلاقة وعقد العمل وتواريخ الخدمة وأساس الأجر وأحكام نظام العمل السعودي المطبقة قبل التسوية النهائية. هذا العرض لا يغير سجلات مكافأة نهاية الخدمة المحفوظة سابقاً ولا يغير معادلة الحساب الحالية.',
      breakdown:'تفصيل العرض: أول خمس سنوات = نصف شهر من الأجر الأخير عن كل سنة خدمة؛ وما بعد خمس سنوات = شهر كامل من الأجر الأخير عن كل سنة خدمة.'
    }
  };

  const style=document.createElement('style');
  style.textContent=`
    #fc-saudi-eosb-note-9d4{margin:0 0 18px;border:1px solid #dce3eb;border-inline-start:4px solid #0b3158;border-radius:12px;background:#fff;overflow:hidden}
    #fc-saudi-eosb-note-9d4 .fc-9d4-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #edf0f4;font-weight:800;color:#0b3158}
    #fc-saudi-eosb-note-9d4 .fc-9d4-badge{font-size:11px;font-weight:700;border-radius:999px;padding:4px 9px;background:#eef4fa;color:#0b3158;white-space:nowrap}
    #fc-saudi-eosb-note-9d4 .fc-9d4-body{padding:12px 16px;line-height:1.65;color:#516175;font-size:13px}
    .fc-9d4-eosb-note{margin:14px 18px;padding:11px 12px;border:1px solid #dce3eb;border-radius:9px;background:#f7f9fb;color:#516175;font-size:12px;line-height:1.55}
    .fc-9d4-eosb-breakdown{margin:0 18px 14px;color:#637083;font-size:12px;line-height:1.5}
    @media(max-width:600px){#fc-saudi-eosb-note-9d4 .fc-9d4-head{align-items:flex-start;flex-direction:column}#fc-saudi-eosb-note-9d4 .fc-9d4-badge{white-space:normal}}
  `;
  document.head.appendChild(style);

  function isArabic(){return document.body.classList.contains('fc-lang-ar')||document.documentElement.lang==='ar'||document.documentElement.dir==='rtl';}
  function activePage(){const b=document.querySelector('#nav button.active');return b&&b.id?b.id.replace(/^nav-/,''):'';}
  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));}
  function num(v){const n=Number(String(v??'').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:0;}
  function money(v){return `SAR ${Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;}

  function ensureTopNote(root,c){
    let note=document.getElementById('fc-saudi-eosb-note-9d4');
    if(!note){note=document.createElement('div');note.id='fc-saudi-eosb-note-9d4';root.insertBefore(note,root.firstChild);}
    note.innerHTML=`<div class="fc-9d4-head"><span>${esc(c.title)}</span><span class="fc-9d4-badge">${esc(c.badge)}</span></div><div class="fc-9d4-body">${esc(c.body)}</div>`;
  }

  function patchList(root,c){
    const sections=[...root.querySelectorAll('.section')];
    const section=sections.find(s=>s.querySelector('table.table')&&s.querySelector('.section-head'));
    if(!section)return false;
    const head=section.querySelector('.section-head');
    const title=head.querySelector('b');if(title)title.textContent=c.section;
    const button=head.querySelector('button');if(button&&/eosbForm/.test(button.getAttribute('onclick')||''))button.textContent=c.calculate;
    const table=section.querySelector('table.table');if(!table)return true;
    const th=[...table.querySelectorAll('thead th')];
    if(th.length>=4){
      if(th.length===4){
        const first5=document.createElement('th');
        const after5=document.createElement('th');
        th[3].before(first5,after5);
      }
      const all=[...table.querySelectorAll('thead th')];
      [c.employee,c.years,c.wage,c.first5,c.after5,c.award].forEach((txt,i)=>{if(all[i])all[i].textContent=txt;});
    }
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells=[...tr.querySelectorAll('td')];
      if(cells.length===1&&cells[0].hasAttribute('colspan')){cells[0].colSpan=6;cells[0].textContent=c.empty;return;}
      if(cells.length<4)return;
      if(cells.length===4){
        const years=num(cells[1].textContent),wage=num(cells[2].textContent);
        const first=Math.min(Math.max(years,0),5)*0.5*wage;
        const after=Math.max(years-5,0)*wage;
        const td1=document.createElement('td');td1.textContent=money(first);
        const td2=document.createElement('td');td2.textContent=money(after);
        cells[3].before(td1,td2);
      }
      const now=[...tr.querySelectorAll('td')];
      if(now[2])now[2].textContent=money(num(now[2].textContent));
      if(now[5])now[5].textContent=money(num(now[5].textContent));
    });
    let breakdown=section.querySelector('.fc-9d4-eosb-breakdown');
    if(!breakdown){breakdown=document.createElement('div');breakdown.className='fc-9d4-eosb-breakdown';section.appendChild(breakdown);}
    breakdown.textContent=c.breakdown;
    let note=section.querySelector('.fc-9d4-eosb-note');
    if(!note){note=document.createElement('div');note.className='fc-9d4-eosb-note';section.appendChild(note);}
    note.textContent=c.note;
    return true;
  }

  function setFieldLabel(inputId,text){const input=document.getElementById(inputId);const label=input?.closest('.field')?.querySelector('label');if(label)label.textContent=text;}
  function patchForm(root,c){
    if(!document.getElementById('eos_emp'))return false;
    const section=root.querySelector('.section');if(!section)return false;
    const title=section.querySelector('.section-head b');if(title)title.textContent=c.formTitle;
    setFieldLabel('eos_emp',c.employee);setFieldLabel('eos_years',c.years);setFieldLabel('eos_salary',c.wage);
    const save=section.querySelector('button[onclick*="saveEOSB"]');if(save)save.textContent=c.save;
    let breakdown=section.querySelector('.fc-9d4-eosb-breakdown');
    if(!breakdown){breakdown=document.createElement('div');breakdown.className='fc-9d4-eosb-breakdown';const grid=section.querySelector('.form-grid');if(grid)grid.insertAdjacentElement('beforebegin',breakdown);}
    if(breakdown)breakdown.textContent=c.breakdown;
    let note=section.querySelector('.fc-9d4-eosb-note');
    if(!note){note=document.createElement('div');note.className='fc-9d4-eosb-note';section.appendChild(note);}
    note.textContent=c.note;
    return true;
  }

  let scheduled=false;
  function apply(){
    scheduled=false;
    if(activePage()!=='eosb'){document.getElementById('fc-saudi-eosb-note-9d4')?.remove();return;}
    const root=document.getElementById('content');if(!root)return;
    const c=copy[isArabic()?'ar':'en'];
    ensureTopNote(root,c);
    if(!patchForm(root,c))patchList(root,c);
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','lang','dir']});
  document.addEventListener('click',schedule,true);
  document.addEventListener('input',schedule,true);
  document.addEventListener('change',schedule,true);
  window.addEventListener('load',schedule);
  schedule();
})();