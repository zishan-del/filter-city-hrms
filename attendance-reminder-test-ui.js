(function(){
  'use strict';

  const escT = window.esc || function(x){
    return String(x == null ? '' : x).replace(/[&<>"']/g,function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  };

  function currentUser(){
    try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}catch(_){return {};}
  }

  function isAdmin(){
    return String(currentUser().role||'').toUpperCase()==='ADMIN';
  }

  function activeEmployees(){
    try{
      return (typeof state!=='undefined' && state && Array.isArray(state.employees) ? state.employees : [])
        .filter(function(e){return String(e.status||'').toLowerCase()==='active';});
    }catch(_){return [];}
  }

  function scenarioLabel(value){
    const labels={
      live:'Normal — use real data',
      not_checked_in:'Pretend Not Checked In',
      approved_leave:'Pretend Approved Leave',
      holiday:'Pretend Holiday',
      already_reminded:'Pretend Already Reminded'
    };
    return labels[value]||value;
  }

  function logicBadge(decision){
    if(decision==='ELIGIBLE')return '✅ ELIGIBLE';
    if(decision==='NO_PHONE')return '⚠ NO PHONE';
    return '⛔ SKIP';
  }

  async function checkLogic(){
    const employee=document.getElementById('fc_test_att_employee');
    const scenario=document.getElementById('fc_test_att_scenario');
    const btn=document.getElementById('fc_test_logic_btn');
    const result=document.getElementById('fc_test_logic_result');
    if(!employee||!employee.value){if(result)result.textContent='Please select an employee first.';return;}

    try{
      btn.disabled=true;
      btn.textContent='Checking...';
      result.innerHTML='<span class="muted">Checking automatic reminder rules. No data will be changed...</span>';
      const r=await fetch('/api/push/reminder-logic-test',{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')},
        body:JSON.stringify({employee_id:employee.value,scenario:scenario?scenario.value:'live'})
      });
      const d=await r.json().catch(function(){return {};});
      if(!r.ok)throw Error(d.error||'Reminder logic test failed');

      const actual=d.actual||{};
      result.innerHTML=
        '<div style="font-weight:700;font-size:16px;margin-bottom:7px">'+escT(logicBadge(d.decision))+' — '+escT(d.message||'')+'</div>'+ 
        '<div class="muted" style="font-size:12px;line-height:1.6">'+
          '<b>Employee:</b> '+escT(d.employee_name||d.employee_id)+'<br>'+ 
          '<b>Saudi date:</b> '+escT(d.date)+'<br>'+ 
          '<b>Test mode:</b> '+escT(scenarioLabel(d.scenario))+'<br>'+ 
          '<b>Real data today:</b> Checked in '+(actual.checked_in?'YES':'NO')+
          ' · Approved leave '+(actual.approved_leave?'YES':'NO')+
          ' · Holiday '+(actual.holiday?'YES':'NO')+
          ' · Already reminded '+(actual.already_reminded?'YES':'NO')+
          ' · Registered phones '+escT(actual.registered_phones==null?0:actual.registered_phones)+'<br>'+ 
          '<b>Database changes:</b> NONE (dry run)'+
        '</div>';
    }catch(e){
      result.textContent=e.message||'Reminder logic test failed';
      if(typeof toast==='function')toast(e.message||'Reminder logic test failed');
    }finally{
      btn.disabled=false;
      btn.textContent='Check Reminder Logic';
    }
  }

  async function sendTest(){
    const select=document.getElementById('fc_test_att_employee');
    const msg=document.getElementById('fc_test_att_msg');
    const btn=document.getElementById('fc_test_att_btn');
    if(!select||!select.value){if(msg)msg.textContent='Please select an employee first.';return;}
    try{
      btn.disabled=true;
      btn.textContent='Sending...';
      msg.textContent='Sending one real test notification to this employee only...';
      const r=await fetch('/api/push/test-attendance',{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')},
        body:JSON.stringify({employee_id:select.value})
      });
      const d=await r.json().catch(function(){return {};});
      if(!r.ok)throw Error(d.error||'Test reminder failed');
      msg.textContent='Sent successfully to '+(d.employee_name||select.value)+'. Delivered to '+(d.sent||0)+' registered phone(s).';
      if(typeof toast==='function')toast('Test attendance reminder sent');
    }catch(e){
      msg.textContent=e.message||'Test reminder failed';
      if(typeof toast==='function')toast(e.message||'Test reminder failed');
    }finally{
      btn.disabled=false;
      btn.textContent='Send Test Reminder';
    }
  }

  window.fcCheckAttendanceReminderLogic=checkLogic;
  window.fcSendAttendanceTest=sendTest;

  const previous=window.viewAttendance;
  window.viewAttendance=function(){
    const base=previous();
    if(!isAdmin())return base;

    const employees=activeEmployees();
    const options=employees.map(function(e){
      return '<option value="'+escT(e.employee_id)+'">'+escT(e.employee_id)+' — '+escT(e.full_name)+'</option>';
    }).join('');
    const disabled=employees.length?'':'disabled';

    const test='<div class="section" id="fcAttendanceTestBox">'+
      '<div class="section-head"><b>🔔 Attendance Reminder Test Panel</b><span class="badge">Admin test only</span></div>'+
      '<div style="padding:16px">'+
        '<div style="font-weight:700;margin-bottom:7px">1. Automatic Reminder Logic — Dry Run</div>'+
        '<div class="muted" style="margin-bottom:10px">This checks what the 8:15 AM Saudi reminder would do. It does not change attendance, leave, holiday, reminder logs, GPS, or any employee record.</div>'+
        '<div class="actions" style="align-items:center">'+
          '<select id="fc_test_att_employee" style="min-width:280px;padding:10px;border:1px solid #c9d2dd;border-radius:8px;background:#fff" '+disabled+'>'+ (options||'<option value="">No active employees found</option>') +'</select>'+
          '<select id="fc_test_att_scenario" style="min-width:230px;padding:10px;border:1px solid #c9d2dd;border-radius:8px;background:#fff" '+disabled+'>'+
            '<option value="live">Normal — use real data</option>'+
            '<option value="not_checked_in">Pretend Not Checked In</option>'+
            '<option value="approved_leave">Pretend Approved Leave</option>'+
            '<option value="holiday">Pretend Holiday</option>'+
            '<option value="already_reminded">Pretend Already Reminded</option>'+
          '</select>'+
          '<button id="fc_test_logic_btn" onclick="fcCheckAttendanceReminderLogic()" '+disabled+'>Check Reminder Logic</button>'+
        '</div>'+
        '<div id="fc_test_logic_result" style="margin-top:12px;padding:12px;border:1px solid #dce3eb;border-radius:8px;background:#f7f9fb">No dry-run test performed yet.</div>'+
        '<div style="border-top:1px solid #e4e9ef;margin:18px 0"></div>'+
        '<div style="font-weight:700;margin-bottom:7px">2. Real Push Test — Manual</div>'+
        '<div class="muted" style="margin-bottom:10px">This button sends one real Attendance Reminder only to the selected employee. It is separate from the automatic-rule dry run.</div>'+
        '<button id="fc_test_att_btn" onclick="fcSendAttendanceTest()" '+disabled+'>Send Test Reminder</button>'+
        '<div id="fc_test_att_msg" class="muted" style="margin-top:10px">No real test sent.</div>'+
      '</div>'+
    '</div>';

    return test+base;
  };
})();
