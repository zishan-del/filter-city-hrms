(function(){
  'use strict';
  if(window.__fcLeaveAutomationUi)return;
  window.__fcLeaveAutomationUi=true;

  const DAY=86400000;
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const dateKey=v=>String(v||'').slice(0,10);

  function localLeaveCalculation(start,end){
    if(!start||!end)return {calendarDays:0,holidayDays:0,weekendDays:0,leaveDays:0,valid:false};
    const a=new Date(start+'T00:00:00Z'),b=new Date(end+'T00:00:00Z');
    if(Number.isNaN(a.getTime())||Number.isNaN(b.getTime())||b<a)return {calendarDays:0,holidayDays:0,weekendDays:0,leaveDays:0,valid:false};
    const holidaySet=new Set((state?.holidays||[]).map(h=>dateKey(h.holiday_date)).filter(Boolean));
    let calendarDays=0,holidayDays=0,weekendDays=0,leaveDays=0;
    for(let t=a.getTime();t<=b.getTime();t+=DAY){
      calendarDays++;
      const d=new Date(t),key=d.toISOString().slice(0,10),dow=d.getUTCDay();
      if(holidaySet.has(key))holidayDays++;
      else if(dow===5)weekendDays++;
      else leaveDays++;
    }
    return {calendarDays,holidayDays,weekendDays,leaveDays,valid:true};
  }

  function leaveStats(employeeId){
    const employee=(state?.employees||[]).find(e=>String(e.employee_id)===String(employeeId))||{};
    if(employee.leave_balance_days!==undefined){
      return {
        entitlement:num(employee.leave_entitlement_days ?? employee.planned_leave_days),
        approved:num(employee.leave_approved_days),
        pending:num(employee.leave_pending_days),
        remaining:num(employee.leave_balance_days)
      };
    }
    const leaves=(state?.leaves||[]).filter(l=>String(l.employee_id)===String(employeeId));
    const entitlement=num(employee.planned_leave_days);
    const approved=leaves.filter(l=>String(l.status).toLowerCase()==='approved').reduce((a,l)=>a+Math.max(0,num(l.days)),0);
    const pending=leaves.filter(l=>String(l.status).toLowerCase()==='pending').reduce((a,l)=>a+Math.max(0,num(l.days)),0);
    return {entitlement,approved,pending,remaining:Math.max(0,entitlement-approved)};
  }

  function balanceCards(stats){
    return `<div class="cards" style="margin-bottom:18px">
      <div class="card">Leave Entitlement<div class="stat">${esc(stats.entitlement)}</div></div>
      <div class="card">Approved Used<div class="stat">${esc(stats.approved)}</div></div>
      <div class="card">Pending Requested<div class="stat">${esc(stats.pending)}</div></div>
      <div class="card">Remaining Leave<div class="stat">${esc(stats.remaining)}</div></div>
    </div>`;
  }

  function adminBalanceTable(){
    const rows=(state?.employees||[]).filter(e=>e.status==='Active').map(e=>{
      const s=leaveStats(e.employee_id);
      return `<tr><td>${esc(e.employee_id)}</td><td>${esc(e.full_name)}</td><td>${esc(s.entitlement)}</td><td>${esc(s.approved)}</td><td>${esc(s.pending)}</td><td><b>${esc(s.remaining)}</b></td></tr>`;
    }).join('');
    return `<div class="section"><div class="section-head"><b>Employee Leave Balances</b><span class="badge">Auto-updated on approval</span></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Name</th><th>Entitlement</th><th>Approved Used</th><th>Pending Requested</th><th>Remaining</th></tr></thead>
      <tbody>${rows||'<tr><td colspan="6" class="empty">No active employees.</td></tr>'}</tbody></table></div></div>`;
  }

  window.viewLeave=function(){
    const me=JSON.parse(sessionStorage.getItem('fc_user')||'{}');
    const all=Array.isArray(state?.leaves)?state.leaves:[];
    const rows=role==='EMPLOYEE'?all.filter(l=>l.employee_id===me.employeeId):all;
    const employeeSummary=role==='EMPLOYEE'?balanceCards(leaveStats(me.employeeId)):adminBalanceTable();

    const upcoming=role==='ADMIN'?(state?.employees||[]).filter(e=>e.status==='Active'&&e.next_leave_date).sort((a,b)=>String(a.next_leave_date).localeCompare(String(b.next_leave_date))):[];
    const tracker=role==='ADMIN'?`<div class="section"><div class="section-head"><b>Upcoming Employee Leave</b><span class="badge">Internal leave planning</span></div><div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Name</th><th>Next Leave</th><th>Planned Days</th><th>Cycle</th><th>Last Leave End</th><th>Days Until</th></tr></thead><tbody>${upcoming.map(e=>{const d=Math.ceil((new Date(String(e.next_leave_date).slice(0,10)+'T00:00:00')-new Date(new Date().toISOString().slice(0,10)+'T00:00:00'))/DAY);return `<tr><td>${esc(e.employee_id)}</td><td>${esc(e.full_name)}</td><td>${esc(dateKey(e.next_leave_date))}</td><td>${esc(e.planned_leave_days||30)}</td><td>${esc(e.leave_cycle_years||2)} years</td><td>${esc(dateKey(e.last_leave_end_date)||'—')}</td><td><span class="badge">${d<0?'Overdue':d+' days'}</span></td></tr>`}).join('')||'<tr><td colspan="7" class="empty">No upcoming leave dates. Edit an employee to add the next leave date.</td></tr>'}</tbody></table></div></div>`:'';

    const requestRows=rows.map(l=>{
      let actions='';
      if(role==='ADMIN'&&l.status==='Pending')actions=`<button onclick="decideLeave(${l.id},'Approved')">Approve</button> <button class="danger" onclick="decideLeave(${l.id},'Rejected')">Reject</button>`;
      else if(role==='ADMIN'&&l.status==='Approved')actions=`<button class="danger" onclick="decideLeave(${l.id},'Cancelled')">Cancel / Restore Balance</button>`;
      return `<tr><td>${esc(l.employee_id)}</td><td>${esc(l.leave_type)}</td><td>${esc(dateKey(l.start_date))}</td><td>${esc(dateKey(l.end_date))}</td><td>${esc(l.days)}</td><td>${esc(l.status)}</td><td>${esc(l.reason||'')}</td><td>${actions}</td></tr>`;
    }).join('');

    return employeeSummary+tracker+`<div class="section"><div class="section-head"><b>Leave Requests</b><button onclick="leaveForm()">+ Leave Request</button></div>
      <div style="padding:12px 18px;color:#637083;font-size:13px">Leave days are calculated automatically. Friday and saved holidays are excluded from the leave-day deduction.</div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th><th data-leave-reason="1">Reason</th><th>Actions</th></tr></thead>
      <tbody>${requestRows||'<tr><td colspan="8" class="empty">No leave requests.</td></tr>'}</tbody></table></div></div>`;
  };

  window.leaveForm=function(){
    const me=JSON.parse(sessionStorage.getItem('fc_user')||'{}');
    const opts=role==='EMPLOYEE'
      ?`<input type="hidden" id="leave_emp" value="${esc(me.employeeId||'')}">`
      :`<div class="field"><label>Employee</label><select id="leave_emp">${(state?.employees||[]).filter(e=>e.status==='Active').map(e=>`<option value="${esc(e.employee_id)}">${esc(e.employee_id)} — ${esc(e.full_name)}</option>`).join('')}</select></div>`;

    document.getElementById('content').innerHTML=`<div class="section"><div class="section-head"><b>Leave Request</b><button class="secondary" onclick="render('Leave')">Back</button></div>
      <div class="form-grid">${opts}
        <div class="field"><label>Leave type</label><select id="leave_type"><option>Annual Leave</option><option>Sick Leave</option><option>Emergency Leave</option></select></div>
        <div class="field"><label>Start date</label><input id="leave_start" type="date"></div>
        <div class="field"><label>End date</label><input id="leave_end" type="date"></div>
        <div class="field"><label>Auto-calculated leave days</label><input id="leave_days" type="number" value="0" readonly></div>
        <div class="field"><label>Available leave balance</label><input id="leave_available" type="number" value="0" readonly></div>
        <div class="field full"><div id="leave_breakdown" class="muted">Choose start and end dates. Friday and saved holidays will be excluded automatically.</div></div>
        <div class="field full"><label>Reason</label><textarea id="leave_reason"></textarea></div>
        <div class="full"><button onclick="saveLeave()">Submit to Cloud</button></div>
      </div></div>`;
    requestAnimationFrame(()=>{
      document.getElementById('leave_start')?.addEventListener('change',window.updateLeaveAutoCount);
      document.getElementById('leave_end')?.addEventListener('change',window.updateLeaveAutoCount);
      document.getElementById('leave_emp')?.addEventListener('change',window.updateLeaveAutoCount);
      window.updateLeaveAutoCount();
    });
  };

  window.updateLeaveAutoCount=function(){
    const emp=document.getElementById('leave_emp');
    const start=document.getElementById('leave_start');
    const end=document.getElementById('leave_end');
    const days=document.getElementById('leave_days');
    const available=document.getElementById('leave_available');
    const breakdown=document.getElementById('leave_breakdown');
    if(!emp||!days||!available)return;
    const stats=leaveStats(emp.value);
    available.value=stats.remaining;
    const c=localLeaveCalculation(start?.value,end?.value);
    days.value=c.valid?c.leaveDays:0;
    if(breakdown){
      breakdown.textContent=c.valid
        ?`Calendar: ${c.calendarDays} | Weekend: ${c.weekendDays} | Holidays: ${c.holidayDays} | Leave days: ${c.leaveDays} | Balance after approval: ${Math.max(0,stats.remaining-c.leaveDays)}`
        :'Choose valid start and end dates. Friday and saved holidays will be excluded automatically.';
    }
  };

  window.saveLeave=async function(){
    const emp=document.getElementById('leave_emp'),start=document.getElementById('leave_start'),end=document.getElementById('leave_end');
    const type=document.getElementById('leave_type'),reason=document.getElementById('leave_reason');
    const c=localLeaveCalculation(start?.value,end?.value);
    if(!c.valid)return toast('Choose valid start and end dates');
    if(c.leaveDays<=0)return toast('Selected dates contain no chargeable leave days');
    const stats=leaveStats(emp?.value);
    if(c.leaveDays>stats.remaining)return toast(`Only ${stats.remaining} leave days are available`);
    try{
      await api('POST','leaves',{employee_id:emp.value,leave_type:type.value,start_date:start.value,end_date:end.value,reason:reason.value});
      toast('Leave request saved with automatic day count');
      await refresh();
    }catch(err){toast(err.message||'Unable to save leave request')}
  };

  window.decideLeave=async function(id,status){
    if(status==='Cancelled'&&!confirm('Cancel this approved leave and restore its balance?'))return;
    try{
      const result=await api('PUT','leaves/'+id,{status});
      const remaining=result?.balance?.remaining;
      toast(remaining===undefined?`Leave ${status}`:`Leave ${status}. Remaining balance: ${remaining}`);
      await refresh();
    }catch(err){toast(err.message||'Unable to update leave request')}
  };

  function patchEmployeeEntitlementLabel(){
    const input=document.getElementById('planned_leave_days');
    const field=input&&input.closest('.field');
    const label=field&&field.querySelector('label');
    if(label&&/Planned leave days/i.test(label.textContent))label.textContent='Total leave entitlement (days)';
  }
  new MutationObserver(patchEmployeeEntitlementLabel).observe(document.body,{childList:true,subtree:true});
  patchEmployeeEntitlementLabel();
})();