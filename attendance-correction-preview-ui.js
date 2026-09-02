(function(){
  'use strict';
  if(window.__fcAttendanceCorrectionStep8A)return;
  window.__fcAttendanceCorrectionStep8A=true;

  let schedules=[];
  let history=[];
  let auditRows=[];
  let metaLoaded=false;
  let metaLoading=false;

  function currentUser(){try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}catch(_){return {};}}
  function isAdmin(){return String(currentUser().role||'').toUpperCase()==='ADMIN';}
  function esc8(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function dateOnly(v){return v?String(v).slice(0,10):'';}
  function employeeName(id){const e=(state.employees||[]).find(x=>x.employee_id===id);return e?e.full_name:id;}
  function minsText(value){const n=Math.max(0,Math.round(Number(value||0)));return Math.floor(n/60)+'h '+(n%60)+'m';}
  function numOrBlank(v){return v==null||v===''?'':String(v);}
  function rowById(id){return (state.attendance||[]).find(a=>String(a.id)===String(id))||null;}

  function asInputDateTime(value){
    if(!value)return '';
    const s=String(value).replace(' ','T');
    const m=s.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
    return m?`${m[1]}T${m[2]}:${m[3]}`:'';
  }
  function minutesBetween(a,b){
    if(!a||!b)return 0;
    const x=new Date(a+(/:\d{2}$/.test(a)?'':':00')+'Z');
    const y=new Date(b+(/:\d{2}$/.test(b)?'':':00')+'Z');
    if(!Number.isFinite(x.getTime())||!Number.isFinite(y.getTime()))return 0;
    return Math.max(0,Math.round((y-x)/60000));
  }
  function dayName(date){
    return new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Riyadh',weekday:'short'}).format(new Date(date+'T12:00:00Z'));
  }
  function clockMinutes(value){
    const m=String(value||'').match(/(?:T|\s|^)(\d{2}):(\d{2})/);
    return m?Number(m[1])*60+Number(m[2]):null;
  }
  function normalizeClock(clock,start,overnight){return clock==null?null:(overnight&&clock<start?clock+1440:clock);}
  function nightMinutes(a,b){
    if(!a||!b)return 0;
    const start=new Date(a+(/:\d{2}$/.test(a)?'':':00')+'Z');
    const end=new Date(b+(/:\d{2}$/.test(b)?'':':00')+'Z');
    if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<=start)return 0;
    let total=0;
    const first=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth(),start.getUTCDate()-1));
    for(let d=new Date(first);d<end;d.setUTCDate(d.getUTCDate()+1)){
      const n1=new Date(d);n1.setUTCHours(22,0,0,0);
      const n2=new Date(d);n2.setUTCDate(n2.getUTCDate()+1);n2.setUTCHours(6,0,0,0);
      const s=Math.max(start,n1),e=Math.min(end,n2);
      if(e>s)total+=Math.round((e-s)/60000);
    }
    return total;
  }
  function scheduleFor(employeeId,date){
    const versions=history
      .filter(s=>s.employee_id===employeeId&&s.start_time&&s.end_time&&dateOnly(s.effective_from)<=date)
      .sort((a,b)=>dateOnly(b.effective_from).localeCompare(dateOnly(a.effective_from)));
    if(versions.length)return versions[0];
    return schedules.find(s=>s.employee_id===employeeId&&s.start_time&&s.end_time)||null;
  }
  function holidayFor(date){return (state.holidays||[]).find(h=>dateOnly(h.holiday_date)===date)||null;}
  function approvedLeave(employeeId,date){return (state.leaves||[]).find(l=>l.employee_id===employeeId&&String(l.status||'').toLowerCase()==='approved'&&dateOnly(l.start_date)<=date&&dateOnly(l.end_date)>=date)||null;}

  async function loadMeta(force){
    if(metaLoaded&&!force)return;
    if(metaLoading)return;
    metaLoading=true;
    try{
      const r=await fetch('/api/work-schedule',{headers:{Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')}});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw Error(d.error||'Could not load correction metadata');
      schedules=Array.isArray(d.schedules)?d.schedules:[];
      history=Array.isArray(d.history)?d.history:[];
      auditRows=Array.isArray(d.attendance_audit)?d.attendance_audit:[];
      metaLoaded=true;
    }catch(e){
      console.error('Step 8A metadata load failed',e);
      if(typeof toast==='function')toast(e.message||'Could not load correction metadata');
    }finally{metaLoading=false;}
  }

  function attendanceOptions(){
    const rows=[...(state.attendance||[])].sort((a,b)=>dateOnly(b.work_date).localeCompare(dateOnly(a.work_date))||Number(b.id||0)-Number(a.id||0));
    return rows.map(a=>`<option value="${esc8(a.id)}">${esc8(dateOnly(a.work_date))} · ${esc8(a.employee_id)} — ${esc8(employeeName(a.employee_id))}</option>`).join('');
  }

  function editorHtml(){
    const rows=(state.attendance||[]);
    if(!rows.length)return '<div class="empty">No attendance records are available to preview a correction.</div>';
    return `<div class="section-head"><b>🛠 Attendance Correction Preview — Step 8A</b><span class="badge">Preview only · no DB writes</span></div>
      <div style="padding:16px">
        <div class="muted" style="margin-bottom:12px">Select an existing attendance record, enter the corrected values and a reason, then preview the recalculated result. Step 8A does not save any correction.</div>
        <div class="form-grid" style="padding:0">
          <div class="field full"><label>Attendance Record</label><select id="fc8_record" onchange="fc8LoadRecord()">${attendanceOptions()}</select></div>
          <div class="field"><label>Check In</label><input id="fc8_checkin" type="datetime-local"></div>
          <div class="field"><label>Check Out</label><input id="fc8_checkout" type="datetime-local"></div>
          <div class="field"><label>Break Start</label><input id="fc8_break_start" type="datetime-local"></div>
          <div class="field"><label>Break End</label><input id="fc8_break_end" type="datetime-local"></div>
          <div class="field"><label>Check-in Latitude</label><input id="fc8_lat" type="number" step="0.0000001"></div>
          <div class="field"><label>Check-in Longitude</label><input id="fc8_lng" type="number" step="0.0000001"></div>
          <div class="field"><label>Check-in Accuracy (m)</label><input id="fc8_acc" type="number" step="0.01" min="0"></div>
          <div class="field"><label>Checkout Latitude</label><input id="fc8_out_lat" type="number" step="0.0000001"></div>
          <div class="field"><label>Checkout Longitude</label><input id="fc8_out_lng" type="number" step="0.0000001"></div>
          <div class="field"><label>Checkout Accuracy (m)</label><input id="fc8_out_acc" type="number" step="0.01" min="0"></div>
          <div class="field full"><label>Correction Reason <span style="color:#b42318">*</span></label><textarea id="fc8_reason" rows="3" placeholder="Example: Employee reported checkout was recorded 10 minutes early due to device clock issue."></textarea></div>
          <div class="full"><button onclick="fc8PreviewCorrection()">Preview Correction — No Save</button></div>
        </div>
      </div>
      <div id="fc8_preview" style="border-top:1px solid #e4e9ef"><div class="empty">No correction preview performed yet.</div></div>
      <div style="border-top:1px solid #e4e9ef"><div class="section-head"><b>Attendance Audit History</b><span class="badge">Read only</span></div><div id="fc8_audit">${auditHtml(null)}</div></div>`;
  }

  function auditHtml(attendanceId){
    if(!metaLoaded)return '<div class="empty">Loading attendance audit history…</div>';
    const rows=attendanceId?auditRows.filter(a=>String(a.attendance_id)===String(attendanceId)):auditRows.slice(0,20);
    if(!rows.length)return '<div class="empty">No audit events found for this attendance record.</div>';
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Employee</th><th>Action</th><th>Actor</th><th>Details</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${esc8(String(a.created_at||'').replace('T',' ').slice(0,19))}</td><td>${esc8(a.employee_id||'')}</td><td><span class="badge">${esc8(a.action||'')}</span></td><td>${esc8(a.actor_username||a.actor_role||'System')}</td><td style="white-space:normal;min-width:280px">${esc8(a.details||'')}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function fieldValue(id){return document.getElementById(id)?.value||'';}
  function setValue(id,value){const el=document.getElementById(id);if(el)el.value=value==null?'':value;}

  window.fc8LoadRecord=function(){
    const id=fieldValue('fc8_record');
    const a=rowById(id);
    if(!a)return;
    setValue('fc8_checkin',asInputDateTime(a.check_in));
    setValue('fc8_checkout',asInputDateTime(a.check_out));
    setValue('fc8_break_start',asInputDateTime(a.break_start));
    setValue('fc8_break_end',asInputDateTime(a.break_end));
    setValue('fc8_lat',numOrBlank(a.latitude));
    setValue('fc8_lng',numOrBlank(a.longitude));
    setValue('fc8_acc',numOrBlank(a.checkin_accuracy));
    setValue('fc8_out_lat',numOrBlank(a.checkout_latitude));
    setValue('fc8_out_lng',numOrBlank(a.checkout_longitude));
    setValue('fc8_out_acc',numOrBlank(a.checkout_accuracy));
    setValue('fc8_reason','');
    const preview=document.getElementById('fc8_preview');if(preview)preview.innerHTML='<div class="empty">Edit values if needed, enter a correction reason, then click Preview Correction.</div>';
    const audit=document.getElementById('fc8_audit');if(audit)audit.innerHTML=auditHtml(id);
  };

  function proposedRecord(a){
    return {
      check_in:fieldValue('fc8_checkin'),check_out:fieldValue('fc8_checkout'),
      break_start:fieldValue('fc8_break_start'),break_end:fieldValue('fc8_break_end'),
      latitude:fieldValue('fc8_lat'),longitude:fieldValue('fc8_lng'),checkin_accuracy:fieldValue('fc8_acc'),
      checkout_latitude:fieldValue('fc8_out_lat'),checkout_longitude:fieldValue('fc8_out_lng'),checkout_accuracy:fieldValue('fc8_out_acc')
    };
  }

  function calculate(a,p){
    const date=dateOnly(a.work_date);
    const schedule=scheduleFor(a.employee_id,date);
    const holiday=holidayFor(date),leave=approvedLeave(a.employee_id,date),weekday=dayName(date);
    const breakM=p.break_start&&p.break_end?minutesBetween(p.break_start,p.break_end):0;
    const presence=p.check_in&&p.check_out?minutesBetween(p.check_in,p.check_out):0;
    const working=Math.max(0,presence-breakM);
    let expected=Number(a.expected_work_minutes||0),late=0,early=0,overtime=0,breakOver=0,classification='NO_SCHEDULE',effective='—';
    if(schedule){
      effective=dateOnly(schedule.effective_from)||'legacy/current';
      const workDays=String(schedule.work_days||'').split(',').filter(Boolean);
      classification=holiday?'HOLIDAY':leave?'APPROVED_LEAVE':workDays.includes(weekday)?'SCHEDULED':'OFF_DAY';
      let start=clockMinutes(schedule.start_time),end=clockMinutes(schedule.end_time);
      if(start!=null&&end!=null){
        const overnight=end<=start;if(overnight)end+=1440;
        const allowed=Math.max(0,Number(schedule.break_minutes||0)),grace=Math.max(0,Number(schedule.grace_minutes||0));
        expected=Math.max(0,end-start-allowed);
        const cin=normalizeClock(clockMinutes(p.check_in),start,overnight),cout=normalizeClock(clockMinutes(p.check_out),start,overnight);
        const scheduled=classification==='SCHEDULED';
        late=scheduled&&cin!=null?Math.max(0,cin-(start+grace)):0;
        early=scheduled&&cout!=null?Math.max(0,end-cout):0;
        overtime=scheduled&&cout!=null?Math.max(0,cout-end):0;
        breakOver=scheduled?Math.max(0,breakM-allowed):0;
      }
    }
    return {schedule,effective,classification,breakM,working,expected,late,early,overtime,breakOver,night:nightMinutes(p.check_in,p.check_out)};
  }

  function comparisonRows(a,p){
    const fields=[
      ['Check In',asInputDateTime(a.check_in),p.check_in],['Check Out',asInputDateTime(a.check_out),p.check_out],
      ['Break Start',asInputDateTime(a.break_start),p.break_start],['Break End',asInputDateTime(a.break_end),p.break_end],
      ['Check-in GPS',a.latitude==null?'—':`${a.latitude}, ${a.longitude}${a.checkin_accuracy?` ±${a.checkin_accuracy}m`:''}`,p.latitude===''&&p.longitude===''?'—':`${p.latitude||'—'}, ${p.longitude||'—'}${p.checkin_accuracy?` ±${p.checkin_accuracy}m`:''}`],
      ['Checkout GPS',a.checkout_latitude==null?'—':`${a.checkout_latitude}, ${a.checkout_longitude}${a.checkout_accuracy?` ±${a.checkout_accuracy}m`:''}`,p.checkout_latitude===''&&p.checkout_longitude===''?'—':`${p.checkout_latitude||'—'}, ${p.checkout_longitude||'—'}${p.checkout_accuracy?` ±${p.checkout_accuracy}m`:''}`]
    ];
    return fields.map(f=>{const changed=String(f[1]||'')!==String(f[2]||'');return `<tr><td>${esc8(f[0])}</td><td>${esc8(f[1]||'—')}</td><td>${esc8(f[2]||'—')}</td><td><span class="badge">${changed?'CHANGED':'Same'}</span></td></tr>`;}).join('');
  }

  window.fc8PreviewCorrection=async function(){
    const attendanceId=fieldValue('fc8_record'),reason=fieldValue('fc8_reason').trim();
    const a=rowById(attendanceId),box=document.getElementById('fc8_preview');
    if(!a)return toast('Choose an attendance record');
    if(reason.length<5)return toast('Enter a clear correction reason');
    if(!metaLoaded)await loadMeta(false);
    const p=proposedRecord(a);
    if((p.break_start&&!p.break_end)||(!p.break_start&&p.break_end))return toast('Break start and break end must both be entered or both left blank');
    if(p.check_out&&!p.check_in)return toast('Check In is required when Check Out is entered');
    if(p.check_in&&p.check_out&&minutesBetween(p.check_in,p.check_out)<=0)return toast('Check Out must be after Check In');
    if(p.break_start&&p.break_end&&minutesBetween(p.break_start,p.break_end)<=0)return toast('Break End must be after Break Start');
    const c=calculate(a,p);
    const changed=comparisonRows(a,p).includes('CHANGED');
    box.innerHTML=`<div style="padding:16px"><div style="font-size:18px;font-weight:700">Correction Preview — ${esc8(a.employee_id)} · ${esc8(dateOnly(a.work_date))}</div>
      <div class="muted" style="margin-top:6px">Schedule effective ${esc8(c.effective)} · ${esc8(c.classification)}. This preview recalculates attendance but does not save anything.</div>
      <div class="cards" style="padding:14px 0 0">${[['Working',c.working],['Late',c.late],['Early',c.early],['Overtime',c.overtime]].map(x=>`<div class="card">${x[0]}<div class="stat" style="font-size:21px">${minsText(x[1])}</div></div>`).join('')}</div>
      <div class="cards" style="padding:14px 0">${[['Break',c.breakM],['Break Over',c.breakOver],['Expected Work',c.expected],['Night',c.night]].map(x=>`<div class="card">${x[0]}<div class="stat" style="font-size:21px">${minsText(x[1])}</div></div>`).join('')}</div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Field</th><th>Current</th><th>Proposed</th><th>Result</th></tr></thead><tbody>${comparisonRows(a,p)}</tbody></table></div>
      <div style="margin-top:14px;padding:12px;border:1px solid #dce3eb;border-radius:8px;background:#f7f9fb"><b>Audit entry that Step 8B would create:</b><br><span class="muted">ADMIN_CORRECTION · Admin ${esc8(currentUser().username||currentUser().id||'')} · Reason: ${esc8(reason)}</span></div>
      <div style="margin-top:12px"><b>Database changes:</b> NONE (Step 8A preview only)</div>
      ${changed?'':'<div class="muted" style="margin-top:7px">No field difference is currently detected. Change at least one value when testing a correction preview.</div>'}
    </div>`;
  };

  function panelHtml(){return `<div class="section" id="fcAttendanceCorrection8A">${editorHtml()}</div>`;}

  async function afterRender(){
    await loadMeta(false);
    const box=document.getElementById('fcAttendanceCorrection8A');
    if(!box)return;
    box.innerHTML=editorHtml();
    setTimeout(()=>window.fc8LoadRecord(),0);
  }

  const previousViewAttendance=window.viewAttendance;
  window.viewAttendance=function(){
    const base=typeof previousViewAttendance==='function'?previousViewAttendance():'';
    if(!isAdmin())return base;
    setTimeout(afterRender,0);
    return panelHtml()+base;
  };
})();
