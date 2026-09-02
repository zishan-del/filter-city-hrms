(function(){
  'use strict';
  if(window.__fcDashboardRedesign9C41)return;
  window.__fcDashboardRedesign9C41=true;

  const previousViewDashboard=window.viewDashboard;
  const COLORS={navy:'#062b55',blue:'#0a4f8a',red:'#e31b23',green:'#14804a',amber:'#d97706',gray:'#9aa7b5'};

  const style=document.createElement('style');
  style.id='fc-dashboard-9c41-style';
  style.textContent=`
    .fc-dash{display:grid;gap:14px}
    .fc-dash-toolbar{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--fc-line,#dfe5ee);border-radius:12px;padding:12px 14px;box-shadow:0 4px 14px #001b3808}
    .fc-dash-search-wrap{position:relative;flex:1;max-width:520px}
    .fc-dash-search{width:100%;height:42px;border:1px solid #d5deea;border-radius:9px;padding:0 42px 0 14px;background:#fff;color:#122033}
    html[dir="rtl"] .fc-dash-search{padding:0 14px 0 42px}
    .fc-dash-search-icon{position:absolute;right:14px;top:10px;font-size:18px;color:#61758b;pointer-events:none}
    html[dir="rtl"] .fc-dash-search-icon{right:auto;left:14px}
    .fc-dash-search-results{display:none;position:absolute;left:0;right:0;top:47px;background:#fff;border:1px solid #dce3eb;border-radius:9px;box-shadow:0 12px 28px #001b3820;z-index:25;overflow:hidden;max-height:300px;overflow-y:auto}
    .fc-dash-search-results.open{display:block}
    .fc-dash-search-item{width:100%;border-radius:0!important;background:#fff!important;color:#17324d!important;text-align:left;padding:10px 12px!important;border-bottom:1px solid #edf1f5!important;font-weight:600!important}
    html[dir="rtl"] .fc-dash-search-item{text-align:right}
    .fc-dash-search-item:hover{background:#f4f7fb!important}
    .fc-dash-date{margin-inline-start:auto;text-align:end;color:#66758a;font-size:12px;line-height:1.45;white-space:nowrap}
    .fc-dash-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
    .fc-dash-kpi{background:#fff;border:1px solid #dfe5ee;border-radius:12px;padding:15px;display:flex;gap:12px;align-items:center;min-width:0;box-shadow:0 4px 14px #001b3808;position:relative;overflow:hidden}
    .fc-dash-kpi:before{content:'';position:absolute;inset-block:0;inset-inline-start:0;width:4px;background:var(--kpi,#062b55)}
    .fc-dash-kpi-icon{width:43px;height:43px;border-radius:50%;display:grid;place-items:center;background:#f3f6fa;font-size:20px;flex:0 0 auto}
    .fc-dash-kpi-label{font-size:12px;color:#52667b;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .fc-dash-kpi-value{font-size:26px;font-weight:900;color:#122033;line-height:1}
    .fc-dash-kpi-sub{font-size:10px;color:#718096;margin-top:5px}
    .fc-dash-layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(310px,.8fr);gap:14px;align-items:start}
    .fc-dash-left,.fc-dash-right{display:grid;gap:14px;min-width:0}
    .fc-dash-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
    .fc-dash-panel{background:#fff;border:1px solid #dfe5ee;border-radius:12px;box-shadow:0 4px 14px #001b3808;min-width:0;overflow:hidden}
    .fc-dash-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 15px;border-bottom:1px solid #e7edf3}
    .fc-dash-panel-title{font-size:13px;font-weight:900;color:#062b55;text-transform:uppercase;letter-spacing:.2px}
    .fc-dash-link{background:transparent!important;color:#e31b23!important;padding:4px!important;min-height:0!important;font-size:11px!important;box-shadow:none!important}
    .fc-dash-panel-body{padding:15px}
    .fc-attendance-chart{display:grid;grid-template-columns:160px 1fr;gap:16px;align-items:center;min-height:205px}
    .fc-donut{width:150px;height:150px;border-radius:50%;position:relative;margin:auto;background:conic-gradient(var(--p1) 0 var(--a1),var(--p2) var(--a1) var(--a2),var(--p3) var(--a2) 100%)}
    .fc-donut:after{content:'';position:absolute;inset:24px;background:#fff;border-radius:50%}
    .fc-donut-center{position:absolute;inset:0;z-index:2;display:grid;place-content:center;text-align:center;font-size:11px;color:#65778b}
    .fc-donut-center b{font-size:27px;color:#062b55;line-height:1.05}
    .fc-chart-legend{display:grid;gap:10px;font-size:12px}
    .fc-chart-legend-row{display:grid;grid-template-columns:10px 1fr auto;gap:8px;align-items:center}
    .fc-dot{width:9px;height:9px;border-radius:50%;background:var(--dot)}
    .fc-chart-foot{border-top:1px solid #edf1f5;margin-top:12px;padding-top:10px;color:#718096;font-size:10px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
    .fc-month-bars{height:160px;display:flex;align-items:end;gap:12px;padding-top:10px;border-bottom:1px solid #dfe5ee}
    .fc-month-bar-group{flex:1;min-width:0;text-align:center;font-size:10px;color:#66758a}
    .fc-month-bar{width:min(28px,75%);margin:0 auto 7px;border-radius:4px 4px 0 0;background:#0b3d70;min-height:3px;transition:.2s}
    .fc-month-bar.current{background:#e31b23}
    .fc-month-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;text-align:center}
    .fc-month-summary b{display:block;color:#062b55;font-size:16px;margin-top:3px}
    .fc-month-summary span{font-size:9px;color:#718096}
    .fc-pay-total{border:1px solid #e0e7ef;border-radius:10px;padding:12px;background:#fbfcfe}
    .fc-pay-total-label{font-size:10px;color:#65778b}
    .fc-pay-total-value{font-size:24px;font-weight:900;color:#062b55;margin-top:4px}
    .fc-pay-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}
    .fc-pay-mini{border:1px solid #e3e9ef;border-radius:8px;padding:8px;text-align:center;font-size:9px;color:#65778b;min-width:0}
    .fc-pay-mini b{display:block;font-size:16px;color:#062b55;margin:3px 0;overflow-wrap:anywhere}
    .fc-pay-run{width:100%;margin-top:10px}
    .fc-quick{display:grid;gap:7px}
    .fc-quick button{width:100%;display:flex;align-items:center;gap:9px;justify-content:flex-start;background:#fff!important;color:#17324d!important;border:1px solid #dce4ed!important;box-shadow:none!important;font-size:12px!important}
    html[dir="rtl"] .fc-quick button{justify-content:flex-start}
    .fc-quick button:hover{background:#f7f9fc!important;border-color:#c9d6e4!important}
    .fc-quick-icon{font-size:16px;width:22px;text-align:center}
    .fc-list{display:grid}
    .fc-list-row{display:grid;grid-template-columns:1fr auto;gap:10px;padding:10px 0;border-bottom:1px solid #edf1f5;align-items:center;min-width:0}
    .fc-list-row:last-child{border-bottom:0}
    .fc-list-main{min-width:0}
    .fc-list-title{font-size:12px;font-weight:800;color:#17324d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .fc-list-sub{font-size:10px;color:#718096;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .fc-status{display:inline-block;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:800;background:#fff4df;color:#9a5d00;white-space:nowrap}
    .fc-status.ok{background:#e8f6ee;color:#14804a}.fc-status.bad{background:#feeceb;color:#b42318}
    .fc-task-progress{display:grid;gap:10px}
    .fc-task-progress-row{display:grid;grid-template-columns:105px 1fr 34px;gap:8px;align-items:center;font-size:10px;color:#52667b}
    .fc-task-track{height:7px;border-radius:99px;background:#edf1f5;overflow:hidden}
    .fc-task-fill{height:100%;border-radius:99px;background:#e31b23}
    .fc-doc-preview{border:1px solid #d9e2ec;border-radius:9px;background:#fff;overflow:hidden}
    .fc-doc-head{height:44px;border-bottom:1px solid #e31b23;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:6px 9px;font-size:8px;color:#e31b23;font-weight:900}
    .fc-doc-head .fc-doc-logo{width:31px;height:31px;border:2px solid #e31b23;border-radius:6px;display:grid;place-items:center;color:#062b55;font-size:12px;background:#fff}
    .fc-doc-body{padding:15px 14px 19px;text-align:center;min-height:145px;background:linear-gradient(#fff,#fff),radial-gradient(circle,#e31b2308 1px,transparent 1px);background-size:auto,14px 14px}
    .fc-doc-title{font-size:11px;font-weight:900;color:#062b55;margin:15px 0 8px}.fc-doc-lines{display:grid;gap:7px}.fc-doc-line{height:5px;background:#edf1f5;border-radius:99px}.fc-doc-note{font-size:9px;color:#718096;margin-top:11px;line-height:1.4}
    .fc-empty-mini{padding:18px 6px;text-align:center;color:#718096;font-size:11px}
    @media(max-width:1180px){.fc-dash-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}.fc-dash-layout{grid-template-columns:1fr}.fc-dash-right{grid-template-columns:repeat(3,minmax(0,1fr));align-items:start}.fc-dash-right .fc-dash-panel{height:100%}}
    @media(max-width:850px){.fc-dash-toolbar{flex-wrap:wrap}.fc-dash-search-wrap{flex:1 1 100%;max-width:none;order:2}.fc-dash-date{margin:0;order:1;width:100%;text-align:start}.fc-dash-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.fc-dash-two{grid-template-columns:1fr}.fc-dash-right{grid-template-columns:1fr}.fc-attendance-chart{grid-template-columns:1fr}.fc-donut{width:140px;height:140px}.fc-month-bars{height:145px}}
    @media(max-width:520px){.fc-dash-kpis{grid-template-columns:1fr}.fc-dash-kpi{padding:13px}.fc-dash-kpi-value{font-size:24px}.fc-dash-panel-body{padding:12px}.fc-month-summary{grid-template-columns:1fr 1fr 1fr}.fc-pay-cards{grid-template-columns:1fr 1fr 1fr}.fc-task-progress-row{grid-template-columns:92px 1fr 30px}.fc-dash-search{font-size:16px}}
  `;
  document.head.appendChild(style);

  function currentUser(){try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}catch(_){return {};}}
  function isAdmin(){return String(currentUser().role||role||'').toUpperCase()==='ADMIN';}
  function ar(){return document.documentElement.dir==='rtl'||document.documentElement.lang==='ar';}
  function escD(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function dateOnly(v){return v?String(v).slice(0,10):'';}
  function riyadhParts(){const p={};new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit',weekday:'long'}).formatToParts(new Date()).forEach(x=>{if(x.type!=='literal')p[x.type]=x.value;});return p;}
  function riyadhToday(){const p=riyadhParts();return `${p.year}-${p.month}-${p.day}`;}
  function riyadhMonth(){const p=riyadhParts();return `${p.year}-${p.month}`;}
  function monthLabel(key,lang){const m=String(key||'').match(/^(\d{4})-(\d{2})$/);if(!m)return key;return new Intl.DateTimeFormat(lang==='ar'?'ar-SA':'en-US',{timeZone:'Asia/Riyadh',month:'short',year:'numeric'}).format(new Date(Date.UTC(Number(m[1]),Number(m[2])-1,1,12)));}
  function longDate(){return new Intl.DateTimeFormat(ar()?'ar-SA':'en-GB',{timeZone:'Asia/Riyadh',weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(new Date());}
  function activeEmployees(){return (state.employees||[]).filter(e=>String(e.status||'').toLowerCase()!=='inactive');}
  function employeeName(id){const e=(state.employees||[]).find(x=>x.employee_id===id);return e?e.full_name:id;}
  function money(v){return 'SAR '+Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
  function t(en,arabic){return ar()?arabic:en;}

  function monthKeys(count){const p=riyadhParts(),year=Number(p.year),month=Number(p.month);const out=[];for(let i=count-1;i>=0;i--){const d=new Date(Date.UTC(year,month-1-i,1,12));out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`);}return out;}

  function dashboardData(){
    const today=riyadhToday(),month=riyadhMonth(),employees=activeEmployees();
    const attendanceToday=(state.attendance||[]).filter(a=>dateOnly(a.work_date)===today);
    const presentIds=new Set(attendanceToday.filter(a=>String(a.status||'').toLowerCase()!=='absent').map(a=>a.employee_id));
    const approvedToday=(state.leaves||[]).filter(l=>String(l.status||'').toLowerCase()==='approved'&&dateOnly(l.start_date)<=today&&dateOnly(l.end_date)>=today);
    const leaveIds=new Set(approvedToday.map(l=>l.employee_id));
    const lateIds=new Set(attendanceToday.filter(a=>Number(a.late_minutes||0)>0).map(a=>a.employee_id));
    const notChecked=Math.max(0,employees.length-presentIds.size-leaveIds.size);
    const pendingLeaves=(state.leaves||[]).filter(l=>String(l.status||'').toLowerCase()==='pending');
    const pendingTasks=(state.tasks||[]).filter(x=>String(x.status||'').toLowerCase()!=='completed');
    const payroll=(state.payroll||[]).filter(p=>String(p.pay_month||'').slice(0,7)===month);
    return {today,month,employees,attendanceToday,presentIds,leaveIds,lateIds,notChecked,pendingLeaves,pendingTasks,payroll};
  }

  function kpi(icon,label,value,sub,color){return `<div class="fc-dash-kpi" style="--kpi:${color}"><div class="fc-dash-kpi-icon">${icon}</div><div style="min-width:0"><div class="fc-dash-kpi-label">${escD(label)}</div><div class="fc-dash-kpi-value">${escD(value)}</div>${sub?`<div class="fc-dash-kpi-sub">${escD(sub)}</div>`:''}</div></div>`;}

  function attendancePanel(d){
    const total=Math.max(1,d.employees.length),present=d.presentIds.size,late=d.lateIds.size,notChecked=d.notChecked;
    const p1=Math.min(100,present/total*100),p2=Math.min(100,(present+late)/total*100),p3=100;
    return `<div class="fc-dash-panel"><div class="fc-dash-panel-head"><div class="fc-dash-panel-title">${t("Today's Attendance",'حضور اليوم')}</div><button class="fc-dash-link" onclick="render('Attendance')">${t('View All','عرض الكل')}</button></div><div class="fc-dash-panel-body"><div class="fc-attendance-chart"><div class="fc-donut" style="--p1:${COLORS.navy};--p2:${COLORS.red};--p3:#d9e0e8;--a1:${p1}%;--a2:${p2}%"><div class="fc-donut-center"><b>${d.employees.length}</b><span>${t('Active','نشط')}</span></div></div><div class="fc-chart-legend"><div class="fc-chart-legend-row"><span class="fc-dot" style="--dot:${COLORS.navy}"></span><span>${t('Checked In','مسجل حضور')}</span><b>${present}</b></div><div class="fc-chart-legend-row"><span class="fc-dot" style="--dot:${COLORS.red}"></span><span>${t('Late','متأخر')}</span><b>${late}</b></div><div class="fc-chart-legend-row"><span class="fc-dot" style="--dot:#d9e0e8"></span><span>${t('Not Checked In','لم يسجل الحضور')}</span><b>${notChecked}</b></div><div class="fc-chart-legend-row"><span class="fc-dot" style="--dot:${COLORS.green}"></span><span>${t('Approved Leave','إجازة معتمدة')}</span><b>${d.leaveIds.size}</b></div></div></div><div class="fc-chart-foot"><span>${t('Riyadh date','تاريخ الرياض')}: ${d.today}</span><span>${t('Live cloud records','سجلات سحابية مباشرة')}</span></div></div></div>`;
  }

  function monthlyPanel(d){
    const keys=monthKeys(6),counts=keys.map(k=>(state.attendance||[]).filter(a=>dateOnly(a.work_date).slice(0,7)===k).length),max=Math.max(1,...counts),current=d.month;
    const currentRows=(state.attendance||[]).filter(a=>dateOnly(a.work_date).slice(0,7)===current);
    const present=currentRows.filter(a=>String(a.status||'').toLowerCase()==='present').length;
    const attendancePct=currentRows.length?Math.round(present/currentRows.length*100):0;
    const avgHours=present?currentRows.reduce((s,a)=>s+Number(a.working_minutes||0),0)/present/60:0;
    const workingDays=new Set(currentRows.map(a=>dateOnly(a.work_date))).size;
    return `<div class="fc-dash-panel"><div class="fc-dash-panel-head"><div class="fc-dash-panel-title">${t('Monthly Reports','التقارير الشهرية')}</div><button class="fc-dash-link" onclick="render('Reports')">${t('View Reports','عرض التقارير')}</button></div><div class="fc-dash-panel-body"><div class="fc-month-bars">${keys.map((k,i)=>`<div class="fc-month-bar-group"><div class="fc-month-bar ${k===current?'current':''}" style="height:${Math.max(3,Math.round(counts[i]/max*125))}px" title="${escD(monthLabel(k,ar()?'ar':'en'))}: ${counts[i]}"></div><div>${escD(monthLabel(k,ar()?'ar':'en').split(' ')[0])}</div></div>`).join('')}</div><div class="fc-month-summary"><div><span>${t('Recorded Days','الأيام المسجلة')}</span><b>${workingDays}</b></div><div><span>${t('Present %','نسبة الحضور')}</span><b>${attendancePct}%</b></div><div><span>${t('Avg. Working Hrs','متوسط ساعات العمل')}</span><b>${avgHours.toFixed(1)}h</b></div></div></div></div>`;
  }

  function payrollPanel(d){
    const net=d.payroll.reduce((s,p)=>s+Number(p.net_salary||0),0),basic=d.payroll.reduce((s,p)=>s+Number(p.basic_salary||0),0),allow=d.payroll.reduce((s,p)=>s+Number(p.allowances||0),0),ded=d.payroll.reduce((s,p)=>s+Number(p.deductions||0),0);
    return `<div class="fc-dash-panel"><div class="fc-dash-panel-head"><div class="fc-dash-panel-title">${t('Payroll Overview','نظرة عامة على الرواتب')}</div><span style="font-size:10px;color:#718096">${escD(monthLabel(d.month,ar()?'ar':'en'))}</span></div><div class="fc-dash-panel-body"><div class="fc-pay-total"><div class="fc-pay-total-label">${t('Total Payroll','إجمالي الرواتب')}</div><div class="fc-pay-total-value">${money(net)}</div></div><div class="fc-pay-cards"><div class="fc-pay-mini">${t('Records','السجلات')}<b>${d.payroll.length}</b><span>${t('employees','موظف')}</span></div><div class="fc-pay-mini">${t('Allowances','البدلات')}<b>${money(allow)}</b><span>${t('current month','الشهر الحالي')}</span></div><div class="fc-pay-mini">${t('Deductions','الاستقطاعات')}<b>${money(ded)}</b><span>${t('current month','الشهر الحالي')}</span></div></div><button class="fc-pay-run" onclick="render('Payroll')">${t('Open Payroll','فتح الرواتب')}</button><div id="fcDashPaymentState" class="fc-chart-foot"><span>${t('Basic','الأساسي')}: ${money(basic)}</span><span>${t('Loading payment status…','جارٍ تحميل حالة الدفع…')}</span></div></div></div>`;
  }

  function quickPanel(){return `<div class="fc-dash-panel"><div class="fc-dash-panel-head"><div class="fc-dash-panel-title">${t('Quick Actions','إجراءات سريعة')}</div></div><div class="fc-dash-panel-body fc-quick"><button onclick="employeeForm()"><span class="fc-quick-icon">👤</span>${t('Add New Employee','إضافة موظف جديد')}</button><button onclick="render('Attendance')"><span class="fc-quick-icon">🕘</span>${t('View Attendance','عرض الحضور')}</button><button onclick="render('Payroll')"><span class="fc-quick-icon">💰</span>${t('Open Payroll','فتح الرواتب')}</button><button onclick="render('Reports')"><span class="fc-quick-icon">📊</span>${t('Generate Report','إنشاء تقرير')}</button><button onclick="render('Settings')"><span class="fc-quick-icon">⚙️</span>${t('Settings','الإعدادات')}</button></div></div>`;}

  function leavePanel(d){
    const rows=[...(state.leaves||[])].sort((a,b)=>String(b.created_at||b.id||'').localeCompare(String(a.created_at||a.id||''))).slice(0,5);
    const body=rows.length?rows.map(l=>{const status=String(l.status||'Pending'),cls=status==='Approved'?'ok':status==='Rejected'?'bad':'';return `<div class="fc-list-row"><div class="fc-list-main"><div class="fc-list-title">${escD(employeeName(l.employee_id))}</div><div class="fc-list-sub">${escD(l.leave_type||'')} · ${escD(dateOnly(l.start_date))}${l.end_date?' → '+escD(dateOnly(l.end_date)):''}</div></div><span class="fc-status ${cls}">${escD(ar()?({Pending:'معلق',Approved:'معتمد',Rejected:'مرفوض'}[status]||status):status)}</span></div>`;}).join(''):`<div class="fc-empty-mini">${t('No leave requests.','لا توجد طلبات إجازة.')}</div>`;
    return `<div class="fc-dash-panel"><div class="fc-dash-panel-head"><div class="fc-dash-panel-title">${t('Leave Requests','طلبات الإجازة')}</div><button class="fc-dash-link" onclick="render('Leave')">${t('View All','عرض الكل')}</button></div><div class="fc-dash-panel-body fc-list">${body}</div></div>`;
  }

  function taskPanel(){
    const tasks=state.tasks||[],statuses=[['Pending',tasks.filter(x=>x.status==='Pending').length],['In Progress',tasks.filter(x=>x.status==='In Progress').length],['Completed',tasks.filter(x=>x.status==='Completed').length]],total=Math.max(1,tasks.length);
    return `<div class="fc-dash-panel"><div class="fc-dash-panel-head"><div class="fc-dash-panel-title">${t('Task Overview','نظرة عامة على المهام')}</div><button class="fc-dash-link" onclick="render('Tasks')">${t('View All','عرض الكل')}</button></div><div class="fc-dash-panel-body"><div class="fc-task-progress">${statuses.map(([name,count])=>`<div class="fc-task-progress-row"><span>${escD(ar()?({Pending:'معلقة','In Progress':'قيد التنفيذ',Completed:'مكتملة'}[name]||name):name)}</span><div class="fc-task-track"><div class="fc-task-fill" style="width:${Math.round(count/total*100)}%"></div></div><b>${count}</b></div>`).join('')}</div><div class="fc-chart-foot"><span>${t('Total tasks','إجمالي المهام')}: ${tasks.length}</span><span>${t('Cloud data','بيانات سحابية')}</span></div></div></div>`;
  }

  function documentPanel(){
    return `<div class="fc-dash-panel"><div class="fc-dash-panel-head"><div class="fc-dash-panel-title">${t('Document Preview','معاينة المستند')}</div><button class="fc-dash-link" onclick="render('Reports')">${t('Reports','التقارير')}</button></div><div class="fc-dash-panel-body"><div class="fc-doc-preview"><div class="fc-doc-head"><span>FILTER CITY TRADING CO.</span><span class="fc-doc-logo">FC</span><span dir="rtl" style="text-align:right">شركة مدينة الفلاتر للتجارة</span></div><div class="fc-doc-body"><div class="fc-doc-title">${t('HRMS REPORT / CERTIFICATE','تقرير / شهادة نظام الموارد البشرية')}</div><div class="fc-doc-lines"><div class="fc-doc-line" style="width:90%"></div><div class="fc-doc-line" style="width:76%"></div><div class="fc-doc-line" style="width:84%"></div><div class="fc-doc-line" style="width:62%"></div></div><div class="fc-doc-note">${t('Official letterhead integration is the next print-design step.','دمج الترويسة الرسمية هو الخطوة التالية لتصميم الطباعة.')}</div></div></div></div></div>`;
  }

  async function loadPaymentState(month){
    const holder=document.getElementById('fcDashPaymentState');if(!holder)return;
    try{
      const r=await fetch('/api/payroll-payment?pay_month='+encodeURIComponent(month),{headers:{Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')}});
      const d=await r.json().catch(()=>({}));if(!r.ok)throw Error();
      const rows=Array.isArray(d.payroll)?d.payroll:[],paid=rows.filter(x=>x.paid),unpaid=rows.filter(x=>!x.paid);
      holder.innerHTML=`<span>${t('Paid','مدفوع')}: <b>${paid.length}</b></span><span>${t('Unpaid','غير مدفوع')}: <b>${unpaid.length}</b></span>`;
    }catch(_){holder.innerHTML=`<span>${t('Payment status available in Payroll','حالة الدفع متاحة في الرواتب')}</span>`;}
  }

  function renderSearchResults(query){
    const box=document.getElementById('fcDashSearchResults');if(!box)return;
    const q=String(query||'').trim().toLowerCase();if(!q){box.classList.remove('open');box.innerHTML='';return;}
    const modules=[['Dashboard','Dashboard'],['Employees','Employees'],['Attendance','Attendance'],['Tasks','Tasks'],['Leave','Leave'],['Holidays','Holidays'],['Payroll','Payroll'],['EOSB','EOSB'],['Reports','Reports'],['Settings','Settings']];
    const moduleRows=modules.filter(x=>x[0].toLowerCase().includes(q)||(ar()&&({Dashboard:'لوحة التحكم',Employees:'الموظفون',Attendance:'الحضور والانصراف',Tasks:'المهام',Leave:'الإجازات',Holidays:'العطلات',Payroll:'الرواتب',EOSB:'مكافأة نهاية الخدمة',Reports:'التقارير',Settings:'الإعدادات'}[x[0]]||'').includes(q))).slice(0,4).map(x=>`<button class="fc-dash-search-item" onclick="render('${x[1]}')">${escD(ar()?({Dashboard:'لوحة التحكم',Employees:'الموظفون',Attendance:'الحضور والانصراف',Tasks:'المهام',Leave:'الإجازات',Holidays:'العطلات',Payroll:'الرواتب',EOSB:'مكافأة نهاية الخدمة',Reports:'التقارير',Settings:'الإعدادات'}[x[0]]||x[0]):x[0])}</button>`);
    const empRows=(state.employees||[]).filter(e=>String(e.employee_id+' '+e.full_name).toLowerCase().includes(q)).slice(0,5).map(e=>`<button class="fc-dash-search-item" onclick="render('Employees')">👤 ${escD(e.employee_id)} — ${escD(e.full_name)}</button>`);
    const rows=[...moduleRows,...empRows];box.innerHTML=rows.join('')||`<div class="fc-empty-mini">${t('No matching employee or module.','لا يوجد موظف أو قسم مطابق.')}</div>`;box.classList.add('open');
  }
  window.fcDashSearch=function(value){renderSearchResults(value);};

  window.viewDashboard=function(){
    if(!isAdmin())return typeof previousViewDashboard==='function'?previousViewDashboard():'';
    const d=dashboardData();
    setTimeout(()=>loadPaymentState(d.month),80);
    return `<div class="fc-dash"><div class="fc-dash-toolbar"><div class="fc-dash-search-wrap"><input class="fc-dash-search" placeholder="${escD(t('Search employees, modules…','ابحث عن موظف أو قسم…'))}" oninput="fcDashSearch(this.value)" onfocus="fcDashSearch(this.value)"><span class="fc-dash-search-icon">⌕</span><div id="fcDashSearchResults" class="fc-dash-search-results"></div></div><div class="fc-dash-date"><b>${escD(t('HRMS Dashboard','لوحة نظام الموارد البشرية'))}</b><br>${escD(longDate())}</div></div><div class="fc-dash-kpis">${kpi('👥',t('Total Employees','إجمالي الموظفين'),d.employees.length,t('Active employees','الموظفون النشطون'),COLORS.navy)}${kpi('✓',t('Present Today','الحاضرون اليوم'),d.presentIds.size,t('Checked in today','تم تسجيل حضورهم اليوم'),COLORS.red)}${kpi('🗂',t('On Leave','في إجازة'),d.leaveIds.size,t('Approved today','معتمدة اليوم'),COLORS.navy)}${kpi('◷',t('Pending Requests','الطلبات المعلقة'),d.pendingLeaves.length,t('Leave requests','طلبات إجازة'),COLORS.red)}${kpi('☑',t('Pending Tasks','المهام المعلقة'),d.pendingTasks.length,t('Not completed','غير مكتملة'),COLORS.navy)}</div><div class="fc-dash-layout"><div class="fc-dash-left"><div class="fc-dash-two">${attendancePanel(d)}${monthlyPanel(d)}</div><div class="fc-dash-two">${leavePanel(d)}${taskPanel()}</div></div><div class="fc-dash-right">${payrollPanel(d)}${quickPanel()}${documentPanel()}</div></div></div>`;
  };

  document.addEventListener('click',function(e){const wrap=e.target.closest&&e.target.closest('.fc-dash-search-wrap');if(!wrap){const box=document.getElementById('fcDashSearchResults');if(box)box.classList.remove('open');}});

  let lastDir=document.documentElement.dir;
  new MutationObserver(function(){const next=document.documentElement.dir;if(next!==lastDir){lastDir=next;try{if(String(current||'')==='Dashboard')setTimeout(()=>render('Dashboard'),0);}catch(_){}}}).observe(document.documentElement,{attributes:true,attributeFilter:['dir','lang']});

  try{if(String(current||'')==='Dashboard')setTimeout(()=>render('Dashboard'),0);}catch(_){}
})();
