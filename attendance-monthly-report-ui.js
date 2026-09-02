(function(){
  'use strict';
  if(window.__fcAttendanceMonthlyReport) return;
  window.__fcAttendanceMonthlyReport = true;

  const previousViewReports = window.viewReports;
  let schedules=[];
  let schedulePromise=null;

  const escR5 = window.esc || function(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g,function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  };

  function user(){
    try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}catch(_){return {};}
  }
  function isAdmin(){return String(user().role||'').toUpperCase()==='ADMIN';}
  function riyadhNow(){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    const p={};parts.forEach(x=>{if(x.type!=='literal')p[x.type]=x.value;});
    return {date:`${p.year}-${p.month}-${p.day}`,month:`${p.year}-${p.month}`,minutes:Number(p.hour)*60+Number(p.minute)};
  }
  function riyadhMonth(){return riyadhNow().month;}
  function monthLabel(value){
    const m=String(value||'').match(/^(\d{4})-(\d{2})$/);
    if(!m)return value||'';
    return new Intl.DateTimeFormat('en',{timeZone:'Asia/Riyadh',month:'long',year:'numeric'}).format(new Date(Date.UTC(Number(m[1]),Number(m[2])-1,1,12)));
  }
  function mins(value){
    const n=Math.max(0,Math.round(Number(value||0)));
    return Math.floor(n/60)+'h '+(n%60)+'m';
  }
  function dateOnly(value){return value?String(value).slice(0,10):'';}
  function gps(lat,lng,acc){
    if(lat==null||lng==null)return '—';
    return `${lat}, ${lng}${acc?` ±${acc}m`:''}`;
  }
  function employeeName(id){
    const e=(state.employees||[]).find(x=>x.employee_id===id);
    return e?e.full_name:id;
  }
  function employeeFor(id){return (state.employees||[]).find(x=>x.employee_id===id)||null;}
  function selectedEmployee(){return document.getElementById('fc_r5_employee')?.value||'';}
  function selectedMonth(){return document.getElementById('fc_r5_month')?.value||riyadhMonth();}
  function rowsFor(employeeId,month){
    return (state.attendance||[])
      .filter(a=>a.employee_id===employeeId && dateOnly(a.work_date).slice(0,7)===month)
      .sort((a,b)=>dateOnly(a.work_date).localeCompare(dateOnly(b.work_date)));
  }
  function sum(rows,key){return rows.reduce((total,row)=>total+Number(row[key]||0),0);}
  function scheduleFor(employeeId){return schedules.find(s=>s.employee_id===employeeId&&s.start_time&&s.end_time)||null;}
  function dayName(date){
    return new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Riyadh',weekday:'short'}).format(new Date(date+'T12:00:00Z'));
  }
  function clockMinutes(value){
    const m=String(value||'').match(/^(\d{2}):(\d{2})/);
    return m?Number(m[1])*60+Number(m[2]):null;
  }
  function datesInMonth(month){
    const m=String(month||'').match(/^(\d{4})-(\d{2})$/);
    if(!m)return [];
    const y=Number(m[1]),mo=Number(m[2]),last=new Date(Date.UTC(y,mo,0)).getUTCDate();
    return Array.from({length:last},(_,i)=>`${m[1]}-${m[2]}-${String(i+1).padStart(2,'0')}`);
  }
  function holidayFor(date){return (state.holidays||[]).find(h=>dateOnly(h.holiday_date)===date)||null;}
  function approvedLeaveFor(employeeId,date){
    return (state.leaves||[]).find(l=>l.employee_id===employeeId&&String(l.status||'').toLowerCase()==='approved'&&dateOnly(l.start_date)<=date&&dateOnly(l.end_date)>=date)||null;
  }
  function attendanceFor(rows,date){return rows.find(a=>dateOnly(a.work_date)===date)||null;}

  async function loadSchedules(force){
    if(schedules.length&&!force)return schedules;
    if(schedulePromise&&!force)return schedulePromise;
    schedulePromise=(async function(){
      const r=await fetch('/api/work-schedule',{headers:{Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')}});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw Error(d.error||'Could not load work schedules');
      schedules=Array.isArray(d.schedules)?d.schedules:[];
      return schedules;
    })();
    try{return await schedulePromise;}finally{schedulePromise=null;}
  }

  function absenceAnalysis(employeeId,month,attendanceRows){
    const schedule=scheduleFor(employeeId);
    const now=riyadhNow();
    const employee=employeeFor(employeeId);
    const joining=dateOnly(employee?.joining_date);
    const out={schedule,scheduledDue:0,absentDates:[],offDays:0,holidays:0,leaveDays:0,futureOrPending:0};
    if(!schedule)return out;

    const workDays=new Set(String(schedule.work_days||'').split(',').filter(Boolean));
    const start=clockMinutes(schedule.start_time);
    let end=clockMinutes(schedule.end_time);
    if(start==null||end==null)return out;
    const overnight=end<=start;
    if(overnight)end+=1440;

    datesInMonth(month).forEach(date=>{
      if(joining&&date<joining)return;
      const weekday=dayName(date);
      if(!workDays.has(weekday)){if(date<=now.date)out.offDays++;return;}
      if(holidayFor(date)){if(date<=now.date)out.holidays++;return;}
      if(approvedLeaveFor(employeeId,date)){if(date<=now.date)out.leaveDays++;return;}

      const attendance=attendanceFor(attendanceRows,date);
      let due=false;
      if(date<now.date)due=true;
      else if(date===now.date){
        if(attendance)due=true;
        else if(!overnight&&now.minutes>end)due=true;
      }

      if(!due){out.futureOrPending++;return;}
      out.scheduledDue++;
      if(!attendance||String(attendance.status||'').toLowerCase()==='absent')out.absentDates.push(date);
    });
    return out;
  }

  function displayRows(employeeId,month){
    const actual=rowsFor(employeeId,month);
    const analysis=absenceAnalysis(employeeId,month,actual);
    const absentSet=new Set(analysis.absentDates);
    const byDate=new Map(actual.map(a=>[dateOnly(a.work_date),a]));
    analysis.absentDates.forEach(date=>{
      if(!byDate.has(date))byDate.set(date,{employee_id:employeeId,work_date:date,status:'Absent',__scheduledAbsent:true});
    });
    return {actual,analysis,rows:[...byDate.values()].sort((a,b)=>dateOnly(a.work_date).localeCompare(dateOnly(b.work_date))),absentSet};
  }

  function reportMarkup(employeeId,month){
    if(!employeeId)return '<div class="empty">Choose an employee to view the monthly attendance report.</div>';
    const info=displayRows(employeeId,month);
    const rows=info.actual,display=info.rows,analysis=info.analysis;
    const present=rows.filter(r=>String(r.status||'').toLowerCase()==='present').length;
    const absent=analysis.schedule?analysis.absentDates.length:rows.filter(r=>String(r.status||'').toLowerCase()==='absent').length;
    const working=sum(rows,'working_minutes');
    const breakM=sum(rows,'break_duration_minutes');
    const late=sum(rows,'late_minutes');
    const early=sum(rows,'early_checkout_minutes');
    const overtime=sum(rows,'overtime_minutes');
    const night=sum(rows,'night_minutes');
    const employee=employeeName(employeeId);
    const scheduleBadge=analysis.schedule?'Schedule-based absence':'No schedule — recorded rows only';
    const note=analysis.schedule
      ? `True absence = scheduled workday due with no attendance, excluding off days, holidays, approved leave, dates before joining, and future/in-progress workdays. Current saved schedule (${String(analysis.schedule.work_days||'')} · ${String(analysis.schedule.start_time||'').slice(0,5)}–${String(analysis.schedule.end_time||'').slice(0,5)}) is applied to this selected month. Excluded so far: ${analysis.offDays} off day(s), ${analysis.holidays} holiday(s), ${analysis.leaveDays} approved leave day(s).`
      : 'No saved work schedule exists for this employee, so absence cannot be inferred safely; only recorded attendance rows are shown.';

    return '<div class="section" style="margin-top:14px">'+
      '<div class="section-head"><b>'+escR5(employeeId)+' — '+escR5(employee)+' · '+escR5(monthLabel(month))+'</b><span class="badge">'+escR5(scheduleBadge)+'</span></div>'+
      '<div class="cards" style="padding:16px">'+
        '<div class="card">Recorded Days<div class="stat">'+rows.length+'</div></div>'+
        '<div class="card">Present<div class="stat">'+present+'</div></div>'+
        '<div class="card">True Absent<div class="stat">'+absent+'</div></div>'+
        '<div class="card">Scheduled Days Due<div class="stat">'+(analysis.schedule?analysis.scheduledDue:'—')+'</div></div>'+
      '</div>'+
      '<div class="cards" style="padding:0 16px 16px">'+
        '<div class="card">Working<div class="stat" style="font-size:21px">'+mins(working)+'</div></div>'+
        '<div class="card">Break<div class="stat" style="font-size:21px">'+mins(breakM)+'</div></div>'+
        '<div class="card">Late<div class="stat" style="font-size:21px">'+mins(late)+'</div></div>'+
        '<div class="card">Early<div class="stat" style="font-size:21px">'+mins(early)+'</div></div>'+
      '</div>'+
      '<div class="cards" style="padding:0 16px 16px">'+
        '<div class="card">Overtime<div class="stat" style="font-size:21px">'+mins(overtime)+'</div></div>'+
        '<div class="card">Night<div class="stat" style="font-size:21px">'+mins(night)+'</div></div>'+
      '</div>'+
      '<div style="padding:0 16px 14px" class="muted">'+escR5(note)+'</div>'+
      '<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Check In</th><th>Check-in GPS</th><th>Break</th><th>Check Out</th><th>Checkout GPS</th><th>Working</th><th>Late</th><th>Early</th><th>Overtime</th><th>Night</th><th>Status</th></tr></thead><tbody>'+
      (display.length?display.map(a=>'<tr>'+
        '<td>'+escR5(dateOnly(a.work_date))+'</td>'+
        '<td>'+escR5(a.check_in||'—')+'</td>'+
        '<td>'+escR5(gps(a.latitude,a.longitude,a.checkin_accuracy))+'</td>'+
        '<td>'+escR5(a.break_start?(a.break_end?`${a.break_start} → ${a.break_end} (${mins(a.break_duration_minutes)})`:`Started ${a.break_start}`):'—')+'</td>'+
        '<td>'+escR5(a.check_out||'—')+'</td>'+
        '<td>'+escR5(gps(a.checkout_latitude,a.checkout_longitude,a.checkout_accuracy))+'</td>'+
        '<td>'+escR5(a.working_minutes?mins(a.working_minutes):'—')+'</td>'+
        '<td>'+escR5(mins(a.late_minutes))+'</td>'+
        '<td>'+escR5(mins(a.early_checkout_minutes))+'</td>'+
        '<td>'+escR5(mins(a.overtime_minutes))+'</td>'+
        '<td>'+escR5(mins(a.night_minutes))+'</td>'+
        '<td><span class="badge">'+escR5(a.__scheduledAbsent?'Absent — Scheduled':(a.status||''))+'</span></td>'+
      '</tr>').join(''):'<tr><td colspan="12" class="empty">No attendance or scheduled absence records for '+escR5(monthLabel(month))+'.</td></tr>')+
      '</tbody></table></div></div>';
  }

  window.fcRenderAttendanceMonthlyReport=async function(){
    const holder=document.getElementById('fc_r5_result');
    if(!holder)return;
    holder.innerHTML='<div class="empty">Calculating scheduled attendance and absence…</div>';
    try{
      await loadSchedules(false);
      holder.innerHTML=reportMarkup(selectedEmployee(),selectedMonth());
    }catch(e){
      holder.innerHTML='<div class="empty">'+escR5(e.message||'Could not load work schedules')+'</div>';
      if(typeof toast==='function')toast(e.message||'Could not load work schedules');
    }
  };

  window.fcDownloadAttendanceMonthlyCsv=async function(){
    const employeeId=selectedEmployee(),month=selectedMonth();
    if(!employeeId)return toast('Choose an employee first');
    try{await loadSchedules(false);}catch(e){if(typeof toast==='function')toast(e.message||'Could not load work schedules');return;}
    const info=displayRows(employeeId,month);
    const data=[['Employee ID','Employee','Date','Check In','Check-in GPS','Break Start','Break End','Break Minutes','Check Out','Checkout GPS','Working Minutes','Late Minutes','Early Minutes','Overtime Minutes','Night Minutes','Status','Absence Basis']];
    info.rows.forEach(a=>data.push([employeeId,employeeName(employeeId),dateOnly(a.work_date),a.check_in||'',gps(a.latitude,a.longitude,a.checkin_accuracy),a.break_start||'',a.break_end||'',Number(a.break_duration_minutes||0),a.check_out||'',gps(a.checkout_latitude,a.checkout_longitude,a.checkout_accuracy),Number(a.working_minutes||0),Number(a.late_minutes||0),Number(a.early_checkout_minutes||0),Number(a.overtime_minutes||0),Number(a.night_minutes||0),a.__scheduledAbsent?'Absent — Scheduled':(a.status||''),a.__scheduledAbsent?'Scheduled workday due; no attendance; not holiday/approved leave/off day':'' ]));
    const csv=data.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    a.download=`${employeeId}-attendance-${month}.csv`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  };

  window.viewReports=function(){
    if(!isAdmin())return '<div class="section"><div class="empty">Admin only.</div></div>';
    const base=typeof previousViewReports==='function'?previousViewReports():'';
    const employees=(state.employees||[]).filter(e=>e.status!=='Inactive');
    const options=employees.map(e=>'<option value="'+escR5(e.employee_id)+'">'+escR5(e.employee_id)+' — '+escR5(e.full_name)+'</option>').join('');
    const month=riyadhMonth();
    const step7d='<div class="section"><div class="section-head"><b>📊 Monthly Employee Attendance Report — Step 7D</b><span class="badge">Admin · schedule-based absence</span></div>'+
      '<div class="form-grid">'+
        '<div class="field"><label>Employee</label><select id="fc_r5_employee">'+options+'</select></div>'+
        '<div class="field"><label>Month</label><input id="fc_r5_month" type="month" value="'+escR5(month)+'"></div>'+
        '<div class="field" style="align-self:end"><div class="actions"><button onclick="fcRenderAttendanceMonthlyReport()">View Report</button><button class="secondary" onclick="fcDownloadAttendanceMonthlyCsv()">Export CSV</button></div></div>'+
      '</div><div id="fc_r5_result"><div class="empty">Calculating scheduled attendance and absence…</div></div></div>';
    setTimeout(()=>window.fcRenderAttendanceMonthlyReport(),0);
    return step7d+base;
  };

  if(typeof render==='function'&&current==='Reports')render('Reports');
})();
