(function(){
  'use strict';
  if(window.__fcAttendanceCorrectionReportStep9B)return;
  window.__fcAttendanceCorrectionReportStep9B=true;

  let auditRows=[];
  let loaded=false;
  let loading=null;
  const reportCache={};
  const fieldLabels=[
    'Check In','Check Out','Break Start','Break End',
    'Check-in Latitude','Check-in Longitude','Check-in Accuracy',
    'Checkout Latitude','Checkout Longitude','Checkout Accuracy'
  ];

  function currentUser(){try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}catch(_){return {};}}
  function isAdmin(){return String(currentUser().role||'').toUpperCase()==='ADMIN';}
  function esc9b(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function dateOnly(v){return v?String(v).slice(0,10):'';}
  function riyadhMonth(){const p={};new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit'}).formatToParts(new Date()).forEach(x=>{if(x.type!=='literal')p[x.type]=x.value;});return `${p.year}-${p.month}`;}
  function monthLabel(value){const m=String(value||'').match(/^(\d{4})-(\d{2})$/);if(!m)return value||'';return new Intl.DateTimeFormat('en',{timeZone:'Asia/Riyadh',month:'long',year:'numeric'}).format(new Date(Date.UTC(Number(m[1]),Number(m[2])-1,1,12)));}
  function employeeName(id){const e=(state.employees||[]).find(x=>x.employee_id===id);return e?e.full_name:id;}
  function selectedEmployee(){return document.getElementById('fc9b_employee')?.value||'';}
  function selectedMonth(){return document.getElementById('fc9b_month')?.value||riyadhMonth();}
  function correctionTime(v){if(!v)return '—';try{return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date(v));}catch(_){return String(v);}}

  async function loadAudit(force){
    if(loaded&&!force)return auditRows;
    if(loading&&!force)return loading;
    loading=(async()=>{
      const r=await fetch('/api/work-schedule',{headers:{Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')}});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw Error(d.error||'Could not load attendance audit history');
      auditRows=Array.isArray(d.attendance_audit)?d.attendance_audit:[];
      loaded=true;
      return auditRows;
    })();
    try{return await loading;}finally{loading=null;}
  }

  function parseDetails(details){
    const text=String(details||'');
    let reason='';
    const fieldStarts=fieldLabels.map(label=>({label,index:text.indexOf('; '+label+': ')})).filter(x=>x.index>=0).sort((a,b)=>a.index-b.index);
    if(text.startsWith('Reason: ')){
      const end=fieldStarts.length?fieldStarts[0].index:text.indexOf('; Recalculated:');
      reason=text.slice(8,end>=0?end:text.length).trim();
    }
    const changes=[];
    const escaped=fieldLabels.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
    const re=new RegExp('(?:^|; )('+escaped+'): (.*?) -> (.*?)(?=; (?:'+escaped+'|Recalculated:)|$)','g');
    let m;
    while((m=re.exec(text))){changes.push({field:m[1],oldValue:m[2],newValue:m[3]});}
    const recalculated=(text.match(/; Recalculated: (.*?)(?=; Schedule |$)/)||[])[1]||'';
    const schedule=(text.match(/; Schedule (.*)$/)||[])[1]||'';
    if(!changes.length)changes.push({field:'Correction',oldValue:'—',newValue:'—'});
    return {reason:reason||'—',changes,recalculated,schedule};
  }

  function build(employeeId,month){
    const events=auditRows.filter(a=>String(a.action||'').toUpperCase()==='ADMIN_CORRECTION')
      .filter(a=>!employeeId||a.employee_id===employeeId)
      .filter(a=>!month||dateOnly(a.work_date).slice(0,7)===month)
      .sort((a,b)=>Number(b.id||0)-Number(a.id||0));
    const rows=[];
    events.forEach(a=>{
      const parsed=parseDetails(a.details);
      parsed.changes.forEach(c=>rows.push({
        auditId:a.id,attendanceId:a.attendance_id,employeeId:a.employee_id,employee:employeeName(a.employee_id),
        workDate:dateOnly(a.work_date),correctionTime:correctionTime(a.created_at),field:c.field,oldValue:c.oldValue,newValue:c.newValue,
        reason:parsed.reason,admin:a.actor_username||a.actor_role||'Admin',recalculated:parsed.recalculated,schedule:parsed.schedule
      }));
    });
    return {events,rows,employees:new Set(events.map(x=>x.employee_id)),attendance:new Set(events.map(x=>String(x.attendance_id))),sourceCount:auditRows.length};
  }

  function reportHtml(data,employeeId,month){
    const scope=employeeId?`${employeeId} — ${employeeName(employeeId)}`:'All Employees';
    const warning=data.sourceCount>=200?'<div style="margin:0 16px 14px;padding:10px;border-radius:8px;background:#fff4e5;color:#8a4b08">⚠ The audit source returned 200 rows, its current maximum. Older audit events may exist outside this report.</div>':'';
    const body=data.rows.length?data.rows.map(r=>`<tr><td>${esc9b(r.correctionTime)}</td><td>${esc9b(r.employeeId)} — ${esc9b(r.employee)}</td><td>${esc9b(r.workDate)}</td><td><span class="badge">${esc9b(r.field)}</span></td><td style="white-space:normal;min-width:170px">${esc9b(r.oldValue)}</td><td style="white-space:normal;min-width:170px">${esc9b(r.newValue)}</td><td style="white-space:normal;min-width:220px">${esc9b(r.reason)}</td><td>${esc9b(r.admin)}</td><td>${esc9b(r.auditId)}</td></tr>`).join(''):`<tr><td colspan="9" class="empty">No ADMIN_CORRECTION events for ${esc9b(scope)} in ${esc9b(monthLabel(month))}.</td></tr>`;
    return `<div class="section" style="margin-top:14px"><div class="section-head"><div><b>${esc9b(scope)} · ${esc9b(monthLabel(month))}</b><div class="muted" style="font-size:12px;margin-top:4px">Permanent attendance correction audit trail · Saudi/Riyadh time</div></div><span class="badge">Read only · no DB writes</span></div>
      <div class="cards" style="padding:16px"><div class="card">Correction Events<div class="stat">${data.events.length}</div></div><div class="card">Employees Corrected<div class="stat">${data.employees.size}</div></div><div class="card">Attendance Records<div class="stat">${data.attendance.size}</div></div><div class="card">Fields Changed<div class="stat">${data.rows.length}</div></div></div>
      ${warning}<div class="table-wrap"><table class="table"><thead><tr><th>Correction Time</th><th>Employee</th><th>Attendance Date</th><th>Field Changed</th><th>Old Value</th><th>New Value</th><th>Reason</th><th>Admin</th><th>Audit ID</th></tr></thead><tbody>${body}</tbody></table></div></div>`;
  }

  window.fc9bRender=async function(){
    const holder=document.getElementById('fc9b_result');if(!holder)return;
    holder.innerHTML='<div class="empty">Loading permanent correction audit trail…</div>';
    try{await loadAudit(false);const employeeId=selectedEmployee(),month=selectedMonth(),data=build(employeeId,month);reportCache[employeeId+'|'+month]=data;holder.innerHTML=reportHtml(data,employeeId,month);}catch(e){holder.innerHTML='<div class="empty">'+esc9b(e.message||'Could not load correction report')+'</div>';if(typeof toast==='function')toast(e.message||'Could not load correction report');}
  };

  window.fc9bExportCsv=async function(){
    try{await loadAudit(false);const employeeId=selectedEmployee(),month=selectedMonth(),data=reportCache[employeeId+'|'+month]||build(employeeId,month);const out=[['Audit ID','Attendance ID','Correction Time Riyadh','Employee ID','Employee','Attendance Date','Field Changed','Old Value','New Value','Reason','Admin','Recalculated','Schedule']];data.rows.forEach(r=>out.push([r.auditId,r.attendanceId,r.correctionTime,r.employeeId,r.employee,r.workDate,r.field,r.oldValue,r.newValue,r.reason,r.admin,r.recalculated,r.schedule]));const csv=out.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`attendance-corrections-${employeeId||'all'}-${month}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}catch(e){if(typeof toast==='function')toast(e.message||'Could not export correction report');}
  };

  window.fc9bPrint=async function(){
    try{
      await loadAudit(false);const employeeId=selectedEmployee(),month=selectedMonth(),data=reportCache[employeeId+'|'+month]||build(employeeId,month);const company=(state.settings&&state.settings.company)||'FILTER CITY',scope=employeeId?`${employeeId} — ${employeeName(employeeId)}`:'All Employees';const w=window.open('','_blank');if(!w)return toast('Allow pop-ups to print the correction report');
      const body=data.rows.length?data.rows.map(r=>`<tr><td>${esc9b(r.correctionTime)}</td><td>${esc9b(r.employeeId)} — ${esc9b(r.employee)}</td><td>${esc9b(r.workDate)}</td><td>${esc9b(r.field)}</td><td>${esc9b(r.oldValue)}</td><td>${esc9b(r.newValue)}</td><td>${esc9b(r.reason)}</td><td>${esc9b(r.admin)}</td><td>${esc9b(r.auditId)}</td></tr>`).join(''):'<tr><td colspan="9">No ADMIN_CORRECTION events.</td></tr>';
      const warning=data.sourceCount>=200?'<div class="warn">The audit source returned its current 200-row maximum. Older audit events may exist outside this report.</div>':'';
      w.document.open();w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc9b(company)} Attendance Correction Audit ${esc9b(month)}</title><style>body{font-family:Arial,sans-serif;color:#111;padding:22px}h1{margin:0 0 3px}h2{margin:0 0 5px;font-size:18px}.muted{font-size:11px;color:#555}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0}.box{border:1px solid #bbb;padding:9px}.big{font-size:18px;font-weight:bold;margin-top:4px}table{width:100%;border-collapse:collapse;font-size:9px}th,td{border:1px solid #bbb;padding:5px;text-align:left;vertical-align:top}th{background:#eee}.warn{margin:10px 0;padding:8px;border:1px solid #d5a328;font-size:10px}.foot{font-size:10px;margin-top:12px}@media print{body{padding:0}}</style></head><body><h1>${esc9b(company)}</h1><h2>Attendance Correction / Audit Report — ${esc9b(monthLabel(month))}</h2><div class="muted">Scope: ${esc9b(scope)} · Generated from FILTER CITY HRMS · Saudi/Riyadh</div><div class="summary"><div class="box">Correction Events<div class="big">${data.events.length}</div></div><div class="box">Employees Corrected<div class="big">${data.employees.size}</div></div><div class="box">Attendance Records<div class="big">${data.attendance.size}</div></div><div class="box">Fields Changed<div class="big">${data.rows.length}</div></div></div>${warning}<table><thead><tr><th>Correction Time</th><th>Employee</th><th>Attendance Date</th><th>Field</th><th>Old</th><th>New</th><th>Reason</th><th>Admin</th><th>Audit ID</th></tr></thead><tbody>${body}</tbody></table><div class="foot">This report reads the permanent ADMIN_CORRECTION audit trail and does not modify attendance or audit data.</div></body></html>`);w.document.close();setTimeout(()=>{w.focus();w.print();},300);
    }catch(e){if(typeof toast==='function')toast(e.message||'Could not print correction report');}
  };

  const previousViewReports=window.viewReports;
  window.viewReports=function(){
    const base=typeof previousViewReports==='function'?previousViewReports():'';
    if(!isAdmin())return base;
    const employees=(state.employees||[]).filter(e=>e.status!=='Inactive');
    const options='<option value="">All Employees</option>'+employees.map(e=>`<option value="${esc9b(e.employee_id)}">${esc9b(e.employee_id)} — ${esc9b(e.full_name)}</option>`).join('');
    const month=riyadhMonth();
    const panel=`<div class="section"><div class="section-head"><b>🧾 Attendance Correction / Audit Report — Step 9B</b><span class="badge">Admin · permanent audit</span></div><div style="padding:16px"><div class="muted" style="margin-bottom:12px">Shows permanent ADMIN_CORRECTION events with old → new values, reason, Admin identity and correction time. Report only; no attendance or audit data is changed.</div><div class="actions" style="align-items:end;gap:12px"><div class="field" style="margin:0;min-width:290px"><label>Employee</label><select id="fc9b_employee">${options}</select></div><div class="field" style="margin:0"><label>Month</label><input id="fc9b_month" type="month" value="${esc9b(month)}"></div><button onclick="fc9bRender()">View Audit Report</button><button class="secondary" onclick="fc9bExportCsv()">Export CSV</button><button class="secondary" onclick="fc9bPrint()">Print / Save PDF</button></div></div><div id="fc9b_result"><div class="empty">Choose employee/month and click View Audit Report.</div></div></div>`;
    return panel+base;
  };
})();
