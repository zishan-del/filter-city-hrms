(function(){
  'use strict';
  if(window.__fcAttendanceInspectionStep9A)return;
  window.__fcAttendanceInspectionStep9A=true;

  let schedules=[];
  let history=[];
  let audit=[];
  let metaPromise=null;
  const cache={};

  function currentUser(){try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}catch(_){return {};}}
  function isAdmin(){return String(currentUser().role||'').toUpperCase()==='ADMIN';}
  function esc9(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function dateOnly(v){return v?String(v).slice(0,10):'';}
  function mins(v){const n=Math.max(0,Math.round(Number(v||0)));return Math.floor(n/60)+'h '+(n%60)+'m';}
  function monthLabel(value){const m=String(value||'').match(/^(\d{4})-(\d{2})$/);if(!m)return value||'';return new Intl.DateTimeFormat('en',{timeZone:'Asia/Riyadh',month:'long',year:'numeric'}).format(new Date(Date.UTC(Number(m[1]),Number(m[2])-1,1,12)));}
  function riyadhNow(){const p={};new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).forEach(x=>{if(x.type!=='literal')p[x.type]=x.value;});return {date:`${p.year}-${p.month}-${p.day}`,month:`${p.year}-${p.month}`,minutes:Number(p.hour)*60+Number(p.minute)};}
  function employeeFor(id){return (state.employees||[]).find(e=>e.employee_id===id)||null;}
  function employeeName(id){const e=employeeFor(id);return e?e.full_name:id;}
  function selectedEmployee(){return document.getElementById('fc9_employee')?.value||'';}
  function selectedMonth(){return document.getElementById('fc9_month')?.value||riyadhNow().month;}
  function datesInMonth(month){const m=String(month||'').match(/^(\d{4})-(\d{2})$/);if(!m)return [];const y=Number(m[1]),mo=Number(m[2]),last=new Date(Date.UTC(y,mo,0)).getUTCDate();return Array.from({length:last},(_,i)=>`${m[1]}-${m[2]}-${String(i+1).padStart(2,'0')}`);}
  function dayName(date){return new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Riyadh',weekday:'short'}).format(new Date(date+'T12:00:00Z'));}
  function clockMinutes(value){const m=String(value||'').match(/^(\d{2}):(\d{2})/)||String(value||'').match(/[T\s](\d{2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):null;}
  function scheduleFor(employeeId,date){const versions=history.filter(s=>s.employee_id===employeeId&&s.start_time&&s.end_time&&dateOnly(s.effective_from)<=date).sort((a,b)=>dateOnly(b.effective_from).localeCompare(dateOnly(a.effective_from)));if(versions.length)return versions[0];const fallback=schedules.find(s=>s.employee_id===employeeId&&s.start_time&&s.end_time)||null;if(!fallback)return null;const effective=dateOnly(fallback.effective_from);return !effective||effective<=date?fallback:null;}
  function holidayFor(date){return (state.holidays||[]).find(h=>dateOnly(h.holiday_date)===date)||null;}
  function leaveFor(employeeId,date){return (state.leaves||[]).find(l=>l.employee_id===employeeId&&String(l.status||'').toLowerCase()==='approved'&&dateOnly(l.start_date)<=date&&dateOnly(l.end_date)>=date)||null;}
  function attendanceFor(employeeId,date){return (state.attendance||[]).find(a=>a.employee_id===employeeId&&dateOnly(a.work_date)===date)||null;}
  function auditsFor(attendanceId){return audit.filter(a=>String(a.attendance_id)===String(attendanceId));}
  function gpsText(a){const inGps=a&&a.latitude!=null?`${a.latitude}, ${a.longitude}${a.checkin_accuracy?` ±${a.checkin_accuracy}m`:''}`:'—';const outGps=a&&a.checkout_latitude!=null?`${a.checkout_latitude}, ${a.checkout_longitude}${a.checkout_accuracy?` ±${a.checkout_accuracy}m`:''}`:'—';return {inGps,outGps};}

  async function loadMeta(force){
    if((history.length||schedules.length)&&!force)return;
    if(metaPromise&&!force)return metaPromise;
    metaPromise=(async()=>{
      const r=await fetch('/api/work-schedule',{headers:{Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')}});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw Error(d.error||'Could not load schedule/audit history');
      schedules=Array.isArray(d.schedules)?d.schedules:[];
      history=Array.isArray(d.history)?d.history:[];
      audit=Array.isArray(d.attendance_audit)?d.attendance_audit:[];
    })();
    try{await metaPromise;}finally{metaPromise=null;}
  }

  function build(employeeId,month){
    const now=riyadhNow(),employee=employeeFor(employeeId),joining=dateOnly(employee?.joining_date);
    const rows=[];
    const summary={recorded:0,present:0,absent:0,scheduledDue:0,lateDays:0,earlyDays:0,overtimeDays:0,breakOverDays:0,nightDays:0,leaveDays:0,holidayDays:0,offDays:0,corrections:0,working:0,late:0,early:0,overtime:0,breakOver:0,night:0,versions:new Set()};

    datesInMonth(month).forEach(date=>{
      if(joining&&date<joining)return;
      const s=scheduleFor(employeeId,date);
      const attendance=attendanceFor(employeeId,date);
      const holiday=holidayFor(date);
      const leave=leaveFor(employeeId,date);
      const weekday=dayName(date);
      const workDays=new Set(String(s?.work_days||'').split(',').filter(Boolean));
      const scheduled=!!s&&workDays.has(weekday);
      let classification='NO_SCHEDULE';
      if(s){
        const effective=dateOnly(s.effective_from);if(effective)summary.versions.add(effective);
        if(!scheduled)classification='OFF_DAY';
        else if(holiday)classification='HOLIDAY';
        else if(leave)classification='APPROVED_LEAVE';
        else classification='SCHEDULED';
      }
      let due=false;
      if(classification==='SCHEDULED'){
        if(date<now.date)due=true;
        else if(date===now.date){
          if(attendance)due=true;
          else {const start=clockMinutes(s.start_time);let end=clockMinutes(s.end_time);if(start!=null&&end!=null){if(end<=start)end+=1440;due=now.minutes>end;}}
        }
      }
      if(due)summary.scheduledDue++;
      if(classification==='OFF_DAY'&&date<=now.date)summary.offDays++;
      if(classification==='HOLIDAY'&&date<=now.date)summary.holidayDays++;
      if(classification==='APPROVED_LEAVE'&&date<=now.date)summary.leaveDays++;

      if(attendance){
        summary.recorded++;
        if(String(attendance.status||'').toLowerCase()==='present')summary.present++;
        const late=Number(attendance.late_minutes||0),early=Number(attendance.early_checkout_minutes||0),ot=Number(attendance.overtime_minutes||0),bo=Number(attendance.break_over_minutes||0),night=Number(attendance.night_minutes||0),work=Number(attendance.working_minutes||0);
        summary.working+=work;summary.late+=late;summary.early+=early;summary.overtime+=ot;summary.breakOver+=bo;summary.night+=night;
        if(late>0)summary.lateDays++;if(early>0)summary.earlyDays++;if(ot>0)summary.overtimeDays++;if(bo>0)summary.breakOverDays++;if(night>0)summary.nightDays++;
        const events=auditsFor(attendance.id),corrections=events.filter(a=>String(a.action||'').toUpperCase()==='ADMIN_CORRECTION');summary.corrections+=corrections.length;
        const gps=gpsText(attendance);
        rows.push({date,classification,schedule:s,effective:dateOnly(s?.effective_from)||'—',attendance,status:attendance.status||'',gps,corrections});
      }else if(due){
        summary.absent++;
        rows.push({date,classification:'ABSENT_SCHEDULED',schedule:s,effective:dateOnly(s?.effective_from)||'—',attendance:null,status:'Absent — Scheduled',gps:{inGps:'—',outGps:'—'},corrections:[]});
      }
    });
    return {employee,month,rows,summary};
  }

  function summaryCards(s){
    const cards=[['Recorded Days',s.recorded],['Present',s.present],['True Absent',s.absent],['Scheduled Days Due',s.scheduledDue],['Late Days',s.lateDays],['Early Days',s.earlyDays],['Overtime Days',s.overtimeDays],['Break Over Days',s.breakOverDays],['Night Work Days',s.nightDays],['Approved Leave Days',s.leaveDays],['Holiday Days',s.holidayDays],['Off Days',s.offDays],['Admin Corrections',s.corrections]];
    return '<div class="cards" style="padding:16px">'+cards.map(x=>`<div class="card">${esc9(x[0])}<div class="stat">${esc9(x[1])}</div></div>`).join('')+'</div>';
  }

  function reportHtml(data){
    const s=data.summary,e=data.employee||{};
    const versions=[...s.versions].sort();
    const totals=`Working ${mins(s.working)} · Late ${mins(s.late)} · Early ${mins(s.early)} · Overtime ${mins(s.overtime)} · Break over ${mins(s.breakOver)} · Night ${mins(s.night)}`;
    const rows=data.rows.length?data.rows.map(r=>{
      const a=r.attendance||{},breakText=a.break_start?(a.break_end?`${a.break_start} → ${a.break_end} (${mins(a.break_duration_minutes)})`:a.break_start):'—';
      return `<tr><td>${esc9(r.date)}</td><td>${esc9(r.classification)}</td><td>${esc9(r.effective)}</td><td>${esc9(a.check_in||'—')}</td><td>${esc9(breakText)}</td><td>${esc9(a.check_out||'—')}</td><td>${esc9(a.working_minutes?mins(a.working_minutes):'—')}</td><td>${esc9(mins(a.late_minutes))}</td><td>${esc9(mins(a.early_checkout_minutes))}</td><td>${esc9(mins(a.overtime_minutes))}</td><td>${esc9(mins(a.break_over_minutes))}</td><td>${esc9(mins(a.night_minutes))}</td><td style="white-space:normal;min-width:200px">IN: ${esc9(r.gps.inGps)}<br>OUT: ${esc9(r.gps.outGps)}</td><td>${r.corrections.length}</td><td><span class="badge">${esc9(r.status)}</span></td></tr>`;
    }).join(''):`<tr><td colspan="15" class="empty">No due attendance/absence rows for ${esc9(monthLabel(data.month))}.</td></tr>`;
    return `<div class="section" style="margin-top:14px"><div class="section-head"><div><b>${esc9(e.employee_id||'')} — ${esc9(e.full_name||'')} · ${esc9(monthLabel(data.month))}</b><div class="muted" style="font-size:12px;margin-top:4px">Inspection-ready attendance record · Riyadh time · Schedule versions: ${esc9(versions.join(', ')||'none')}</div></div><span class="badge">Report only · no DB writes</span></div>${summaryCards(s)}<div style="padding:0 16px 14px" class="muted">${esc9(totals)}. True absence is calculated from the effective schedule while excluding off days, holidays, approved leave, pre-joining dates, and future/in-progress workdays.</div><div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Classification</th><th>Schedule Effective</th><th>Check In</th><th>Break</th><th>Check Out</th><th>Working</th><th>Late</th><th>Early</th><th>Overtime</th><th>Break Over</th><th>Night</th><th>GPS</th><th>Corrections</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }

  window.fc9Render=async function(){
    const holder=document.getElementById('fc9_result');if(!holder)return;
    const employeeId=selectedEmployee(),month=selectedMonth();if(!employeeId)return toast('Choose an employee');
    holder.innerHTML='<div class="empty">Building inspection attendance report…</div>';
    try{await loadMeta(false);const data=build(employeeId,month);cache[employeeId+'|'+month]=data;holder.innerHTML=reportHtml(data);}catch(e){holder.innerHTML='<div class="empty">'+esc9(e.message||'Could not build inspection report')+'</div>';if(typeof toast==='function')toast(e.message||'Could not build inspection report');}
  };

  window.fc9ExportCsv=async function(){
    const employeeId=selectedEmployee(),month=selectedMonth();if(!employeeId)return toast('Choose an employee');
    try{await loadMeta(false);const data=cache[employeeId+'|'+month]||build(employeeId,month);const out=[['Employee ID','Employee','Date','Classification','Schedule Effective','Check In','Break Start','Break End','Break Minutes','Check Out','Working Minutes','Late Minutes','Early Minutes','Overtime Minutes','Break Over Minutes','Night Minutes','Check-in GPS','Checkout GPS','Admin Corrections','Status']];data.rows.forEach(r=>{const a=r.attendance||{};out.push([employeeId,employeeName(employeeId),r.date,r.classification,r.effective,a.check_in||'',a.break_start||'',a.break_end||'',Number(a.break_duration_minutes||0),a.check_out||'',Number(a.working_minutes||0),Number(a.late_minutes||0),Number(a.early_checkout_minutes||0),Number(a.overtime_minutes||0),Number(a.break_over_minutes||0),Number(a.night_minutes||0),r.gps.inGps,r.gps.outGps,r.corrections.length,r.status]);});const csv=out.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download=`${employeeId}-inspection-attendance-${month}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);}catch(e){if(typeof toast==='function')toast(e.message||'Could not export inspection report');}
  };

  window.fc9Print=async function(){
    const employeeId=selectedEmployee(),month=selectedMonth();if(!employeeId)return toast('Choose an employee');
    try{await loadMeta(false);const data=cache[employeeId+'|'+month]||build(employeeId,month),s=data.summary,e=data.employee||{},company=(state.settings&&state.settings.company)||'FILTER CITY',versions=[...s.versions].sort().join(', ')||'none';const w=window.open('','_blank');if(!w)return toast('Allow pop-ups to print the report');const rows=data.rows.length?data.rows.map(r=>{const a=r.attendance||{};return `<tr><td>${esc9(r.date)}</td><td>${esc9(r.classification)}</td><td>${esc9(r.effective)}</td><td>${esc9(a.check_in||'—')}</td><td>${esc9(a.check_out||'—')}</td><td>${esc9(a.working_minutes?mins(a.working_minutes):'—')}</td><td>${esc9(mins(a.late_minutes))}</td><td>${esc9(mins(a.early_checkout_minutes))}</td><td>${esc9(mins(a.overtime_minutes))}</td><td>${esc9(mins(a.break_over_minutes))}</td><td>${esc9(mins(a.night_minutes))}</td><td>${r.corrections.length}</td><td>${esc9(r.status)}</td></tr>`;}).join(''):'<tr><td colspan="13">No due attendance/absence rows.</td></tr>';
      w.document.open();w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc9(company)} Attendance ${esc9(month)}</title><style>body{font-family:Arial,sans-serif;color:#111;padding:22px}h1{margin:0 0 3px;font-size:25px}h2{margin:0 0 6px;font-size:18px}.muted{color:#555;font-size:11px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0}.box{border:1px solid #bbb;padding:9px}.big{font-size:18px;font-weight:bold;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:14px;font-size:9px}th,td{border:1px solid #bbb;padding:5px;text-align:left}th{background:#eee}.foot{margin-top:14px;font-size:10px}@media print{body{padding:0}}</style></head><body><h1>${esc9(company)}</h1><h2>Monthly Attendance Inspection Report — ${esc9(monthLabel(month))}</h2><div class="muted">Employee: ${esc9(employeeId)} — ${esc9(e.full_name||'')} · Generated from FILTER CITY HRMS · Saudi/Riyadh · Schedule version(s): ${esc9(versions)}</div><div class="summary"><div class="box">Present<div class="big">${s.present}</div></div><div class="box">True Absent<div class="big">${s.absent}</div></div><div class="box">Scheduled Due<div class="big">${s.scheduledDue}</div></div><div class="box">Admin Corrections<div class="big">${s.corrections}</div></div><div class="box">Late Days<div class="big">${s.lateDays}</div></div><div class="box">Early Days<div class="big">${s.earlyDays}</div></div><div class="box">Overtime Days<div class="big">${s.overtimeDays}</div></div><div class="box">Break Over Days<div class="big">${s.breakOverDays}</div></div><div class="box">Night Work Days<div class="big">${s.nightDays}</div></div><div class="box">Approved Leave Days<div class="big">${s.leaveDays}</div></div><div class="box">Holiday Days<div class="big">${s.holidayDays}</div></div><div class="box">Off Days<div class="big">${s.offDays}</div></div></div><div class="muted">Totals: Working ${mins(s.working)} · Late ${mins(s.late)} · Early ${mins(s.early)} · Overtime ${mins(s.overtime)} · Break over ${mins(s.breakOver)} · Night ${mins(s.night)}</div><table><thead><tr><th>Date</th><th>Class</th><th>Schedule</th><th>Check In</th><th>Check Out</th><th>Work</th><th>Late</th><th>Early</th><th>OT</th><th>Break Over</th><th>Night</th><th>Corrections</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><div class="foot">True absence is report-derived from effective schedules and excludes off days, holidays, approved leave, dates before joining and future/in-progress workdays. This report is an HRMS operational record and is not a legal certification.</div></body></html>`);w.document.close();setTimeout(()=>{w.focus();w.print();},300);
    }catch(e){if(typeof toast==='function')toast(e.message||'Could not print inspection report');}
  };

  const previousViewReports=window.viewReports;
  window.viewReports=function(){
    const base=typeof previousViewReports==='function'?previousViewReports():'';
    if(!isAdmin())return base;
    const employees=(state.employees||[]).filter(e=>e.status!=='Inactive');
    const options=employees.map(e=>`<option value="${esc9(e.employee_id)}">${esc9(e.employee_id)} — ${esc9(e.full_name)}</option>`).join('');
    const month=riyadhNow().month;
    const panel=`<div class="section"><div class="section-head"><b>🧾 Attendance Inspection Report — Step 9A</b><span class="badge">Admin · report only</span></div><div style="padding:16px"><div class="muted" style="margin-bottom:12px">Monthly inspection-ready attendance statement with schedule history, true absence, late/early/overtime, break overage, night work, leave/holiday/off-day counts, GPS, and correction counts. No attendance data is changed.</div><div class="actions" style="align-items:end;gap:12px"><div class="field" style="margin:0;min-width:290px"><label>Employee</label><select id="fc9_employee">${options}</select></div><div class="field" style="margin:0"><label>Month</label><input id="fc9_month" type="month" value="${esc9(month)}"></div><button onclick="fc9Render()">View Inspection Report</button><button class="secondary" onclick="fc9ExportCsv()">Export CSV</button><button class="secondary" onclick="fc9Print()">Print / Save PDF</button></div></div><div id="fc9_result"><div class="empty">Choose employee/month and click View Inspection Report.</div></div></div>`;
    return panel+base;
  };
})();
