(function(){
  'use strict';
  if(window.__fcSaudiHrTerminology9D1)return;
  window.__fcSaudiHrTerminology9D1=true;

  const allowed=new Set(['attendance','leave','payroll','eosb','reports']);
  const copy={
    attendance:{
      en:{title:'Saudi HR wording — Attendance & Departure Record',body:'Operational attendance and departure record in Saudi/Riyadh time. Administrative corrections should remain traceable in the audit history.'},
      ar:{title:'صياغة الموارد البشرية السعودية — سجل الحضور والانصراف',body:'سجل تشغيلي للحضور والانصراف بتوقيت السعودية/الرياض. يجب أن تبقى التصحيحات الإدارية قابلة للتتبع في سجل التدقيق.'}
    },
    leave:{
      en:{title:'Saudi HR wording — Leave Entitlements',body:'Leave administration should follow the applicable Saudi Labor Law, the employment contract and approved company policy. Annual leave is not less than 21 days per year and increases to not less than 30 days after five consecutive years with the same employer.'},
      ar:{title:'صياغة الموارد البشرية السعودية — استحقاقات الإجازات',body:'تُدار الإجازات وفق نظام العمل السعودي الساري وعقد العمل وسياسة الشركة المعتمدة. الإجازة السنوية لا تقل عن 21 يوماً في السنة، وتصبح لا تقل عن 30 يوماً بعد خمس سنوات متصلة لدى صاحب العمل نفسه.'}
    },
    payroll:{
      en:{title:'Saudi HR wording — Wage / Payroll Record',body:'Payroll amounts shown in this HRMS are operational records in Saudi riyals (SAR). Final wage settlement should be reviewed against the employment contract, approved payroll inputs and applicable Saudi requirements.'},
      ar:{title:'صياغة الموارد البشرية السعودية — سجل الأجور / الرواتب',body:'مبالغ الرواتب المعروضة في النظام سجلات تشغيلية بالريال السعودي (SAR). يجب مراجعة التسوية النهائية للأجور وفق عقد العمل ومدخلات الرواتب المعتمدة والمتطلبات السعودية السارية.'}
    },
    eosb:{
      en:{title:'Saudi HR wording — End-of-Service Award (EOSB)',body:'HRMS estimate only. The final end-of-service award can depend on the termination reason, service period, last wage and applicable wage elements. Verify the entitlement before final settlement.'},
      ar:{title:'صياغة الموارد البشرية السعودية — مكافأة نهاية الخدمة',body:'تقدير تشغيلي من النظام فقط. قد تعتمد المكافأة النهائية على سبب انتهاء العلاقة ومدة الخدمة والأجر الأخير وعناصر الأجر المعتمدة. يجب مراجعة الاستحقاق قبل التسوية النهائية.'}
    },
    reports:{
      en:{title:'Saudi HR wording — Operational HRMS Reports',body:'Reports are internal operational HRMS records for review and audit support. They are not an official Ministry/Qiwa filing and are not a legal certification.'},
      ar:{title:'صياغة الموارد البشرية السعودية — تقارير نظام الموارد البشرية',body:'التقارير سجلات تشغيلية داخلية للمراجعة ودعم التدقيق. لا تُعد إيداعاً رسمياً لدى الوزارة/قوى ولا شهادة قانونية.'}
    }
  };

  const style=document.createElement('style');
  style.textContent=`
    #fc-saudi-hr-note-9d1{margin:0 0 18px;border:1px solid #dce3eb;border-inline-start:4px solid #0b3158;border-radius:12px;background:#fff;overflow:hidden}
    #fc-saudi-hr-note-9d1 .fc-9d1-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #edf0f4;font-weight:800;color:#0b3158}
    #fc-saudi-hr-note-9d1 .fc-9d1-badge{font-size:11px;font-weight:700;border-radius:999px;padding:4px 9px;background:#eef4fa;color:#0b3158;white-space:nowrap}
    #fc-saudi-hr-note-9d1 .fc-9d1-body{padding:12px 16px;line-height:1.55;color:#516175;font-size:13px}
    body.fc-lang-ar #fc-saudi-hr-note-9d1{border-inline-start-color:#ed1c24}
    body.fc-lang-ar #fc-saudi-hr-note-9d1 .fc-9d1-head{color:#0b3158}
    @media(max-width:600px){#fc-saudi-hr-note-9d1 .fc-9d1-head{align-items:flex-start;flex-direction:column}#fc-saudi-hr-note-9d1 .fc-9d1-badge{white-space:normal}}
  `;
  document.head.appendChild(style);

  function isArabic(){return document.body.classList.contains('fc-lang-ar')||document.documentElement.lang==='ar';}
  function activePage(){
    const b=document.querySelector('#nav button.active');
    return b&&b.id?b.id.replace(/^nav-/,''):'';
  }
  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function syncMonthLanguage(root,ar){
    root.querySelectorAll('input[type="month"]').forEach(input=>{
      const select=input.nextElementSibling;
      if(!select||!select.classList.contains('fc-ar-month-select'))return;
      if(ar){
        input.style.display='none';
        select.style.display='inline-block';
        if(select.value!==input.value)select.value=input.value;
      }else{
        select.style.display='none';
        input.style.display=input.dataset.fcPolishMonthDisplay||'inline-block';
      }
    });
  }
  function arabicMonthLabel(value){
    const m=String(value||'').match(/^(\d{4})-(\d{2})$/);
    if(!m)return value||'';
    const names=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    return `${names[Number(m[2])-1]||m[2]} ${m[1]}`;
  }
  function englishMonthLabel(value){
    const m=String(value||'').match(/^(\d{4})-(\d{2})$/);
    if(!m)return value||'';
    return new Intl.DateTimeFormat('en',{timeZone:'Asia/Riyadh',month:'long',year:'numeric'}).format(new Date(Date.UTC(Number(m[1]),Number(m[2])-1,1,12)));
  }
  function attendanceTerminology(root,ar){
    const monthText=root.querySelector('#fcStep6MonthText');
    const monthInput=root.querySelector('#fcStep6MonthPicker');
    if(monthText&&monthInput){
      if(ar){
        const label=arabicMonthLabel(monthInput.value);
        monthText.textContent=`عرض ${label}. السجلات القديمة محفوظة؛ اختر شهراً آخر لعرض السجل. تبقى عناصر تسجيل الحضور/الاستراحة/الانصراف لليوم مباشرة؛ ويتبع جدول السجل أدناه الشهر المحدد.`;
      }else{
        const label=englishMonthLabel(monthInput.value);
        monthText.textContent=`Showing ${label}. Old records are kept; choose another month to view history. Today’s check-in/break/check-out controls stay live; the history table below follows the selected month.`;
      }
    }

    const box=root.querySelector('#fcAttendanceCorrection8A');
    if(!box)return;
    const head=box.querySelector('.section-head');
    if(head){
      const title=head.querySelector('b');
      const badge=head.querySelector('.badge');
      if(title)title.textContent=ar?'🛠 تصحيح الحضور + سجل التدقيق — الخطوة 8B':'🛠 Attendance Correction + Audit Trail — Step 8B';
      if(badge)badge.textContent=ar?'المعاينة أولاً · حفظ المسؤول':'Preview first · Admin save';
    }
    const intro=box.querySelector(':scope > div:nth-child(2) > .muted');
    if(intro){
      intro.innerHTML=ar
        ?'اختر سجل حضور، وأدخل القيم المصححة وسبب التصحيح، ثم اضغط <b>معاينة</b>. يظهر زر الحفظ الفعلي فقط بعد معاينة صحيحة. عند الحفظ تتم إعادة حساب بيانات الحضور وإنشاء سجل تدقيق دائم <b>ADMIN_CORRECTION</b>.'
        :'Select an attendance record, enter corrected values and a reason, then <b>Preview</b>. The real Save button appears only after a valid preview. Saving recalculates attendance and creates a permanent <b>ADMIN_CORRECTION</b> audit entry.';
    }
  }
  function eosbTerminology(root,ar){
    const head=root.querySelector('.section-head b');
    if(head){
      const t=head.textContent.trim();
      if(/End of Service Benefit|End-of-Service Award|مكافأة نهاية الخدمة/.test(t))head.textContent=ar?'مكافأة نهاية الخدمة':'End-of-Service Award (EOSB)';
      if(/Calculate EOSB|Calculate End-of-Service Award|حساب مكافأة نهاية الخدمة/.test(t))head.textContent=ar?'حساب مكافأة نهاية الخدمة':'Calculate End-of-Service Award';
    }
    root.querySelectorAll('th').forEach(th=>{
      const t=th.textContent.trim();
      if(t==='Last Salary'||t==='Last salary'||t==='الراتب الأخير'||t==='الأجر الأخير')th.textContent=ar?'الأجر الأخير':'Last Wage';
      if(t==='Benefit'||t==='Award'||t==='المكافأة')th.textContent=ar?'المكافأة':'Award';
    });
    root.querySelectorAll('.field label').forEach(label=>{
      const t=label.textContent.trim();
      if(t==='Last Salary'||t==='Last salary'||t==='الراتب الأخير'||t==='الأجر الأخير المعتمد للحساب')label.textContent=ar?'الأجر الأخير المعتمد للحساب':'Last Wage Used for Award';
    });
    root.querySelectorAll('button').forEach(btn=>{
      const t=btn.textContent.trim();
      if(t==='+ Calculate EOSB'||t==='+ Calculate End-of-Service Award'||t==='+ حساب مكافأة نهاية الخدمة')btn.textContent=ar?'+ حساب مكافأة نهاية الخدمة':'+ Calculate End-of-Service Award';
      if(t==='Calculate & Save'||t==='حساب وحفظ')btn.textContent=ar?'حساب وحفظ':'Calculate & Save';
    });
  }

  let scheduled=false;
  function apply(){
    scheduled=false;
    const root=document.getElementById('content');
    if(!root)return;
    const ar=isArabic();
    syncMonthLanguage(root,ar);
    const page=activePage();
    let note=document.getElementById('fc-saudi-hr-note-9d1');
    if(!allowed.has(page)){
      if(note)note.remove();
      return;
    }
    const c=copy[page][ar?'ar':'en'];
    if(!note){
      note=document.createElement('div');
      note.id='fc-saudi-hr-note-9d1';
      root.insertBefore(note,root.firstChild);
    }else if(note.parentElement!==root){
      root.insertBefore(note,root.firstChild);
    }
    const html=`<div class="fc-9d1-head"><span>${esc(c.title)}</span><span class="fc-9d1-badge">${ar?'الخطوة 9D.1 · إرشاد تشغيلي':'Step 9D.1 · operational guidance'}</span></div><div class="fc-9d1-body">${esc(c.body)}</div>`;
    if(note.innerHTML!==html)note.innerHTML=html;
    if(page==='attendance')attendanceTerminology(root,ar);
    if(page==='eosb')eosbTerminology(root,ar);
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','lang','dir']});
  document.addEventListener('click',schedule,true);
  window.addEventListener('load',schedule);
  schedule();
})();
