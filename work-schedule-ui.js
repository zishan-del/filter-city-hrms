(function(){
  'use strict';
  if(window.__fcWorkScheduleStep7A)return;
  window.__fcWorkScheduleStep7A=true;

  let schedules=[];
  let loaded=false;
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function currentUser(){try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}catch(_){return {};}}
  function isAdmin(){return String(currentUser().role||'').toUpperCase()==='ADMIN';}
  function escS(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function time5(v){return v?String(v).slice(0,5):'';}
  function scheduleFor(id){return schedules.find(x=>x.employee_id===id)||null;}
  function selectedEmployee(){return document.getElementById('fc_s7_employee')?.value||'';}

  async function request(method,body){
    const r=await fetch('/api/work-schedule',{
      method,
      headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')},
      body:body===undefined?undefined:JSON.stringify(body)
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(d.error||'Work schedule request failed');
    return d;
  }

  function dayChecks(selected){
    const set=new Set(String(selected||'').split(',').filter(Boolean));
    return days.map(d=>`<label style="display:flex;gap:6px;align-items:center;padding:7px 9px;border:1px solid #dce3eb;border-radius:8px;background:#fff"><input type="checkbox" class="fc_s7_day" value="${d}" ${set.has(d)?'checked':''}> ${d}</label>`).join('');
  }

  function configuredTable(){
    const rows=schedules.filter(s=>s.start_time&&s.end_time);
    if(!rows.length)return '<div class="empty">No employee work schedules configured yet.</div>';
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Working Days</th><th>Shift</th><th>Break</th><th>Late Grace</th></tr></thead><tbody>${rows.map(s=>`<tr><td>${escS(s.employee_id)} — ${escS(s.full_name||'')}</td><td>${escS(s.work_days||'')}</td><td>${escS(time5(s.start_time))} → ${escS(time5(s.end_time))}</td><td>${Number(s.break_minutes||0)} min</td><td>${Number(s.grace_minutes||0)} min</td></tr>`).join('')}</tbody></table></div>`;
  }

  function editorHtml(){
    const employees=(state.employees||[]).filter(e=>e.status!=='Inactive');
    if(!employees.length)return '<div class="empty">No active employees available.</div>';
    const id=selectedEmployee()||employees[0].employee_id;
    const s=scheduleFor(id)||{};
    const options=employees.map(e=>`<option value="${escS(e.employee_id)}" ${e.employee_id===id?'selected':''}>${escS(e.employee_id)} — ${escS(e.full_name)}</option>`).join('');
    const configured=!!(s.start_time&&s.end_time);
    return `<div class="section-head"><b>🕒 Work Schedule Settings — Step 7A</b><span class="badge">${configured?'Configured':'Not configured'}</span></div>
      <div style="padding:16px">
        <div class="muted" style="margin-bottom:14px">Set each employee’s normal working days, shift time, allowed break, and late grace period. Step 7A only stores the schedule. It does not change or recalculate attendance, payroll, leave, or old records.</div>
        <div class="form-grid" style="padding:0">
          <div class="field"><label>Employee</label><select id="fc_s7_employee" onchange="fcS7ChangeEmployee()">${options}</select></div>
          <div class="field"><label>Shift Start</label><input id="fc_s7_start" type="time" value="${escS(time5(s.start_time))}"></div>
          <div class="field"><label>Shift End</label><input id="fc_s7_end" type="time" value="${escS(time5(s.end_time))}"></div>
          <div class="field"><label>Allowed Break (minutes)</label><input id="fc_s7_break" type="number" min="0" max="300" step="1" value="${configured?Number(s.break_minutes||0):''}"></div>
          <div class="field"><label>Late Grace (minutes)</label><input id="fc_s7_grace" type="number" min="0" max="120" step="1" value="${configured?Number(s.grace_minutes||0):''}"></div>
          <div class="field full"><label>Working Days</label><div style="display:flex;gap:8px;flex-wrap:wrap">${dayChecks(s.work_days)}</div></div>
          <div class="full"><button onclick="fcS7SaveSchedule()">Save Work Schedule</button></div>
        </div>
      </div>
      <div style="border-top:1px solid #e4e9ef"><div class="section-head"><b>Configured Employee Schedules</b><span class="badge">Future attendance rules</span></div>${configuredTable()}</div>`;
  }

  function renderEditor(){
    const box=document.getElementById('fcWorkScheduleBox');
    if(!box)return;
    box.innerHTML=loaded?editorHtml():'<div class="section-head"><b>🕒 Work Schedule Settings — Step 7A</b></div><div class="empty">Loading work schedules…</div>';
  }

  async function load(){
    try{
      const d=await request('GET');
      schedules=Array.isArray(d.schedules)?d.schedules:[];
      loaded=true;
      renderEditor();
    }catch(e){
      const box=document.getElementById('fcWorkScheduleBox');
      if(box)box.innerHTML='<div class="section-head"><b>🕒 Work Schedule Settings — Step 7A</b></div><div class="empty">'+escS(e.message||'Could not load work schedules')+'</div>';
    }
  }

  window.fcS7ChangeEmployee=function(){
    const id=selectedEmployee();
    const box=document.getElementById('fcWorkScheduleBox');
    if(!box)return;
    box.innerHTML=editorHtml();
    const select=document.getElementById('fc_s7_employee');
    if(select)select.value=id;
  };

  window.fcS7SaveSchedule=async function(){
    const employeeId=selectedEmployee();
    const workDays=[...document.querySelectorAll('.fc_s7_day:checked')].map(x=>x.value);
    const start=document.getElementById('fc_s7_start')?.value||'';
    const end=document.getElementById('fc_s7_end')?.value||'';
    const breakMinutes=document.getElementById('fc_s7_break')?.value;
    const graceMinutes=document.getElementById('fc_s7_grace')?.value;
    if(!employeeId)return toast('Choose an employee');
    if(!workDays.length)return toast('Select at least one working day');
    if(!start||!end)return toast('Enter shift start and end times');
    if(breakMinutes===''||graceMinutes==='')return toast('Enter break and grace minutes');
    if(!confirm('Save this work schedule for '+employeeId+'? Step 7A will store the schedule only; attendance calculations are not changed yet.'))return;
    try{
      const d=await request('POST',{employee_id:employeeId,work_days:workDays,start_time:start,end_time:end,break_minutes:Number(breakMinutes),grace_minutes:Number(graceMinutes)});
      schedules=Array.isArray(d.schedules)?d.schedules:schedules;
      loaded=true;
      renderEditor();
      const select=document.getElementById('fc_s7_employee');if(select)select.value=employeeId;
      if(typeof toast==='function')toast('Work schedule saved');
    }catch(e){if(typeof toast==='function')toast(e.message||'Could not save work schedule');}
  };

  const previousViewSettings=window.viewSettings;
  window.viewSettings=function(){
    const base=typeof previousViewSettings==='function'?previousViewSettings():'';
    if(!isAdmin())return base;
    setTimeout(()=>{renderEditor();load();},0);
    return base+'<div class="section" id="fcWorkScheduleBox"><div class="section-head"><b>🕒 Work Schedule Settings — Step 7A</b></div><div class="empty">Loading work schedules…</div></div>';
  };
})();
