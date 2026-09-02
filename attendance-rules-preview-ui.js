(function(){
  'use strict';
  if(window.__fcAttendanceRulesStep7B)return;
  window.__fcAttendanceRulesStep7B=true;

  let schedules=[];
  let schedulesLoaded=false;
  let schedulesLoading=false;

  function currentUser(){try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}catch(_){return {};}}
  function isAdmin(){return String(currentUser().role||'').toUpperCase()==='ADMIN';}
  function escB(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function dateOnly(v){return v?String(v).slice(0,10):'';}
  function time5(v){return v?String(v).slice(0,5):'';}
  function minsText(value){const n=Math.max(0,Math.round(Number(value||0)));return Math.floor(n/60)+'h '+(n%60)+'m';}
  function employeeName(id){const e=(state.employees||[]).find(x=>x.employee_id===id);return e?e.full_name:id;}

  function riyadhNow(){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    const out={};parts.forEach(p=>{if(p.type!=='literal')out[p.type]=p.value;});
    return {date:`${out.year}-${out.month}-${out.day}`,minutes:Number(out.hour)*60+Number(out.minute)};
  }
  function dayName(date){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||'')))return '';
    return new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Riyadh',weekday:'short'}).format(new Date(date+'T12:00:00Z'));
  }
  function timeMinutes(v){
    const m=String(v||'').match(/(\d{2}):(\d{2})/);
    if(!m)return null;
    const h=Number(m[1]),min=Number(m[2]);
    return h>=0&&h<24&&min>=0&&min<60?h*60+min:null;
  }
  function storedClockMinutes(v){
    if(!v)return null;
    const s=String(v);
    const m=s.match(/[T\s](\d{2}):(\d{2})/)||s.match(/^(\d{2}):(\d{2})/);
    if(!m)return null;
    return Number(m[1])*60+Number(m[2]);
  }
  function normalizedClock(clock,start,overnight){
    if(clock==null)return null;
    return overnight&&clock<start?clock+1440:clock;
  }

  async function loadSchedules(){
    if(schedulesLoaded||schedulesLoading)return;
    schedulesLoading=true;
    try{
      const r=await fetch('/api/work-schedule',{headers:{Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')}});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw Error(d.error||'Could not load work schedules');
      schedules=Array.isArray(d.schedules)?d.schedules:[];
      schedulesLoaded=true;
    }catch(e){
      console.error('Step 7B schedule load failed',e);
    }finally{
      schedulesLoading=false;
    }
  }

  function scheduleFor(employeeId){return schedules.find(s=>s.employee_id===employeeId&&s.start_time&&s.end_time)||null;}
  function attendanceFor(employeeId,date){return (state.attendance||[]).find(a=>a.employee_id===employeeId&&dateOnly(a.work_date)===date)||null;}
  function approvedLeave(employeeId,date){return (state.leaves||[]).find(l=>l.employee_id===employeeId&&String(l.status||'').toLowerCase()==='approved'&&dateOnly(l.start_date)<=date&&dateOnly(l.end_date)>=date)||null;}
  function holidayFor(date){return (state.holidays||[]).find(h=>dateOnly(h.holiday_date)===date)||null;}

  function evaluate(employeeId,date){
    const schedule=scheduleFor(employeeId);
    const attendance=attendanceFor(employeeId,date);
    const holiday=holidayFor(date);
    const leave=approvedLeave(employeeId,date);
    const weekday=dayName(date);
    const now=riyadhNow();

    if(!schedule){
      return {kind:'NO_SCHEDULE',employeeId,date,weekday,attendance,message:'No work schedule is configured for this employee.'};
    }

    const workDays=String(schedule.work_days||'').split(',').filter(Boolean);
    const scheduledDay=workDays.includes(weekday);
    const start=timeMinutes(schedule.start_time);
    let end=timeMinutes(schedule.end_time);
    const overnight=end!=null&&start!=null&&end<=start;
    if(overnight)end+=1440;
    const allowedBreak=Math.max(0,Number(schedule.break_minutes||0));
    const grace=Math.max(0,Number(schedule.grace_minutes||0));
    const expectedWork=Math.max(0,(end-start)-allowedBreak);

    let classification='SCHEDULED';
    let message='Scheduled working day.';
    if(!scheduledDay){classification='OFF_DAY';message='This is not one of the employee’s configured working days.';}
    if(holiday){classification='HOLIDAY';message='Holiday: '+String(holiday.name||'Holiday')+'.';}
    if(leave){classification='APPROVED_LEAVE';message='Approved leave covers this date.';}

    if(!attendance){
      let result='NO_ATTENDANCE';
      if(classification==='SCHEDULED'){
        if(date<now.date)result='ABSENT_ELIGIBLE';
        else if(date>now.date)result='FUTURE_WORKDAY';
        else {
          const todayEnd=end;
          const currentClock=overnight&&now.minutes<start?now.minutes+1440:now.minutes;
          result=currentClock>todayEnd?'ABSENT_ELIGIBLE':'PENDING_WORKDAY';
        }
      } else result=classification;
      return {kind:result,employeeId,date,weekday,schedule,classification,attendance:null,holiday,leave,expectedWork,allowedBreak,grace,message};
    }

    const checkInRaw=storedClockMinutes(attendance.check_in);
    const checkOutRaw=storedClockMinutes(attendance.check_out);
    const checkIn=normalizedClock(checkInRaw,start,overnight);
    const checkOut=normalizedClock(checkOutRaw,start,overnight);
    const breakUsed=Math.max(0,Number(attendance.break_duration_minutes||0));
    const late=checkIn==null?0:Math.max(0,checkIn-(start+grace));
    const early=checkOut==null?null:Math.max(0,end-checkOut);
    const overtime=checkOut==null?null:Math.max(0,checkOut-end);
    const breakOver=Math.max(0,breakUsed-allowedBreak);
    let actualWork=Number(attendance.working_minutes||0);
    if((!actualWork||actualWork<0)&&checkIn!=null&&checkOut!=null)actualWork=Math.max(0,checkOut-checkIn-breakUsed);

    let result='PRESENT';
    if(classification==='OFF_DAY')result='WORKED_OFF_DAY';
    else if(classification==='HOLIDAY')result='WORKED_HOLIDAY';
    else if(classification==='APPROVED_LEAVE')result='WORKED_ON_LEAVE';
    else if(!attendance.check_out)result='IN_PROGRESS';

    return {kind:result,employeeId,date,weekday,schedule,classification,attendance,holiday,leave,expectedWork,allowedBreak,grace,late,early,overtime,breakUsed,breakOver,actualWork,message};
  }

  function resultTitle(kind){
    const map={
      NO_SCHEDULE:'⚠ No Schedule',ABSENT_ELIGIBLE:'⛔ Absent Eligible',PENDING_WORKDAY:'⏳ Workday In Progress',FUTURE_WORKDAY:'📅 Future Workday',
      OFF_DAY:'✅ Off Day',HOLIDAY:'✅ Holiday',APPROVED_LEAVE:'✅ Approved Leave',PRESENT:'✅ Present',IN_PROGRESS:'⏳ Attendance In Progress',
      WORKED_OFF_DAY:'ℹ Worked on Off Day',WORKED_HOLIDAY:'ℹ Worked on Holiday',WORKED_ON_LEAVE:'ℹ Worked During Approved Leave',NO_ATTENDANCE:'No Attendance'
    };
    return map[kind]||kind;
  }

  function card(label,value,sub){return `<div class="card">${escB(label)}<div class="stat" style="font-size:21px">${escB(value)}</div>${sub?`<div class="muted" style="font-size:12px;margin-top:4px">${escB(sub)}</div>`:''}</div>`;}

  function resultHtml(r){
    if(!r)return '<div class="empty">Choose an employee/date and click Calculate Rules.</div>';
    if(r.kind==='NO_SCHEDULE')return `<div style="padding:16px"><div style="font-size:18px;font-weight:700">${escB(resultTitle(r.kind))}</div><div class="muted" style="margin-top:7px">${escB(r.message)}</div><div style="margin-top:10px"><b>Database changes:</b> NONE (dry run)</div></div>`;

    const s=r.schedule;
    const scheduleText=`${time5(s.start_time)} → ${time5(s.end_time)} · Break ${Number(s.break_minutes||0)}m · Grace ${Number(s.grace_minutes||0)}m`;
    const att=r.attendance;
    const attendanceText=att?`${att.check_in||'—'} → ${att.check_out||'not checked out'}`:'No attendance record';
    let metrics='';
    if(att){
      metrics='<div class="cards" style="padding:14px 16px 16px">'+
        card('Late',minsText(r.late),`After ${r.grace}m grace`)+
        card('Early Checkout',r.early==null?'—':minsText(r.early),r.early==null?'Final after checkout':'Compared with shift end')+
        card('Overtime',r.overtime==null?'—':minsText(r.overtime),r.overtime==null?'Final after checkout':'Time after shift end')+
        card('Break Over',minsText(r.breakOver),`Used ${r.breakUsed}m · Allowed ${r.allowedBreak}m`)+
      '</div><div class="cards" style="padding:0 16px 16px">'+
        card('Expected Work',minsText(r.expectedWork),'Shift minus allowed break')+
        card('Actual Work',minsText(r.actualWork),'Stored/derived attendance work')+
      '</div>';
    }
    const absenceNote=r.kind==='ABSENT_ELIGIBLE'?'<div style="margin-top:9px;padding:10px;border-radius:8px;background:#fff1f0;color:#8a1c14"><b>Absence rule:</b> scheduled workday + no attendance + no approved leave + no holiday.</div>':'';
    return `<div style="padding:16px 16px 0"><div style="font-size:18px;font-weight:700">${escB(resultTitle(r.kind))}</div><div class="muted" style="margin-top:7px">${escB(r.employeeId)} — ${escB(employeeName(r.employeeId))} · ${escB(r.date)} (${escB(r.weekday)})</div><div style="margin-top:10px"><b>Schedule:</b> ${escB(scheduleText)}</div><div style="margin-top:5px"><b>Attendance:</b> ${escB(attendanceText)}</div><div style="margin-top:5px"><b>Day classification:</b> ${escB(r.classification)}</div><div style="margin-top:5px"><b>Rule note:</b> ${escB(r.message)}</div>${absenceNote}<div style="margin-top:10px"><b>Database changes:</b> NONE (dry run)</div></div>${metrics}`;
  }

  function panelHtml(){
    const employees=(state.employees||[]).filter(e=>e.status!=='Inactive');
    const opts=employees.map(e=>`<option value="${escB(e.employee_id)}">${escB(e.employee_id)} — ${escB(e.full_name)}</option>`).join('');
    const today=riyadhNow().date;
    return `<div class="section" id="fcAttendanceRules7BBox"><div class="section-head"><b>🧮 Attendance Rules Preview — Step 7B</b><span class="badge">Dry run · no DB writes</span></div><div style="padding:16px"><div class="muted" style="margin-bottom:12px">Preview the saved work schedule against attendance. It calculates schedule-based late, early checkout, overtime, break overage, expected work, and absence eligibility without changing any attendance record.</div><div class="actions" style="align-items:end;gap:12px"><div class="field" style="margin:0;min-width:290px"><label>Employee</label><select id="fc_s7b_employee">${opts}</select></div><div class="field" style="margin:0"><label>Date</label><input id="fc_s7b_date" type="date" value="${escB(today)}"></div><button id="fc_s7b_btn" onclick="fcS7BCalculate()">Calculate Rules</button></div></div><div id="fc_s7b_result" style="border-top:1px solid #e4e9ef"><div class="empty">Choose an employee/date and click Calculate Rules.</div></div></div>`;
  }

  window.fcS7BCalculate=async function(){
    const btn=document.getElementById('fc_s7b_btn');
    const result=document.getElementById('fc_s7b_result');
    const employeeId=document.getElementById('fc_s7b_employee')?.value||'';
    const date=document.getElementById('fc_s7b_date')?.value||'';
    if(!employeeId||!date)return toast('Choose employee and date');
    try{
      if(btn){btn.disabled=true;btn.textContent='Calculating...';}
      await loadSchedules();
      if(!schedulesLoaded)throw Error('Could not load work schedules');
      const r=evaluate(employeeId,date);
      if(result)result.innerHTML=resultHtml(r);
    }catch(e){
      if(result)result.innerHTML='<div class="empty">'+escB(e.message||'Attendance rule preview failed')+'</div>';
      if(typeof toast==='function')toast(e.message||'Attendance rule preview failed');
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Calculate Rules';}
    }
  };

  const previousViewAttendance=window.viewAttendance;
  window.viewAttendance=function(){
    const base=typeof previousViewAttendance==='function'?previousViewAttendance():'';
    if(!isAdmin())return base;
    setTimeout(loadSchedules,0);
    return panelHtml()+base;
  };
})();
