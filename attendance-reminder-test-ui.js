(function(){
  'use strict';
  const escT = window.esc || (x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])));
  const isAdmin=()=>String((JSON.parse(sessionStorage.getItem('fc_user')||'{}').role)||'').toUpperCase()==='ADMIN';
  const activeEmployees=()=>{
    try{
      return (typeof state!=='undefined' && state && Array.isArray(state.employees) ? state.employees : [])
        .filter(e=>String(e.status||'').toLowerCase()==='active');
    }catch(_){return [];}
  };
  async function sendTest(){
    const select=document.getElementById('fc_test_att_employee');
    const msg=document.getElementById('fc_test_att_msg');
    const btn=document.getElementById('fc_test_att_btn');
    if(!select||!select.value){if(msg)msg.textContent='Please select an employee first.';return;}
    try{
      btn.disabled=true;btn.textContent='Sending...';msg.textContent='Sending test reminder to this employee only...';
      const r=await fetch('/api/push/test-attendance',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')},body:JSON.stringify({employee_id:select.value})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw Error(d.error||'Test reminder failed');
      msg.textContent=`Sent successfully to ${d.employee_name||select.value}. Delivered to ${d.sent||0} registered phone(s).`;
      if(typeof toast==='function')toast('Test attendance reminder sent');
    }catch(e){msg.textContent=e.message||'Test reminder failed';if(typeof toast==='function')toast(e.message||'Test reminder failed');}
    finally{btn.disabled=false;btn.textContent='Send Test Reminder';}
  }
  window.fcSendAttendanceTest=sendTest;
  const previous=window.viewAttendance;
  window.viewAttendance=function(){
    const base=previous();
    if(!isAdmin())return base;
    const employees=activeEmployees();
    const options=employees.map(e=>`<option value="${escT(e.employee_id)}">${escT(e.employee_id)} — ${escT(e.full_name)}</option>`).join('');
    const test=`<div class="section" id="fcAttendanceTestBox"><div class="section-head"><b>🔔 Test Attendance Reminder</b><span class="badge">Admin test only</span></div><div style="padding:16px"><div class="muted" style="margin-bottom:10px">Choose one employee. This sends a test notification only to that employee's registered phone.</div><div class="actions" style="align-items:center"><select id="fc_test_att_employee" style="min-width:280px;padding:10px;border:1px solid #c9d2dd;border-radius:8px;background:#fff" ${employees.length?'':'disabled'}>${options||'<option value="">No active employees found</option>'}</select><button id="fc_test_att_btn" onclick="fcSendAttendanceTest()" ${employees.length?'':'disabled'}>Send Test Reminder</button></div><div id="fc_test_att_msg" class="muted" style="margin-top:10px">${employees.length?`${employees.length} active employee(s) available for testing.`:'Employee list is not available.'}</div></div></div>`;
    return test+base;
  };
})();
