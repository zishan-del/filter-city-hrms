(function(){
  'use strict';
  if(window.__fcAttendanceAuditPrint9C6)return;
  window.__fcAttendanceAuditPrint9C6=true;

  const BASE_KEY='fc_hrms_language';
  const monthsAr={January:'يناير',February:'فبراير',March:'مارس',April:'أبريل',May:'مايو',June:'يونيو',July:'يوليو',August:'أغسطس',September:'سبتمبر',October:'أكتوبر',November:'نوفمبر',December:'ديسمبر'};

  function currentUser(){try{return JSON.parse(sessionStorage.getItem('fc_user')||'null');}catch(_){return null;}}
  function language(){
    const u=currentUser();
    const userKey=u&&u.username?BASE_KEY+'_'+String(u.username).toLowerCase():'';
    return (userKey&&localStorage.getItem(userKey))||localStorage.getItem(BASE_KEY)||document.documentElement.lang||'en';
  }
  function replaceAllLiteral(text,from,to){return String(text).split(from).join(to);}
  function arabicMonthText(text){let out=String(text);Object.keys(monthsAr).forEach(m=>{out=replaceAllLiteral(out,m,monthsAr[m]);});return out;}

  function polishEnglish(html){
    let out=String(html||'');
    out=out.replace(/<html([^>]*)>/i,'<html$1 lang="en" dir="ltr">');
    out=out.replace(/<h1>[^<]*<\/h1>/i,'<h1>FILTER CITY TRADING CO.</h1><div class="fc-company-ar">شركة مدينة الفلاتر للتجارة</div>');
    out=out.replace('</style>','.fc-company-ar{color:#e31e24;font-weight:700;font-size:13px;margin:0 0 8px}.fc-brandline{border-top:3px solid #0b3a6f;margin-top:10px;padding-top:8px}</style>');
    out=out.replace(/<h2>/i,'<h2 class="fc-brandline">');
    return out;
  }

  function polishArabic(html){
    let out=polishEnglish(html);
    out=out.replace(/<html([^>]*)lang="en" dir="ltr"([^>]*)>/i,'<html$1lang="ar" dir="rtl"$2>');
    out=out.replace('<h1>FILTER CITY TRADING CO.</h1>','<h1 dir="ltr" style="text-align:right;unicode-bidi:isolate">FILTER CITY TRADING CO.</h1>');
    out=out.replace(/<title>(.*?)<\/title>/i,'<title>FILTER CITY TRADING CO. - تقرير تصحيح الحضور والتدقيق</title>');
    out=out.replace(/<h2 class="fc-brandline">Attendance Correction \/ Audit Report — ([^<]+)<\/h2>/i,function(_,month){return '<h2 class="fc-brandline">تقرير تصحيح الحضور / التدقيق — '+arabicMonthText(month)+'</h2>';});
    out=out.replace(/<h2>Attendance Correction \/ Audit Report — ([^<]+)<\/h2>/i,function(_,month){return '<h2>تقرير تصحيح الحضور / التدقيق — '+arabicMonthText(month)+'</h2>';});

    const replacements=[
      ['Scope:','النطاق:'],['All Employees','جميع الموظفين'],['Generated from FILTER CITY HRMS','تم إنشاؤه من نظام FILTER CITY HRMS'],['Saudi/Riyadh','السعودية/الرياض'],
      ['Correction Events','عمليات التصحيح'],['Employees Corrected','الموظفون المصححون'],['Attendance Records','سجلات الحضور'],['Fields Changed','الحقول المعدلة'],
      ['<th>Correction Time</th>','<th>وقت التصحيح</th>'],['<th>Employee</th>','<th>الموظف</th>'],['<th>Attendance Date</th>','<th>تاريخ الحضور</th>'],['<th>Field</th>','<th>الحقل</th>'],['<th>Old</th>','<th>القديم</th>'],['<th>New</th>','<th>الجديد</th>'],['<th>Reason</th>','<th>السبب</th>'],['<th>Admin</th>','<th>المسؤول</th>'],['<th>Audit ID</th>','<th>رقم التدقيق</th>'],
      ['Check In','تسجيل الحضور'],['Check Out','تسجيل الانصراف'],['Break Start','بداية الاستراحة'],['Break End','نهاية الاستراحة'],['Check-in Latitude','خط عرض تسجيل الحضور'],['Check-in Longitude','خط طول تسجيل الحضور'],['Check-in Accuracy','دقة موقع تسجيل الحضور'],['Checkout Latitude','خط عرض تسجيل الانصراف'],['Checkout Longitude','خط طول تسجيل الانصراف'],['Checkout Accuracy','دقة موقع تسجيل الانصراف'],['Correction','تصحيح'],
      ['No ADMIN_CORRECTION events.','لا توجد عمليات تصحيح حضور إدارية في هذه الفترة.'],
      ['The audit source returned its current 200-row maximum. Older audit events may exist outside this report.','أعاد مصدر سجل التدقيق الحد الحالي البالغ 200 صف. قد توجد عمليات تدقيق أقدم خارج هذا التقرير.'],
      ['This report reads the permanent ADMIN_CORRECTION audit trail and does not modify attendance or audit data.','يقرأ هذا التقرير سجل التدقيق الدائم لتصحيحات الحضور الإدارية ولا يقوم بتعديل بيانات الحضور أو بيانات التدقيق.']
    ];
    replacements.forEach(x=>{out=replaceAllLiteral(out,x[0],x[1]);});
    out=arabicMonthText(out);
    out=out.replace('</style>','body{direction:rtl;text-align:right}th,td{text-align:right;unicode-bidi:plaintext}.summary{direction:rtl}.muted,.foot,.warn{line-height:1.7}table{direction:rtl}</style>');
    return out;
  }

  function install(){
    if(typeof window.fc9bPrint!=='function'||window.fc9bPrint.__fc9c6Wrapped)return false;
    const original=window.fc9bPrint;
    const wrapped=async function(){
      const realOpen=window.open;
      const lang=language()==='ar'?'ar':'en';
      window.open=function(){
        const real=realOpen.apply(window,arguments);
        if(!real)return real;
        return {
          document:{
            open:function(){return real.document.open();},
            write:function(html){return real.document.write(lang==='ar'?polishArabic(html):polishEnglish(html));},
            close:function(){return real.document.close();}
          },
          focus:function(){return real.focus();},
          print:function(){return real.print();}
        };
      };
      try{return await original.apply(this,arguments);}finally{window.open=realOpen;}
    };
    wrapped.__fc9c6Wrapped=true;
    wrapped.__fc9c6Original=original;
    window.fc9bPrint=wrapped;
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(function(){tries++;if(install()||tries>80)clearInterval(timer);},100);
  }
})();
