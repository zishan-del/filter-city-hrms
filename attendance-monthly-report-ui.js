(function(){
  'use strict';
  if(window.__fcAttendanceMonthlyReport) return;
  window.__fcAttendanceMonthlyReport = true;

  const previousViewReports = window.viewReports;
  const escR5 = window.esc || function(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g,function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  };

  function user(){
    try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}catch(_){return {};}
  }
  function isAdmin(){return String(user().role||'').toUpperCase()==='ADMIN';}
  function riyadhMonth(){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit'}).formatToParts(new Date());
    const y=parts.find(p=>p.type==='year')?.value||'';
    const m=parts.find(p=>p.type==='month')?.value||'';
    return y&&m?`${y}-${m}`:'';
  }
  function monthLabel(value){
    const m=String(value||'').match(/^(\d{4})-(\d{2})$/);
    if(!m)return value||'';
    return new Intl.DateTimeFormat('en',{timeZone:'Asia/Riyadh',month:'long',year:'numeric'}).format(new Date(Date.UTC(Number(m[1]),Number(m[2])-1,1,12)));
  }
  function mins(value){
    const n=Math.max(0,Number(value||0));
    return Math.floor(n/60)+'h '+Math.round(n%60)+'m';
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
  function selectedEmployee(){return document.getElementById('fc_r5_employee')?.value||'';}
  function selectedMonth(){return document.getElementById('fc_r5_month')?.value||riyadhMonth();}
  function rowsFor(employeeId,month){
    return (state.attendance||[])
      .filter(a=>a.employee_id===employeeId && dateOnly(a.work_date).slice(0,7)===month)
      .sort((a,b)=>dateOnly(a.work_date).localeCompare(dateOnly(b.work_date)));
  }
  function sum(rows,key){return rows.reduce((total,row)=>total+Number(row[key]||0),0);}

  function reportMarkup(employeeId,month){
    if(!employeeId)return '<div class="empty">Choose an employee to view the monthly attendance report.</div>';
    const rows=rowsFor(employeeId,month);
    const present=rows.filter(r=>String(r.status||'').toLowerCase()==='present').length;
    const absent=rows.filter(r=>String(r.status||'').toLowerCase()==='absent').length;
    const working=sum(rows,'working_minutes');
    const breakM=sum(rows,'break_duration_minutes');
    const late=sum(rows,'late_minutes');
    const early=sum(rows,'early_checkout_minutes');
    const overtime=sum(rows,'overtime_minutes');
    const night=sum(rows,'night_minutes');
    const employee=employeeName(employeeId);

    return '<div class="section" style="margin-top:14px">'+
      '<div class="section-head"><b>'+escR5(employeeId)+' — '+escR5(employee)+' · '+escR5(monthLabel(month))+'</b><span class="badge">Recorded attendance only</span></div>'+
      '<div class="cards" style="padding:16px">'+
        '<div class="card">Recorded Days<div class="stat">'+rows.length+'</div></div>'+
        '<div class="card">Present<div class="stat">'+present+'</div></div>'+
        '<div class="card">Recorded Absent<div class="stat">'+absent+'</div></div>'+
        '<div class="card">Working<div class="stat" style="font-size:21px">'+mins(working)+'</div></div>'+
      '</div>'+
      '<div class="cards" style="padding:0 16px 16px">'+
        '<div class="card">Break<div class="stat" style="font-size:21px">'+mins(breakM)+'</div></div>'+
        '<div class="card">Late<div class="stat" style="font-size:21px">'+mins(late)+'</div></div>'+
        '<div class="card">Early<div class="stat" style="font-size:21px">'+mins(early)+'</div></div>'+
        '<div class="card">Overtime<div class="stat" style="font-size:21px">'+mins(overtime)+'</div></div>'+
      '</div>'+
      '<div style="padding:0 16px 14px" class="muted">Night working: <b>'+mins(night)+'</b>. Absence here counts only records explicitly stored as Absent; scheduled-day absence calculation will be added when work-schedule rules are defined.</div>'+
      '<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Check In</th><th>Check-in GPS</th><th>Break</th><th>Check Out</th><th>Checkout GPS</th><th>Working</th><th>Late</th><th>Early</th><th>Overtime</th><th>Night</th><th>Status</th></tr></thead><tbody>'+
      (rows.length?rows.map(a=>'<tr>'+
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
        '<td><span class="badge">'+escR5(a.status||'')+'</span></td>'+
      '</tr>').join(''):'<tr><td colspan="12" class="empty">No attendance records for '+escR5(monthLabel(month))+'.</td></tr>')+
      '</tbody></table></div></div>';
  }

  window.fcRenderAttendanceMonthlyReport=function(){
    const holder=document.getElementById('fc_r5_result');
    if(!holder)return;
    holder.innerHTML=reportMarkup(selectedEmployee(),selectedMonth());
  };

  window.fcDownloadAttendanceMonthlyCsv=function(){
    const employeeId=selectedEmployee(),month=selectedMonth();
    if(!employeeId)return toast('Choose an employee first');
    const rows=rowsFor(employeeId,month);
    const data=[['Employee ID','Employee','Date','Check In','Check-in GPS','Break Start','Break End','Break Minutes','Check Out','Checkout GPS','Working Minutes','Late Minutes','Early Minutes','Overtime Minutes','Night Minutes','Status']];
    rows.forEach(a=>data.push([employeeId,employeeName(employeeId),dateOnly(a.work_date),a.check_in||'',gps(a.latitude,a.longitude,a.checkin_accuracy),a.break_start||'',a.break_end||'',Number(a.break_duration_minutes||0),a.check_out||'',gps(a.checkout_latitude,a.checkout_longitude,a.checkout_accuracy),Number(a.working_minutes||0),Number(a.late_minutes||0),Number(a.early_checkout_minutes||0),Number(a.overtime_minutes||0),Number(a.night_minutes||0),a.status||'']));
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
    const first=employees[0]?.employee_id||'';
    const month=riyadhMonth();
    const step5='<div class="section"><div class="section-head"><b>📊 Monthly Employee Attendance Report — Step 5</b><span class="badge">Admin</span></div>'+
      '<div class="form-grid">'+
        '<div class="field"><label>Employee</label><select id="fc_r5_employee">'+options+'</select></div>'+
        '<div class="field"><label>Month</label><input id="fc_r5_month" type="month" value="'+escR5(month)+'"></div>'+
        '<div class="field" style="align-self:end"><div class="actions"><button onclick="fcRenderAttendanceMonthlyReport()">View Report</button><button class="secondary" onclick="fcDownloadAttendanceMonthlyCsv()">Export CSV</button></div></div>'+
      '</div><div id="fc_r5_result">'+reportMarkup(first,month)+'</div></div>';
    return step5+base;
  };

  if(typeof render==='function'&&current==='Reports')render('Reports');
})();
