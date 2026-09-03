(function(){
  'use strict';
  if(window.__fcSaudiEosbEntitlement9D5)return;
  window.__fcSaudiEosbEntitlement9D5=true;

  const copy={
    en:{
      title:'Saudi EOSB Entitlement Preview — Step 9D.5A',
      badge:'Preview only · no database write',
      body:'Select a stored base EOSB record and the verified separation reason. This preview applies the Saudi Labor Law base-award rule and the selected entitlement rule without changing any saved EOSB record.',
      record:'Base EOSB Record',
      reason:'Separation Reason / Rule',
      chooseRecord:'Choose a stored EOSB record…',
      chooseReason:'Choose the verified separation reason…',
      standard:'Article 84 — standard end of employment / full base award',
      resignation:'Article 85 — worker resignation',
      article87:'Article 87 — full-award exception (verify evidence)',
      article80:'Article 80 — dismissal without award (verify legal grounds)',
      employee:'Employee',
      service:'Service',
      wage:'Last Wage',
      calculate:'Calculate Entitlement — No Save',
      base:'Article 84 Base Award',
      rate:'Entitlement Rate',
      result:'Estimated EOSB Entitlement',
      rule:'Rule Applied',
      empty:'No stored EOSB records are available for preview.',
      waiting:'Choose a stored record and separation reason, then calculate.',
      standardRule:'Full Article 84 base award (100%).',
      resignation0:'Article 85 resignation: service below 2 years → no EOSB award.',
      resignationThird:'Article 85 resignation: 2 to 5 years inclusive → one-third of base award.',
      resignationTwoThirds:'Article 85 resignation: more than 5 and less than 10 years → two-thirds of base award.',
      resignationFull:'Article 85 resignation: 10 years or more → full base award.',
      article87Rule:'Article 87 exception selected → full base award; HR must verify that the statutory exception and supporting evidence apply.',
      article80Rule:'Article 80 selected → no EOSB award; use only after HR/legal verification that an Article 80 ground and required procedure apply.',
      note:'Operational preview only. Article 86 wage-component agreements, contract terms, service dates, evidence, and any other applicable legal provisions still require HR/legal verification before final settlement.'
    },
    ar:{
      title:'معاينة استحقاق مكافأة نهاية الخدمة السعودية — الخطوة 9D.5A',
      badge:'معاينة فقط · بدون كتابة في قاعدة البيانات',
      body:'اختر سجلاً محفوظاً للمكافأة الأساسية وسبب انتهاء العلاقة بعد التحقق منه. تطبق هذه المعاينة أساس مكافأة نهاية الخدمة وقاعدة الاستحقاق المختارة دون تغيير أي سجل محفوظ.',
      record:'سجل المكافأة الأساسية',
      reason:'سبب انتهاء العلاقة / القاعدة',
      chooseRecord:'اختر سجل مكافأة نهاية خدمة محفوظاً…',
      chooseReason:'اختر سبب انتهاء العلاقة بعد التحقق…',
      standard:'المادة 84 — انتهاء عادي لعلاقة العمل / المكافأة الأساسية كاملة',
      resignation:'المادة 85 — استقالة العامل',
      article87:'المادة 87 — استثناء يستحق المكافأة كاملة (مع التحقق من المستندات)',
      article80:'المادة 80 — فسخ دون مكافأة (مع التحقق النظامي)',
      employee:'الموظف',
      service:'مدة الخدمة',
      wage:'الأجر الأخير',
      calculate:'حساب الاستحقاق — بدون حفظ',
      base:'المكافأة الأساسية حسب المادة 84',
      rate:'نسبة الاستحقاق',
      result:'الاستحقاق التقديري لمكافأة نهاية الخدمة',
      rule:'القاعدة المطبقة',
      empty:'لا توجد سجلات مكافأة نهاية خدمة محفوظة للمعاينة.',
      waiting:'اختر السجل وسبب انتهاء العلاقة ثم اضغط حساب الاستحقاق.',
      standardRule:'المكافأة الأساسية حسب المادة 84 كاملة (100%).',
      resignation0:'المادة 85 — الاستقالة: خدمة أقل من سنتين ← لا تستحق مكافأة نهاية خدمة.',
      resignationThird:'المادة 85 — الاستقالة: من سنتين إلى خمس سنوات شاملة ← ثلث المكافأة الأساسية.',
      resignationTwoThirds:'المادة 85 — الاستقالة: أكثر من خمس وأقل من عشر سنوات ← ثلثا المكافأة الأساسية.',
      resignationFull:'المادة 85 — الاستقالة: عشر سنوات فأكثر ← المكافأة الأساسية كاملة.',
      article87Rule:'تم اختيار استثناء المادة 87 ← المكافأة الأساسية كاملة؛ يجب على الموارد البشرية التحقق من انطباق الاستثناء النظامي والمستندات المؤيدة.',
      article80Rule:'تم اختيار المادة 80 ← لا مكافأة نهاية خدمة؛ يستخدم فقط بعد تحقق الموارد البشرية/المختص النظامي من سبب المادة 80 واستيفاء الإجراء المطلوب.',
      note:'هذه معاينة تشغيلية فقط. يجب قبل التسوية النهائية التحقق من عناصر الأجر واتفاقات المادة 86 وشروط العقد وتواريخ الخدمة والمستندات وأي أحكام نظامية أخرى منطبقة.'
    }
  };

  const style=document.createElement('style');
  style.textContent=`
    #fc-eosb-entitlement-9d5{margin:0 0 18px;border:1px solid #dce3eb;border-inline-start:4px solid #b42318;border-radius:12px;background:#fff;overflow:hidden}
    #fc-eosb-entitlement-9d5 .fc-9d5-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid #edf0f4;color:#0b3158;font-weight:800}
    #fc-eosb-entitlement-9d5 .fc-9d5-badge{font-size:11px;font-weight:700;padding:4px 9px;border-radius:999px;background:#fff1f0;color:#9b1c14;white-space:nowrap}
    #fc-eosb-entitlement-9d5 .fc-9d5-body{padding:11px 16px 4px;color:#516175;font-size:13px;line-height:1.6}
    #fc-eosb-entitlement-9d5 .fc-9d5-grid{display:grid;grid-template-columns:1.3fr 1.7fr;gap:12px;padding:12px 16px}
    #fc-eosb-entitlement-9d5 label{display:block;font-size:12px;font-weight:800;margin-bottom:6px;color:#17324d}
    #fc-eosb-entitlement-9d5 select{width:100%;padding:10px 11px;border:1px solid #c9d2dd;border-radius:8px;background:#fff;color:#122033}
    #fc-eosb-entitlement-9d5 .fc-9d5-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 16px 12px}
    #fc-eosb-entitlement-9d5 .fc-9d5-meta div,#fc-eosb-entitlement-9d5 .fc-9d5-card{border:1px solid #dce3eb;border-radius:9px;padding:10px 12px;background:#f8fafc}
    #fc-eosb-entitlement-9d5 .fc-9d5-meta small,#fc-eosb-entitlement-9d5 .fc-9d5-card small{display:block;color:#637083;font-size:11px;margin-bottom:4px}
    #fc-eosb-entitlement-9d5 .fc-9d5-meta b,#fc-eosb-entitlement-9d5 .fc-9d5-card b{color:#0b3158}
    #fc-eosb-entitlement-9d5 .fc-9d5-action{padding:0 16px 12px}
    #fc-eosb-entitlement-9d5 .fc-9d5-action button{background:#ed1c24;font-weight:800}
    #fc-eosb-entitlement-9d5 .fc-9d5-result{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 16px 12px}
    #fc-eosb-entitlement-9d5 .fc-9d5-rule{margin:0 16px 12px;padding:11px 12px;border:1px solid #dce3eb;border-radius:9px;background:#fff;color:#34465b;font-size:12px;line-height:1.55}
    #fc-eosb-entitlement-9d5 .fc-9d5-note{margin:0 16px 15px;color:#637083;font-size:11px;line-height:1.55}
    @media(max-width:760px){#fc-eosb-entitlement-9d5 .fc-9d5-grid,#fc-eosb-entitlement-9d5 .fc-9d5-meta,#fc-eosb-entitlement-9d5 .fc-9d5-result{grid-template-columns:1fr}#fc-eosb-entitlement-9d5 .fc-9d5-head{align-items:flex-start;flex-direction:column}#fc-eosb-entitlement-9d5 .fc-9d5-badge{white-space:normal}}
  `;
  document.head.appendChild(style);

  function isArabic(){return document.body.classList.contains('fc-lang-ar')||document.documentElement.lang==='ar'||document.documentElement.dir==='rtl';}
  function activePage(){const b=document.querySelector('#nav button.active');return b&&b.id?b.id.replace(/^nav-/,''):'';}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function n(v){const x=Number(v);return Number.isFinite(x)?x:0;}
  function money(v){return `SAR ${n(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;}
  function records(){try{return Array.isArray(state&&state.eosb)?state.eosb:[];}catch(_){return [];}}
  function baseAward(years,wage){const y=Math.max(0,n(years)),w=Math.max(0,n(wage));return Math.min(y,5)*0.5*w+Math.max(y-5,0)*w;}
  function entitlement(years,wage,reason,c){
    const y=Math.max(0,n(years));
    const base=baseAward(y,wage);
    let rate=1,rule=c.standardRule;
    if(reason==='resignation'){
      if(y<2){rate=0;rule=c.resignation0;}
      else if(y<=5){rate=1/3;rule=c.resignationThird;}
      else if(y<10){rate=2/3;rule=c.resignationTwoThirds;}
      else{rate=1;rule=c.resignationFull;}
    }else if(reason==='article87'){rate=1;rule=c.article87Rule;}
    else if(reason==='article80'){rate=0;rule=c.article80Rule;}
    return {base,rate,amount:base*rate,rule};
  }

  function build(root,c,lang){
    const rows=records();
    let panel=document.getElementById('fc-eosb-entitlement-9d5');
    if(!panel){
      panel=document.createElement('div');panel.id='fc-eosb-entitlement-9d5';
      const anchor=document.getElementById('fc-saudi-eosb-note-9d4');
      if(anchor&&anchor.parentNode===root)anchor.insertAdjacentElement('afterend',panel);else root.insertBefore(panel,root.firstChild);
    }
    const sig=lang+'|'+rows.map((r,i)=>[i,r.id,r.employee_id,r.service_years,r.last_salary,r.benefit].join(':')).join('|');
    if(panel.dataset.sig===sig)return panel;
    panel.dataset.sig=sig;
    const opts=rows.map((r,i)=>`<option value="${i}">${esc(r.employee_id)} · ${n(r.service_years).toFixed(2)} ${lang==='ar'?'سنة':'years'} · ${money(r.last_salary)}</option>`).join('');
    panel.innerHTML=`
      <div class="fc-9d5-head"><span>${esc(c.title)}</span><span class="fc-9d5-badge">${esc(c.badge)}</span></div>
      <div class="fc-9d5-body">${esc(c.body)}</div>
      ${rows.length?`<div class="fc-9d5-grid">
        <div><label>${esc(c.record)}</label><select id="fc-eosb-9d5-record"><option value="">${esc(c.chooseRecord)}</option>${opts}</select></div>
        <div><label>${esc(c.reason)}</label><select id="fc-eosb-9d5-reason"><option value="">${esc(c.chooseReason)}</option><option value="standard">${esc(c.standard)}</option><option value="resignation">${esc(c.resignation)}</option><option value="article87">${esc(c.article87)}</option><option value="article80">${esc(c.article80)}</option></select></div>
      </div>
      <div class="fc-9d5-meta"><div><small>${esc(c.employee)}</small><b id="fc-eosb-9d5-employee">—</b></div><div><small>${esc(c.service)}</small><b id="fc-eosb-9d5-service">—</b></div><div><small>${esc(c.wage)}</small><b id="fc-eosb-9d5-wage">—</b></div></div>
      <div class="fc-9d5-action"><button type="button" id="fc-eosb-9d5-calc">${esc(c.calculate)}</button></div>
      <div class="fc-9d5-result"><div class="fc-9d5-card"><small>${esc(c.base)}</small><b id="fc-eosb-9d5-base">—</b></div><div class="fc-9d5-card"><small>${esc(c.rate)}</small><b id="fc-eosb-9d5-rate">—</b></div><div class="fc-9d5-card"><small>${esc(c.result)}</small><b id="fc-eosb-9d5-result">—</b></div></div>
      <div class="fc-9d5-rule"><b>${esc(c.rule)}:</b> <span id="fc-eosb-9d5-rule">${esc(c.waiting)}</span></div>`:`<div class="fc-9d5-rule">${esc(c.empty)}</div>`}
      <div class="fc-9d5-note">${esc(c.note)}</div>`;

    if(rows.length){
      const rec=panel.querySelector('#fc-eosb-9d5-record');
      const reason=panel.querySelector('#fc-eosb-9d5-reason');
      const sync=()=>{
        const r=rows[Number(rec.value)];
        panel.querySelector('#fc-eosb-9d5-employee').textContent=r?String(r.employee_id||'—'):'—';
        panel.querySelector('#fc-eosb-9d5-service').textContent=r?`${n(r.service_years).toFixed(2)} ${lang==='ar'?'سنة':'years'}`:'—';
        panel.querySelector('#fc-eosb-9d5-wage').textContent=r?money(r.last_salary):'—';
        ['base','rate','result'].forEach(id=>{const el=panel.querySelector('#fc-eosb-9d5-'+id);if(el)el.textContent='—';});
        const rule=panel.querySelector('#fc-eosb-9d5-rule');if(rule)rule.textContent=c.waiting;
      };
      rec.addEventListener('change',sync);
      panel.querySelector('#fc-eosb-9d5-calc').addEventListener('click',()=>{
        const r=rows[Number(rec.value)];
        if(!r||!reason.value){const rule=panel.querySelector('#fc-eosb-9d5-rule');if(rule)rule.textContent=c.waiting;return;}
        const out=entitlement(r.service_years,r.last_salary,reason.value,c);
        panel.querySelector('#fc-eosb-9d5-base').textContent=money(out.base);
        panel.querySelector('#fc-eosb-9d5-rate').textContent=`${(out.rate*100).toFixed(out.rate===1||out.rate===0?0:2)}%`;
        panel.querySelector('#fc-eosb-9d5-result').textContent=money(out.amount);
        panel.querySelector('#fc-eosb-9d5-rule').textContent=out.rule;
      });
    }
    return panel;
  }

  let scheduled=false;
  function apply(){
    scheduled=false;
    if(activePage()!=='eosb'){document.getElementById('fc-eosb-entitlement-9d5')?.remove();return;}
    const root=document.getElementById('content');if(!root)return;
    const lang=isArabic()?'ar':'en';
    build(root,copy[lang],lang);
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','lang','dir']});
  document.addEventListener('click',schedule,true);
  window.addEventListener('load',schedule);
  schedule();
})();