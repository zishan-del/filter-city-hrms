(function(){
  'use strict';
  if(window.__fcBilingualStep9C3)return;
  window.__fcBilingualStep9C3=true;

  const GENERIC_KEY='fc_hrms_language';
  const pages={Dashboard:'لوحة التحكم',Employees:'الموظفون',Attendance:'الحضور والانصراف',Tasks:'المهام',Leave:'الإجازات',Holidays:'العطلات',Payroll:'الرواتب',EOSB:'مكافأة نهاية الخدمة',Reports:'التقارير',Settings:'الإعدادات'};
  const exact={
    'Admin Login':'دخول المسؤول','Employee Login':'دخول الموظف','Username / Email':'اسم المستخدم / البريد الإلكتروني','Password':'كلمة المرور','Login':'تسجيل الدخول','Logout':'تسجيل الخروج','Human Resources Management System':'نظام إدارة الموارد البشرية',
    'Total Employees':'إجمالي الموظفين','Present Today':'الحاضرون اليوم','Pending Tasks':'المهام المعلقة','Pending Leave':'طلبات الإجازة المعلقة','Cloud connection':'الاتصال السحابي','Connected to PostgreSQL':'متصل بقاعدة البيانات','● Connected to PostgreSQL':'● متصل بقاعدة البيانات',
    'All information below is loaded from the cloud database.':'جميع المعلومات أدناه محملة من قاعدة البيانات السحابية.','PC and mobile use the same API and database. Browser local storage is used only for the login token, never for HRMS records.':'يستخدم الكمبيوتر والجوال نفس واجهة النظام وقاعدة البيانات. يتم استخدام التخزين المحلي في المتصفح فقط لرمز تسجيل الدخول وليس لسجلات الموارد البشرية.','Default admin: admin@filtercity.com / Admin@12345':'المسؤول الافتراضي: admin@filtercity.com / Admin@12345','Employee credentials are created by Admin.':'يتم إنشاء بيانات دخول الموظف بواسطة المسؤول.',

    'Employee':'الموظف','Employee ID':'رقم الموظف','Employees':'الموظفون','Name':'الاسم','Full name':'الاسم الكامل','Department':'القسم','Job':'الوظيفة','Job title':'المسمى الوظيفي','Salary':'الراتب','Status':'الحالة','Mobile':'الجوال','Saudi National ID / Iqama':'الهوية الوطنية السعودية / الإقامة','Nationality':'الجنسية','Joining date':'تاريخ الالتحاق','Bank/payment details':'تفاصيل البنك / الدفع','Login username':'اسم مستخدم الدخول','New password':'كلمة المرور الجديدة','Save to Cloud':'حفظ في السحابة','+ Add Employee':'+ إضافة موظف','Add Employee':'إضافة موظف','Edit Employee':'تعديل الموظف','Edit':'تعديل','Delete':'حذف','Back':'رجوع','Active':'نشط','Inactive':'غير نشط','Leave cycle (years)':'دورة الإجازة (بالسنوات)','Last leave end date':'تاريخ انتهاء آخر إجازة','Next leave date':'تاريخ الإجازة القادمة','Planned leave days (30–60)':'أيام الإجازة المخططة (30–60)','Payroll Allowances':'بدلات الرواتب','Used automatically for the current payroll month.':'تستخدم تلقائياً لشهر الرواتب الحالي.','Leave blank to keep current':'اتركه فارغاً للإبقاء على الحالي',

    'Current Month View — Step 6':'عرض الشهر الحالي — الخطوة 6','📅 Current Month View — Step 6':'📅 عرض الشهر الحالي — الخطوة 6','Saudi/Riyadh':'السعودية/الرياض','Month':'الشهر','Check In':'تسجيل الحضور','Check Out':'تسجيل الانصراف','Check In + GPS':'تسجيل الحضور + GPS','Check Out + GPS':'تسجيل الانصراف + GPS','Check-in GPS':'موقع تسجيل الحضور','Checkout GPS':'موقع تسجيل الانصراف','GPS':'الموقع','Break':'الاستراحة','Start Break':'بدء الاستراحة','End Break':'إنهاء الاستراحة','Break Start':'بداية الاستراحة','Break End':'نهاية الاستراحة','Working':'ساعات العمل','Late':'التأخير','Early':'الانصراف المبكر','Overtime':'العمل الإضافي','Night':'العمل الليلي','Day completed':'اكتمل يوم العمل','Date':'التاريخ','Attendance':'الحضور والانصراف','No attendance records.':'لا توجد سجلات حضور.','Attendance Record':'سجل الحضور',
    'Attendance Correction Preview — Step 8A':'معاينة تصحيح الحضور — الخطوة 8A','🛠 Attendance Correction Preview — Step 8A':'🛠 معاينة تصحيح الحضور — الخطوة 8A','Attendance Correction + Audit Trail — Step 8B':'تصحيح الحضور + سجل التدقيق — الخطوة 8B','🛠 Attendance Correction + Audit Trail — Step 8B':'🛠 تصحيح الحضور + سجل التدقيق — الخطوة 8B','Preview first · Admin save':'معاينة أولاً · حفظ بواسطة المسؤول','Preview only · no DB writes':'معاينة فقط · بدون كتابة في قاعدة البيانات','Correction Reason':'سبب التصحيح','Preview Correction — No Save':'معاينة التصحيح — بدون حفظ','Save Correction to Cloud':'حفظ التصحيح في السحابة','Attendance Audit History':'سجل تدقيق الحضور','Read only':'للقراءة فقط','Current':'الحالي','Proposed':'المقترح','Result':'النتيجة','Changed':'تم التغيير','CHANGED':'تم التغيير','Same':'بدون تغيير','Field':'الحقل','Details':'التفاصيل','Actor':'المنفذ','Action':'الإجراء','Correction Preview':'معاينة التصحيح','No correction preview performed yet.':'لم تتم معاينة أي تصحيح بعد.','No audit events found for this attendance record.':'لا توجد أحداث تدقيق لسجل الحضور هذا.',

    'Tasks':'المهام','Task':'المهمة','My Tasks':'مهامي','+ Assign Task':'+ إسناد مهمة','Assign Task':'إسناد مهمة','Title':'العنوان','Priority':'الأولوية','Deadline':'الموعد النهائي','Start time':'وقت البدء','Description':'الوصف','Task Photo':'صورة المهمة','Low':'منخفض','Normal':'عادي','High':'مرتفع','Urgent':'عاجل','Pending':'معلقة','In Progress':'قيد التنفيذ','Completed':'مكتملة','Photo':'الصورة','Actions':'الإجراءات','Upload / Replace':'رفع / استبدال','Delete Photo':'حذف الصورة','Save Status':'حفظ الحالة','Save Changes':'حفظ التغييرات','No tasks.':'لا توجد مهام.','No tasks yet.':'لا توجد مهام بعد.','No tasks assigned to you.':'لا توجد مهام مسندة إليك.','Mobile Notifications':'إشعارات الجوال','Enable Notifications':'تفعيل الإشعارات','Notifications Enabled':'الإشعارات مفعلة','Try Again':'حاول مرة أخرى','Save':'حفظ',

    'Upcoming Employee Leave':'الإجازات القادمة للموظفين','Leave Requests':'طلبات الإجازة','+ Leave Request':'+ طلب إجازة','Leave Request':'طلب إجازة','Leave type':'نوع الإجازة','Annual Leave':'إجازة سنوية','Sick Leave':'إجازة مرضية','Emergency Leave':'إجازة طارئة','Start date':'تاريخ البداية','End date':'تاريخ النهاية','Days':'الأيام','Reason':'السبب','Submit to Cloud':'إرسال إلى السحابة','Approve':'موافقة','Reject':'رفض','Approved':'معتمدة','Rejected':'مرفوضة','Overdue':'متأخر','Next Leave':'الإجازة القادمة','Planned Days':'الأيام المخططة','Cycle':'الدورة','Last Leave End':'نهاية آخر إجازة','Days Until':'الأيام المتبقية','No leave requests.':'لا توجد طلبات إجازة.',

    'Holidays':'العطلات','+ Add Holiday':'+ إضافة عطلة','Add Holiday':'إضافة عطلة','Holiday':'عطلة','Type':'النوع','Saudi Public':'عطلة رسمية سعودية','Company':'الشركة','No holidays.':'لا توجد عطلات.',

    'Payroll':'الرواتب','+ Add Payroll':'+ إضافة راتب','Add Payroll':'إضافة راتب','Pay month':'شهر الراتب','Basic salary':'الراتب الأساسي','Basic':'الأساسي','Allowances':'البدلات','Deductions':'الاستقطاعات','Net':'الصافي','Payment':'الدفع','Paid':'مدفوع','Unpaid':'غير مدفوع','PAID':'مدفوع','UNPAID':'غير مدفوع','Paid Date':'تاريخ الدفع','Mark Paid':'تحديد كمدفوع','Undo Paid':'إلغاء حالة مدفوع','Mark All Paid':'تحديد الكل كمدفوع','Print / Save PDF':'طباعة / حفظ PDF','Employees':'الموظفون','Total Net Payroll':'إجمالي صافي الرواتب','Payroll Payment Summary':'ملخص دفع الرواتب','💳 Payroll Payment Summary':'💳 ملخص دفع الرواتب','No payroll records.':'لا توجد سجلات رواتب.',

    'End of Service Benefit':'مكافأة نهاية الخدمة','+ Calculate EOSB':'+ حساب مكافأة نهاية الخدمة','Calculate EOSB':'حساب مكافأة نهاية الخدمة','Service years':'سنوات الخدمة','Last Salary':'الراتب الأخير','Last salary':'الراتب الأخير','Benefit':'المكافأة','Calculate & Save':'حساب وحفظ','No EOSB calculations.':'لا توجد حسابات لمكافأة نهاية الخدمة.',

    'Reports':'التقارير','Report data':'بيانات التقرير','Export CSV':'تصدير CSV','View Report':'عرض التقرير','View Audit Report':'عرض تقرير التدقيق','View Inspection Report':'عرض تقرير الفحص','Attendance Correction / Audit Report — Step 9B':'تقرير تصحيح الحضور / التدقيق — الخطوة 9B','🧾 Attendance Correction / Audit Report — Step 9B':'🧾 تقرير تصحيح الحضور / التدقيق — الخطوة 9B','Attendance Inspection Report — Step 9A':'تقرير فحص الحضور — الخطوة 9A','🧾 Attendance Inspection Report — Step 9A':'🧾 تقرير فحص الحضور — الخطوة 9A','Monthly Employee Attendance Report — Step 7E':'تقرير الحضور الشهري للموظف — الخطوة 7E','📊 Monthly Employee Attendance Report — Step 7E':'📊 تقرير الحضور الشهري للموظف — الخطوة 7E','Admin · permanent audit':'المسؤول · تدقيق دائم','Admin · report only':'المسؤول · تقرير فقط','Admin · effective-date schedules':'المسؤول · جداول حسب تاريخ السريان','All Employees':'جميع الموظفين','Correction Events':'عمليات التصحيح','Employees Corrected':'الموظفون المصححون','Attendance Records':'سجلات الحضور','Fields Changed':'الحقول المعدلة','Correction Time':'وقت التصحيح','Attendance Date':'تاريخ الحضور','Field Changed':'الحقل المعدل','Old Value':'القيمة القديمة','New Value':'القيمة الجديدة','Old':'القديم','New':'الجديد','Admin':'المسؤول','Audit ID':'رقم التدقيق','Recorded Days':'الأيام المسجلة','Present':'حاضر','True Absent':'الغياب الفعلي','Scheduled Days Due':'أيام الدوام المستحقة','Late Days':'أيام التأخير','Early Days':'أيام الانصراف المبكر','Overtime Days':'أيام العمل الإضافي','Break Over Days':'أيام تجاوز الاستراحة','Night Work Days':'أيام العمل الليلي','Approved Leave Days':'أيام الإجازة المعتمدة','Holiday Days':'أيام العطلات','Off Days':'أيام الراحة','Admin Corrections':'تصحيحات المسؤول','Schedule Effective':'تاريخ سريان الجدول','Classification':'التصنيف','Corrections':'التصحيحات','Report only · no DB writes':'تقرير فقط · بدون كتابة في قاعدة البيانات','Read only · no DB writes':'للقراءة فقط · بدون كتابة في قاعدة البيانات','Permanent attendance correction audit trail · Saudi/Riyadh time':'سجل دائم لتصحيحات الحضور · توقيت السعودية/الرياض','Status':'الحالة','Working Minutes':'دقائق العمل','Late Minutes':'دقائق التأخير','Early Minutes':'دقائق الانصراف المبكر','Overtime Minutes':'دقائق العمل الإضافي','Night Minutes':'دقائق العمل الليلي','Break Over':'تجاوز الاستراحة','Schedule Effective From':'ساري من',

    'Company Settings':'إعدادات الشركة','Working hours/day':'ساعات العمل/اليوم','Annual leave days':'أيام الإجازة السنوية','Save Settings to Cloud':'حفظ الإعدادات في السحابة','Change Admin Password':'تغيير كلمة مرور المسؤول','Current password':'كلمة المرور الحالية','Confirm new password':'تأكيد كلمة المرور الجديدة','Change Password':'تغيير كلمة المرور','Work Schedule History — Step 7E':'سجل جداول العمل — الخطوة 7E','🕒 Work Schedule History — Step 7E':'🕒 سجل جداول العمل — الخطوة 7E','Effective From':'ساري من','Shift Start':'بداية الوردية','Shift End':'نهاية الوردية','Allowed Break (minutes)':'الاستراحة المسموحة (دقائق)','Late Grace (minutes)':'سماح التأخير (دقائق)','Working Days':'أيام العمل','Save Schedule Version':'حفظ نسخة الجدول','Employee Schedule History':'سجل جداول الموظف','Shift':'الوردية','Late Grace':'سماح التأخير','Version':'النسخة','Historical':'تاريخي','Future':'مستقبلي','Not configured':'غير مهيأ','Current schedule found':'تم العثور على الجدول الحالي','Effective-date audit trail':'سجل تدقيق حسب تاريخ السريان',

    'Attendance Rules Preview — Step 7B':'معاينة قواعد الحضور — الخطوة 7B','🧮 Attendance Rules Preview — Step 7B':'🧮 معاينة قواعد الحضور — الخطوة 7B','Dry run · Step 7E history':'اختبار بدون حفظ · سجل الخطوة 7E','Calculate Rules':'حساب القواعد','Database changes':'تغييرات قاعدة البيانات','NONE (dry run)':'لا شيء (اختبار فقط)','Schedule':'الجدول','Day classification':'تصنيف اليوم','Rule note':'ملاحظة القاعدة','Expected Work':'العمل المتوقع','Actual Work':'العمل الفعلي','Early Checkout':'الانصراف المبكر','No Schedule':'لا يوجد جدول','Absent Eligible':'مؤهل كغياب','Workday In Progress':'يوم العمل قيد التنفيذ','Future Workday':'يوم عمل مستقبلي','Off Day':'يوم راحة','Approved Leave':'إجازة معتمدة','Worked on Off Day':'عمل في يوم راحة','Worked on Holiday':'عمل في عطلة','Worked During Approved Leave':'عمل أثناء إجازة معتمدة','No Attendance':'لا يوجد حضور','Scheduled working day.':'يوم عمل مجدول.',

    'Attendance Reminder Test Panel':'لوحة اختبار تذكير الحضور','🔔 Attendance Reminder Test Panel':'🔔 لوحة اختبار تذكير الحضور','Admin test only':'اختبار للمسؤول فقط','Automatic Reminder Logic — Dry Run':'منطق التذكير التلقائي — اختبار بدون حفظ','Real Push Test — Manual':'اختبار إشعار فعلي — يدوي','Preview Notification Cleanup':'تنظيف إشعارات المعاينة','Check Reminder Logic':'فحص منطق التذكير','Send Test Reminder':'إرسال تذكير تجريبي','Clean Old Preview Registrations':'تنظيف تسجيلات المعاينة القديمة','No dry-run test performed yet.':'لم يتم إجراء اختبار بعد.','No real test sent.':'لم يتم إرسال اختبار فعلي.','No cleanup performed yet.':'لم يتم إجراء تنظيف بعد.','Registered phones':'الهواتف المسجلة',

    'Settings':'الإعدادات','Admin only.':'للمسؤول فقط.','Employee management is available to Admin.':'إدارة الموظفين متاحة للمسؤول فقط.','No records.':'لا توجد سجلات.','No data.':'لا توجد بيانات.'
  };

  const monthNames={January:'يناير',February:'فبراير',March:'مارس',April:'أبريل',May:'مايو',June:'يونيو',July:'يوليو',August:'أغسطس',September:'سبتمبر',October:'أكتوبر',November:'نوفمبر',December:'ديسمبر'};
  const phrases=[
    ['Showing ','عرض '],['Old records are kept','يتم الاحتفاظ بالسجلات القديمة'],['choose another month to view history','اختر شهراً آخر لعرض السجل'],['Today’s check-in/break/check-out controls stay live','تظل أدوات تسجيل الحضور والاستراحة والانصراف لليوم فعالة'],['the history table below follows the selected month','يتبع جدول السجل أدناه الشهر المحدد'],
    ['Payroll Payment Summary — ','ملخص دفع الرواتب — '],['Attendance Inspection Report — ','تقرير فحص الحضور — '],['Attendance Correction / Audit Report — ','تقرير تصحيح الحضور / التدقيق — '],['Inspection-ready attendance record','سجل حضور جاهز للفحص'],['Permanent attendance correction audit trail','سجل دائم لتصحيحات الحضور'],['Schedule versions:','نسخ الجدول:'],['Schedule version(s):','نسخ الجدول:'],['Riyadh time','توقيت الرياض'],['Saudi/Riyadh time','توقيت السعودية/الرياض'],
    ['Correction Events','عمليات التصحيح'],['Employees Corrected','الموظفون المصححون'],['Attendance Records','سجلات الحضور'],['Fields Changed','الحقول المعدلة'],['True absence','الغياب الفعلي'],['effective schedule','الجدول الساري'],['approved leave','الإجازة المعتمدة'],['off days','أيام الراحة'],['holidays','العطلات'],['future/in-progress workdays','أيام العمل المستقبلية/قيد التنفيذ'],
    ['No attendance or scheduled absence records for ','لا توجد سجلات حضور أو غياب مجدول لشهر '],['No due attendance/absence rows for ','لا توجد صفوف حضور/غياب مستحقة لشهر '],['No ADMIN_CORRECTION events for ','لا توجد أحداث ADMIN_CORRECTION لـ '],['Choose employee/month and click View Audit Report.','اختر الموظف/الشهر ثم اضغط عرض تقرير التدقيق.'],['Choose employee/month and click View Inspection Report.','اختر الموظف/الشهر ثم اضغط عرض تقرير الفحص.'],['Choose an employee to view the monthly attendance report.','اختر موظفاً لعرض تقرير الحضور الشهري.'],
    ['Loading payment status…','جارٍ تحميل حالة الدفع…'],['Loading permanent correction audit trail…','جارٍ تحميل سجل تصحيحات الحضور الدائم…'],['Building inspection attendance report…','جارٍ إعداد تقرير فحص الحضور…'],['Calculating effective-date attendance and absence…','جارٍ حساب الحضور والغياب حسب تاريخ السريان…'],['Loading work schedule history…','جارٍ تحميل سجل جداول العمل…'],['Loading attendance audit history…','جارٍ تحميل سجل تدقيق الحضور…'],['No employee work schedule history configured yet.','لا يوجد سجل جداول عمل مهيأ للموظف حتى الآن.'],['No upcoming leave dates. Edit an employee to add the next leave date.','لا توجد تواريخ إجازة قادمة. عدّل الموظف لإضافة تاريخ الإجازة القادمة.']
  ];

  const placeholderExact={
    'Leave blank to keep current':'اتركه فارغاً للإبقاء على الحالي',
    'Example: Employee reported checkout was recorded 10 minutes early due to device clock issue.':'مثال: أفاد الموظف بأن تسجيل الانصراف تم قبل الوقت بعشر دقائق بسبب مشكلة في ساعة الجهاز.'
  };

  const style=document.createElement('style');
  style.id='fc-bilingual-9c3-style';
  style.textContent=`
    .fc-lang-switch{display:flex;direction:ltr;align-items:center;border:1px solid #d7e0eb;border-radius:9px;overflow:hidden;background:#fff;flex:0 0 auto}
    .fc-lang-switch button{min-width:52px;padding:8px 12px!important;border-radius:0!important;background:#fff!important;color:#062b55!important;font-weight:800!important;border:0!important;box-shadow:none!important}
    .fc-lang-switch button.active{background:#e31b23!important;color:#fff!important}
    .fc-login-lang{justify-content:center;margin:0 auto 16px;width:max-content}
    .fc-top-lang{margin-left:14px}
    html[dir="rtl"] body{font-family:Tahoma,Arial,sans-serif}
    html[dir="rtl"] .shell{grid-template-columns:1fr 230px;direction:ltr}
    html[dir="rtl"] .sidebar{grid-column:2;grid-row:1;text-align:right;direction:rtl}
    html[dir="rtl"] .main{grid-column:1;grid-row:1;direction:rtl}
    html[dir="rtl"] .nav button{text-align:right!important;border-left:0!important;border-right:3px solid transparent!important}
    html[dir="rtl"] .nav button.active{border-right-color:#fff!important}
    html[dir="rtl"] .top{direction:rtl}
    html[dir="rtl"] .top>div:first-child{direction:rtl}
    html[dir="rtl"] .fc-company-strip{margin-left:auto!important;margin-right:20px!important}
    html[dir="rtl"] .user{direction:rtl;text-align:right}
    html[dir="rtl"] .content{text-align:right}
    html[dir="rtl"] .section-head,html[dir="rtl"] .actions,html[dir="rtl"] .form-grid{direction:rtl}
    html[dir="rtl"] .table th,html[dir="rtl"] .table td{text-align:right}
    html[dir="rtl"] .field label{text-align:right}
    html[dir="rtl"] input,html[dir="rtl"] select,html[dir="rtl"] textarea{text-align:right}
    html[dir="rtl"] input[type="date"],html[dir="rtl"] input[type="time"],html[dir="rtl"] input[type="month"],html[dir="rtl"] input[type="datetime-local"],html[dir="rtl"] input[type="number"]{direction:ltr;text-align:right}
    html[dir="rtl"] .hero{border-left:1px solid var(--fc-line)!important;border-right:5px solid var(--fc-red)!important}
    html[dir="rtl"] .fc-top-lang{margin-left:0;margin-right:14px}
    html[dir="rtl"] .table-wrap{direction:rtl}
    html[dir="rtl"] .table{direction:rtl}
    html[dir="rtl"] .badge{unicode-bidi:plaintext}
    @media(max-width:850px){
      html[dir="rtl"] .shell{grid-template-columns:1fr;direction:ltr}
      html[dir="rtl"] .sidebar{grid-column:1;right:-250px;left:auto;direction:rtl}
      html[dir="rtl"] .sidebar.open{right:0;left:auto}
      html[dir="rtl"] .main{grid-column:1;direction:rtl}
    }
  `;
  document.head.appendChild(style);

  const textState=new WeakMap();

  function user(){try{return JSON.parse(sessionStorage.getItem('fc_user')||'null');}catch(_){return null;}}
  function userKey(){const u=user();return u&&u.username?GENERIC_KEY+'_'+String(u.username).toLowerCase():null;}
  function savedLanguage(){const k=userKey();return (k&&localStorage.getItem(k))||localStorage.getItem(GENERIC_KEY)||'en';}
  function storeLanguage(lang){localStorage.setItem(GENERIC_KEY,lang);const k=userKey();if(k)localStorage.setItem(k,lang);}

  function switchHtml(location){return '<div class="fc-lang-switch '+(location==='login'?'fc-login-lang':'fc-top-lang')+'" data-fc-lang-switch="'+location+'"><button type="button" data-lang="en">EN</button><button type="button" data-lang="ar">عربي</button></div>';}
  function ensureSwitches(){
    const card=document.querySelector('.login-card');
    if(card&&!card.querySelector('[data-fc-lang-switch="login"]')){
      const brand=card.querySelector('.brand');
      if(brand)brand.insertAdjacentHTML('afterend',switchHtml('login'));
    }
    const top=document.querySelector('.top');
    const userBox=top&&top.querySelector('.user');
    if(top&&userBox&&!top.querySelector('[data-fc-lang-switch="top"]'))userBox.insertAdjacentHTML('beforebegin',switchHtml('top'));
    document.querySelectorAll('.fc-lang-switch button').forEach(btn=>{
      if(!btn.dataset.bound){btn.dataset.bound='1';btn.addEventListener('click',()=>setLanguage(btn.dataset.lang));}
    });
  }

  function arabicText(raw){
    if(!raw)return null;
    if(pages[raw])return pages[raw];
    if(exact[raw])return exact[raw];
    let out=raw;
    Object.entries(monthNames).forEach(([en,ar])=>{out=out.replace(new RegExp('\\b'+en+'\\b','g'),ar);});
    phrases.forEach(([en,ar])=>{if(out.includes(en))out=out.split(en).join(ar);});
    return out!==raw?out:null;
  }

  function replaceTrimmed(node,value){
    const current=node.nodeValue||'';
    const lead=(current.match(/^\s*/)||[''])[0],trail=(current.match(/\s*$/)||[''])[0];
    node.nodeValue=lead+value+trail;
  }

  function translateTree(root,toArabic){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(n=>{
      const current=(n.nodeValue||'').trim();
      if(!current)return;
      const meta=textState.get(n);
      if(toArabic){
        let raw=current;
        if(meta&&current===meta.ar)raw=meta.en;
        else if(meta&&current===meta.en)raw=meta.en;
        else if(meta)textState.delete(n);
        const ar=arabicText(raw);
        if(ar&&ar!==raw){textState.set(n,{en:raw,ar});replaceTrimmed(n,ar);}
      }else if(meta){
        if(current===meta.ar)replaceTrimmed(n,meta.en);
        textState.delete(n);
      }
    });
  }

  function translatePlaceholders(root,toArabic){
    if(!root)return;
    root.querySelectorAll('[placeholder]').forEach(el=>{
      if(toArabic){
        const raw=el.dataset.fcEnPlaceholder||el.getAttribute('placeholder')||'';
        const ar=placeholderExact[raw]||arabicText(raw);
        if(ar&&ar!==raw){el.dataset.fcEnPlaceholder=raw;el.setAttribute('placeholder',ar);}
      }else if(el.dataset.fcEnPlaceholder){
        el.setAttribute('placeholder',el.dataset.fcEnPlaceholder);
        delete el.dataset.fcEnPlaceholder;
      }
    });
  }

  function translateDashboard(toArabic){
    const hero=document.querySelector('#content .hero h1');
    const u=user();
    if(hero&&u&&u.username){hero.textContent=toArabic?'مرحباً، '+u.username:'Welcome, '+u.username;}
  }

  function applyLanguage(lang){
    const ar=lang==='ar';
    const k=userKey();
    if(k&&!localStorage.getItem(k))localStorage.setItem(k,lang);
    document.documentElement.lang=ar?'ar':'en';
    document.documentElement.dir=ar?'rtl':'ltr';
    document.body.classList.toggle('fc-lang-ar',ar);
    ensureSwitches();
    document.querySelectorAll('.fc-lang-switch button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
    translateTree(document.getElementById('login'),ar);
    translateTree(document.getElementById('app'),ar);
    translateTree(document.getElementById('toast'),ar);
    translatePlaceholders(document.getElementById('login'),ar);
    translatePlaceholders(document.getElementById('app'),ar);
    translateDashboard(ar);
    document.title=ar?'فلتر سيتي للتجارة - نظام الموارد البشرية':'FILTER CITY TRADING CO. HRMS';
  }

  function setLanguage(lang){
    lang=lang==='ar'?'ar':'en';
    storeLanguage(lang);
    applyLanguage(lang);
  }
  window.fcSetLanguage=setLanguage;

  const previousRender=window.render;
  if(typeof previousRender==='function')window.render=function(page){const result=previousRender(page);setTimeout(()=>applyLanguage(savedLanguage()),0);return result;};

  const previousBoot=window.boot;
  if(typeof previousBoot==='function')window.boot=async function(u){const result=await previousBoot(u);setTimeout(()=>applyLanguage(savedLanguage()),0);return result;};

  const previousSetRole=window.setRole;
  if(typeof previousSetRole==='function')window.setRole=function(r){const result=previousSetRole(r);setTimeout(()=>applyLanguage(savedLanguage()),0);return result;};

  let scheduled=false;
  function scheduleTranslate(){
    if(savedLanguage()!=='ar'||scheduled)return;
    scheduled=true;
    setTimeout(()=>{scheduled=false;applyLanguage('ar');},0);
  }
  ['login','app','toast'].forEach(id=>{
    const root=document.getElementById(id);
    if(root)new MutationObserver(scheduleTranslate).observe(root,{childList:true,subtree:true});
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>applyLanguage(savedLanguage()),{once:true});
  else applyLanguage(savedLanguage());
})();
