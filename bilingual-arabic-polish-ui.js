(function(){
  'use strict';
  if(window.__fcArabicPolishStep9C3)return;
  window.__fcArabicPolishStep9C3=true;

  const months={January:'يناير',February:'فبراير',March:'مارس',April:'أبريل',May:'مايو',June:'يونيو',July:'يوليو',August:'أغسطس',September:'سبتمبر',October:'أكتوبر',November:'نوفمبر',December:'ديسمبر'};
  const monthNumbers={'01':'يناير','02':'فبراير','03':'مارس','04':'أبريل','05':'مايو','06':'يونيو','07':'يوليو','08':'أغسطس','09':'سبتمبر','10':'أكتوبر','11':'نوفمبر','12':'ديسمبر'};
  const exact={
    'Attendance Correction + Audit Trail — Step 8B':'تصحيح الحضور + سجل التدقيق — الخطوة 8B',
    '🛠 Attendance Correction + Audit Trail — Step 8B':'🛠 تصحيح الحضور + سجل التدقيق — الخطوة 8B',
    'Preview first · Admin save':'معاينة أولاً · حفظ بواسطة المسؤول',
    'Select an attendance record, enter corrected values and a reason, then Preview. The real Save button appears only after a valid preview. Saving recalculates attendance and creates a permanent ADMIN_CORRECTION audit entry.':'اختر سجل حضور، وأدخل القيم المصححة وسبب التصحيح، ثم اضغط معاينة. يظهر زر الحفظ الفعلي فقط بعد معاينة صحيحة. عند الحفظ يعاد حساب الحضور ويتم إنشاء سجل تدقيق دائم ADMIN_CORRECTION.',
    'Check-in Longitude':'خط طول تسجيل الحضور',
    'Check-in Latitude':'خط عرض تسجيل الحضور',
    'Check-in Accuracy (m)':'دقة موقع تسجيل الحضور (م)',
    'Checkout Longitude':'خط طول تسجيل الانصراف',
    'Checkout Latitude':'خط عرض تسجيل الانصراف',
    'Checkout Accuracy (m)':'دقة موقع تسجيل الانصراف (م)',
    'Shows permanent ADMIN_CORRECTION events with old → new values, reason, Admin identity and correction time. Report only; no attendance or audit data is changed.':'يعرض أحداث ADMIN_CORRECTION الدائمة مع القيم القديمة ← الجديدة، وسبب التصحيح، وهوية المسؤول، ووقت التصحيح. التقرير للعرض فقط ولا يغيّر بيانات الحضور أو سجل التدقيق.',
    'Monthly inspection-ready attendance statement with schedule history, true absence, late/early/overtime, break overage, night work, leave/holiday/off-day counts, GPS, and correction counts. No attendance data is changed.':'كشف حضور شهري جاهز للمراجعة يشمل سجل جداول العمل، والغياب الفعلي، والتأخير، والانصراف المبكر، والعمل الإضافي، وتجاوز الاستراحة، والعمل الليلي، وعدد أيام الإجازات والعطلات والراحة، وبيانات GPS، وعدد التصحيحات. لا يتم تغيير أي بيانات حضور.',
    'Effective-date schedule history':'سجل جداول العمل حسب تاريخ السريان',
    'No effective schedule — recorded rows only':'لا يوجد جدول سارٍ — السجلات المسجلة فقط',
    'ID':'الرقم',
    'SUPPLY':'التوريد',
    'DRIVER':'سائق',
    'PURCHASER':'مسؤول مشتريات',
    'SALES':'المبيعات',
    'Preview Correction — No Save':'معاينة التصحيح — بدون حفظ',
    'Save Correction to Cloud':'حفظ التصحيح في السحابة',
    'Attendance Record':'سجل الحضور',
    'Correction Reason':'سبب التصحيح',
    'Correction Reason *':'سبب التصحيح *',
    'Check In':'تسجيل الحضور',
    'Check Out':'تسجيل الانصراف',
    'Break Start':'بداية الاستراحة',
    'Break End':'نهاية الاستراحة',
    'Employee':'الموظف',
    'Month':'الشهر',
    'View Audit Report':'عرض تقرير التدقيق',
    'View Inspection Report':'عرض تقرير الفحص',
    'Export CSV':'تصدير CSV',
    'Print / Save PDF':'طباعة / حفظ PDF'
  };

  const nodeState=new WeakMap();

  function arabicMonth(text){
    let out=String(text||'');
    Object.entries(months).forEach(([en,ar])=>{out=out.replace(new RegExp('\\b'+en+'\\b','g'),ar);});
    return out;
  }

  function hourWord(n){
    n=Number(n||0);
    if(n===1)return 'ساعة';
    if(n===2)return 'ساعتان';
    if(n>=3&&n<=10)return 'ساعات';
    return 'ساعة';
  }
  function minuteWord(n){
    n=Number(n||0);
    if(n===1)return 'دقيقة';
    if(n===2)return 'دقيقتان';
    if(n>=3&&n<=10)return 'دقائق';
    return 'دقيقة';
  }
  function arabicDuration(hours,minutes){
    const h=Number(hours||0),m=Number(minutes||0);
    return h+' '+hourWord(h)+' '+m+' '+minuteWord(m);
  }
  function arabicMonthValue(value){
    const m=String(value||'').match(/^(\d{4})-(\d{2})$/);
    if(!m)return value||'';
    return (monthNumbers[m[2]]||m[2])+' '+m[1];
  }

  function toArabic(raw){
    if(exact[raw])return exact[raw];
    let m=raw.match(/^Showing (.+)\. Old records are kept; choose another month to view history\. Today’s check-in\/break\/check-out controls stay live; the history table below follows the selected month\.$/);
    if(m)return 'عرض '+arabicMonth(m[1])+'. يتم الاحتفاظ بالسجلات القديمة؛ اختر شهراً آخر لعرض السجل. تظل أدوات تسجيل الحضور والاستراحة والانصراف لليوم فعالة، بينما يتبع جدول السجل أدناه الشهر المحدد.';
    m=raw.match(/^Showing (.+)\. Old records are kept; choose another month to view history\.$/);
    if(m)return 'عرض '+arabicMonth(m[1])+'. يتم الاحتفاظ بالسجلات القديمة؛ اختر شهراً آخر لعرض السجل.';
    m=raw.match(/^(\d+)h\s+(\d+)m$/);
    if(m)return arabicDuration(m[1],m[2]);
    if(raw.startsWith('Attendance Correction + Audit Trail —'))return raw.replace('Attendance Correction + Audit Trail','تصحيح الحضور + سجل التدقيق').replace('Step','الخطوة');
    if(raw.startsWith('Monthly inspection-ready attendance statement'))return exact['Monthly inspection-ready attendance statement with schedule history, true absence, late/early/overtime, break overage, night work, leave/holiday/off-day counts, GPS, and correction counts. No attendance data is changed.'];
    if(raw.startsWith('Shows permanent ADMIN_CORRECTION events'))return exact['Shows permanent ADMIN_CORRECTION events with old → new values, reason, Admin identity and correction time. Report only; no attendance or audit data is changed.'];
    return null;
  }

  function replaceTrimmed(node,value){
    const current=node.nodeValue||'';
    const lead=(current.match(/^\s*/)||[''])[0];
    const trail=(current.match(/\s*$/)||[''])[0];
    const next=lead+value+trail;
    if(next!==current)node.nodeValue=next;
  }

  function walk(root,arabic){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(n=>{
      const current=(n.nodeValue||'').trim();
      if(!current)return;
      const meta=nodeState.get(n);
      if(arabic){
        let source=current;
        if(meta&&current===meta.ar)source=meta.en;
        else if(meta&&current===meta.en)source=meta.en;
        else if(meta)nodeState.delete(n);
        const translated=toArabic(source);
        if(translated&&translated!==source){
          nodeState.set(n,{en:source,ar:translated});
          replaceTrimmed(n,translated);
        }
      }else if(meta){
        if(current===meta.ar)replaceTrimmed(n,meta.en);
        nodeState.delete(n);
      }
    });
  }

  function buildArabicMonthSelect(input){
    let select=input.nextElementSibling;
    if(!select||!select.classList.contains('fc-ar-month-select')){
      select=document.createElement('select');
      select.className='fc-ar-month-select';
      select.setAttribute('aria-label','الشهر');
      select.style.cssText='padding:9px 34px 9px 12px;border:1px solid #cfd9e5;border-radius:8px;background:#fff;min-width:190px;font:inherit;';
      const currentYear=new Date().getFullYear();
      for(let year=currentYear-10;year<=currentYear+5;year++){
        for(let month=1;month<=12;month++){
          const mm=String(month).padStart(2,'0');
          const option=document.createElement('option');
          option.value=year+'-'+mm;
          option.textContent=monthNumbers[mm]+' '+year;
          select.appendChild(option);
        }
      }
      select.addEventListener('change',()=>{
        input.value=select.value;
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.dispatchEvent(new Event('change',{bubbles:true}));
      });
      input.insertAdjacentElement('afterend',select);
    }
    return select;
  }

  function polishMonthInputs(arabic){
    document.querySelectorAll('#content input[type="month"]').forEach(input=>{
      const select=buildArabicMonthSelect(input);
      if(arabic){
        select.value=input.value;
        if(!select.value&&input.value){
          const option=document.createElement('option');
          option.value=input.value;
          option.textContent=arabicMonthValue(input.value);
          select.appendChild(option);
          select.value=input.value;
        }
        if(input.dataset.fcPolishMonthDisplay===undefined)input.dataset.fcPolishMonthDisplay=input.style.display||'';
        input.style.display='none';
        select.style.display='inline-block';
      }else{
        input.style.display=input.dataset.fcPolishMonthDisplay||'';
        select.style.display='none';
      }
    });
  }

  function monthlyReportPolish(arabic){
    const result=document.getElementById('fc_r5_result');
    if(!result)return;

    result.querySelectorAll('.badge').forEach(el=>{
      const text=(el.textContent||'').trim();
      if(arabic){
        if(text==='Effective-date schedule history')el.textContent='سجل جداول العمل حسب تاريخ السريان';
        else if(text==='No effective schedule — recorded rows only')el.textContent='لا يوجد جدول سارٍ — السجلات المسجلة فقط';
      }else{
        if(text==='سجل جداول العمل حسب تاريخ السريان')el.textContent='Effective-date schedule history';
        else if(text==='لا يوجد جدول سارٍ — السجلات المسجلة فقط')el.textContent='No effective schedule — recorded rows only';
      }
    });

    result.querySelectorAll('.stat').forEach(el=>{
      const text=(el.textContent||'').trim();
      if(arabic){
        let m=text.match(/^(\d+)h\s+(\d+)m$/);
        if(m){el.dataset.fcPolishDurationEn=text;el.textContent=arabicDuration(m[1],m[2]);return;}
        m=text.match(/^(\d+)س\s*(\d+)د$/);
        if(m){el.dataset.fcPolishDurationEn=m[1]+'h '+m[2]+'m';el.textContent=arabicDuration(m[1],m[2]);}
      }else if(el.dataset.fcPolishDurationEn){
        el.textContent=el.dataset.fcPolishDurationEn;
        delete el.dataset.fcPolishDurationEn;
      }
    });

    const notes=[...result.querySelectorAll('.muted')];
    const note=notes.find(el=>{
      const t=(el.textContent||'').trim();
      return t.includes('Schedule version(s) used in this month:')||t.includes('نسخ الجدول المستخدمة هذا الشهر:')||t.includes('schedule version effective on each calendar date');
    });
    if(!note)return;

    const current=(note.textContent||'').trim();
    if(!note.dataset.fcPolishVersions){
      const versions=current.match(/\d{4}-\d{2}-\d{2}(?:\s*,\s*\d{4}-\d{2}-\d{2})*/);
      if(versions)note.dataset.fcPolishVersions=versions[0].replace(/\s+/g,'');
      const counts=current.match(/Excluded so far:\s*(\d+)[\s\S]*?,\s*(\d+)[\s\S]*?,\s*(\d+)[\s\S]*?Days with no[\s\S]*?:\s*(\d+)/i);
      if(counts){
        note.dataset.fcPolishOff=counts[1];
        note.dataset.fcPolishHoliday=counts[2];
        note.dataset.fcPolishLeave=counts[3];
        note.dataset.fcPolishNoSchedule=counts[4];
      }
    }

    const versions=(note.dataset.fcPolishVersions||'current/fallback').split(',').join(', ');
    const off=note.dataset.fcPolishOff||'0';
    const holiday=note.dataset.fcPolishHoliday||'0';
    const leave=note.dataset.fcPolishLeave||'0';
    const noSchedule=note.dataset.fcPolishNoSchedule||'0';
    if(arabic){
      note.textContent='يستخدم الغياب الفعلي نسخة جدول العمل السارية في كل تاريخ. ويستبعد أيام الراحة والعطلات والإجازات المعتمدة والتواريخ السابقة للالتحاق وأيام العمل المستقبلية أو قيد التنفيذ. نسخ الجدول المستخدمة هذا الشهر: '+versions+'. المستبعد حتى الآن: '+off+' يوم راحة، '+holiday+' عطلة، '+leave+' يوم إجازة معتمدة. الأيام بدون جدول سارٍ: '+noSchedule+'.';
    }else{
      note.textContent='True absence uses the schedule version effective on each calendar date. It excludes off days, holidays, approved leave, dates before joining, and future/in-progress workdays. Schedule version(s) used in this month: '+versions+'. Excluded so far: '+off+' off day(s), '+holiday+' holiday(s), '+leave+' approved leave day(s). Days with no effective schedule: '+noSchedule+'.';
    }
  }

  function apply(){
    const arabic=document.documentElement.dir==='rtl'||document.documentElement.lang==='ar';
    walk(document.getElementById('app'),arabic);
    walk(document.getElementById('login'),arabic);
    polishMonthInputs(arabic);
    monthlyReportPolish(arabic);
  }

  let pending=false;
  function schedule(){
    if(pending)return;
    pending=true;
    setTimeout(()=>{pending=false;apply();},0);
  }

  const app=document.getElementById('app');
  const login=document.getElementById('login');
  const observer=new MutationObserver(schedule);
  if(app)observer.observe(app,{childList:true,subtree:true,characterData:true});
  if(login)observer.observe(login,{childList:true,subtree:true,characterData:true});
  new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['dir','lang']});

  const previousRender=window.render;
  if(typeof previousRender==='function')window.render=function(page){
    const result=previousRender(page);
    setTimeout(apply,0);
    setTimeout(apply,120);
    setTimeout(apply,420);
    return result;
  };

  setTimeout(apply,0);
  setTimeout(apply,300);
})();
