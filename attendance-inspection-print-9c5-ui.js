(function(){
  'use strict';
  if(window.__fcAttendanceInspectionPrint9C5)return;
  window.__fcAttendanceInspectionPrint9C5=true;

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
    out=out.replace(/<title>(.*?)<\/title>/i,'<title>FILTER CITY TRADING CO. - تقرير فحص الحضور</title>');
    out=out.replace(/<h2>Monthly Attendance Inspection Report — ([^<]+)<\/h2>/i,function(_,month){return '<h2>تقرير فحص الحضور الشهري — '+arabicMonthText(month)+'</h2>';});
    out=out.replace(/<h2 class="fc-brandline">Monthly Attendance Inspection Report — ([^<]+)<\/h2>/i,function(_,month){return '<h2 class="fc-brandline">تقرير فحص الحضور الشهري — '+arabicMonthText(month)+'</h2>';});

    const replacements=[
      ['Employee:','الموظف:'],['Generated from FILTER CITY HRMS','تم إنشاؤه من نظام FILTER CITY HRMS'],['Saudi/Riyadh','السعودية/الرياض'],['Schedule version(s):','نسخ جدول العمل:'],
      ['Present','حاضر'],['True Absent','الغياب الفعلي'],['Scheduled Due','أيام الدوام المستحقة'],['Admin Corrections','تصحيحات المسؤول'],['Late Days','أيام التأخير'],['Early Days','أيام الانصراف المبكر'],['Overtime Days','أيام العمل الإضافي'],['Break Over Days','أيام تجاوز الاستراحة'],['Night Work Days','أيام العمل الليلي'],['Approved Leave Days','أيام الإجازة المعتمدة'],['Holiday Days','أيام العطلات'],['Off Days','أيام الراحة'],
      ['Totals:','الإجماليات:'],['Working','ساعات العمل'],['Late','التأخير'],['Early','الانصراف المبكر'],['Overtime','العمل الإضافي'],['Break over','تجاوز الاستراحة'],['Night','العمل الليلي'],
      ['<th>Date</th>','<th>التاريخ</th>'],['<th>Class</th>','<th>التصنيف</th>'],['<th>Schedule</th>','<th>الجدول</th>'],['<th>Check In</th>','<th>تسجيل الحضور</th>'],['<th>Check Out</th>','<th>تسجيل الانصراف</th>'],['<th>Work</th>','<th>العمل</th>'],['<th>Late</th>','<th>التأخير</th>'],['<th>Early</th>','<th>الانصراف المبكر</th>'],['<th>OT</th>','<th>الإضافي</th>'],['<th>Break Over</th>','<th>تجاوز الاستراحة</th>'],['<th>Night</th>','<th>العمل الليلي</th>'],['<th>Corrections</th>','<th>التصحيحات</th>'],['<th>Status</th>','<th>الحالة</th>'],
      ['ABSENT_SCHEDULED','غياب فعلي'],['APPROVED_LEAVE','إجازة معتمدة'],['NO_SCHEDULE','بدون جدول'],['OFF_DAY','يوم راحة'],['HOLIDAY','عطلة'],['SCHEDULED','دوام مجدول'],['Absent — Scheduled','غائب — دوام مجدول'],
      ['No due attendance/absence rows.','لا توجد سجلات حضور أو غياب مستحقة.'],
      ['True absence is report-derived from effective schedules and excludes off days, holidays, approved leave, dates before joining and future/in-progress workdays. This report is an HRMS operational record and is not a legal certification.','يتم احتساب الغياب الفعلي في هذا التقرير من جداول العمل السارية، مع استبعاد أيام الراحة والعطلات والإجازات المعتمدة والتواريخ السابقة للالتحاق وأيام العمل المستقبلية أو التي لا تزال قيد التنفيذ. هذا التقرير سجل تشغيلي لنظام الموارد البشرية وليس شهادة قانونية.']
    ];
    replacements.forEach(x=>{out=replaceAllLiteral(out,x[0],x[1]);});
    out=arabicMonthText(out);
    out=out.replace('</style>','body{direction:rtl;text-align:right}th,td{text-align:right}.summary{direction:rtl}.muted,.foot{line-height:1.7}table{direction:rtl}</style>');
    return out;
  }

  function install(){
    if(typeof window.fc9Print!=='function'||window.fc9Print.__fc9c5Wrapped)return false;
    const original=window.fc9Print;
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
    wrapped.__fc9c5Wrapped=true;
    wrapped.__fc9c5Original=original;
    window.fc9Print=wrapped;
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(function(){tries++;if(install()||tries>80)clearInterval(timer);},100);
  }
})();
