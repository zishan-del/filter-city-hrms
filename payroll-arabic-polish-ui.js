(function(){
  'use strict';
  if(window.__fcPayrollArabicPolish9C3)return;
  window.__fcPayrollArabicPolish9C3=true;

  const monthsEn=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthsAr=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  function arabic(){
    return document.documentElement.dir==='rtl'||document.documentElement.lang==='ar';
  }
  function selectedMonth(){
    return document.getElementById('fcStep6MonthPicker')?.value||sessionStorage.getItem('fc_step6_month_payroll')||'';
  }
  function monthParts(value){
    const m=String(value||'').match(/^(\d{4})-(\d{2})$/);
    if(!m)return null;
    return {year:m[1],month:Number(m[2])};
  }
  function monthLabel(value,lang){
    const p=monthParts(value);
    if(!p||p.month<1||p.month>12)return value||'';
    return (lang==='ar'?monthsAr[p.month-1]:monthsEn[p.month-1])+' '+p.year;
  }

  function polishMonthToolbar(isAr){
    const note=document.getElementById('fcStep6MonthText');
    if(!note)return;
    const month=selectedMonth();
    const label=monthLabel(month,isAr?'ar':'en');
    if(!label)return;
    const next=isAr
      ? 'عرض '+label+'. يتم الاحتفاظ بالسجلات القديمة؛ اختر شهراً آخر لعرض السجل.'
      : 'Showing '+label+'. Old records are kept; choose another month to view history.';
    if(note.textContent!==next)note.textContent=next;
  }

  function payrollNoteElements(){
    const panel=document.getElementById('fcPayrollPaymentPanel');
    if(!panel)return [];
    return [...panel.querySelectorAll('.muted')].filter(el=>{
      const t=(el.textContent||'').trim();
      return t.includes('Payment status is saved in the cloud')||t.includes('يتم حفظ حالة الدفع في السحابة')||t.startsWith('Basic SAR')||t.startsWith('الأساسي SAR');
    });
  }

  function polishPaymentNote(el,isAr){
    const text=(el.textContent||'').trim();
    if(!el.dataset.fcPayrollEnglishNote && /Payment status is saved in the cloud/.test(text)){
      el.dataset.fcPayrollEnglishNote=text;
    }
    if(isAr){
      const source=el.dataset.fcPayrollEnglishNote||text;
      const m=source.match(/^Basic\s+(.+?)\s+·\s+Allowances\s+(.+?)\s+·\s+Deductions\s+(.+?)\.\s+Payment status is saved in the cloud\.\s+[“\"]Print \/ Save PDF[”\"] opens the browser print dialog; choose Save as PDF when needed\.$/);
      if(m){
        const next='الأساسي '+m[1]+' · البدلات '+m[2]+' · الاستقطاعات '+m[3]+'. يتم حفظ حالة الدفع في السحابة. يفتح زر «طباعة / حفظ PDF» نافذة الطباعة في المتصفح؛ اختر «حفظ كملف PDF» عند الحاجة.';
        if(el.textContent!==next)el.textContent=next;
      }
    }else if(el.dataset.fcPayrollEnglishNote){
      if(el.textContent!==el.dataset.fcPayrollEnglishNote)el.textContent=el.dataset.fcPayrollEnglishNote;
    }
  }

  function polishEmptyRows(isAr){
    const panel=document.getElementById('fcPayrollPaymentPanel');
    if(!panel)return;
    panel.querySelectorAll('.empty').forEach(el=>{
      const text=(el.textContent||'').trim();
      if(isAr){
        const m=text.match(/^No payroll records for (.+)\.$/);
        if(m){
          el.dataset.fcPayrollEmptyEn=text;
          let label=m[1];
          monthsEn.forEach((en,i)=>{label=label.replace(en,monthsAr[i]);});
          el.textContent='لا توجد سجلات رواتب لشهر '+label+'.';
        }
      }else if(el.dataset.fcPayrollEmptyEn){
        el.textContent=el.dataset.fcPayrollEmptyEn;
        delete el.dataset.fcPayrollEmptyEn;
      }
    });
  }

  function apply(){
    const isAr=arabic();
    polishMonthToolbar(isAr);
    payrollNoteElements().forEach(el=>polishPaymentNote(el,isAr));
    polishEmptyRows(isAr);
  }

  let pending=false;
  function schedule(){
    if(pending)return;
    pending=true;
    setTimeout(()=>{pending=false;apply();},0);
  }

  const content=document.getElementById('content');
  if(content)new MutationObserver(schedule).observe(content,{childList:true,subtree:true,characterData:true});
  new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['dir','lang']});
  document.addEventListener('input',e=>{if(e.target&&e.target.id==='fcStep6MonthPicker')schedule();});
  document.addEventListener('change',e=>{if(e.target&&e.target.id==='fcStep6MonthPicker')schedule();});

  const previousRender=window.render;
  if(typeof previousRender==='function')window.render=function(page){
    const result=previousRender(page);
    if(page==='Payroll'){
      setTimeout(apply,0);
      setTimeout(apply,120);
      setTimeout(apply,500);
    }
    return result;
  };

  setTimeout(apply,0);
  setTimeout(apply,300);
})();
