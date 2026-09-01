(function(){
  'use strict';
  const getUser=()=>{try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}')}catch(_){return {}}};
  const employeeRole=()=>String(getUser().role||role||'').toUpperCase();
  const escF=window.esc||((x)=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m])));
  const mins=v=>{const n=Number(v||0);return `${Math.floor(n/60)}h ${n%60}m`;};
  const riyadhDate=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const o={};p.forEach(x=>{if(x.type!=='literal')o[x.type]=x.value});return `${o.year}-${o.month}-${o.day}`;};

  // The app's global role defaults to ADMIN after a browser refresh. Restore the
  // authenticated role immediately so employee-only attendance controls do not disappear.
  try{const u=getUser();if(u.role)role=String(u.role).toUpperCase();}catch(_){ }

  const oldBoot=window.boot;
  if(typeof oldBoot==='function'){
    window.boot=async function(user){
      if(user&&user.role)role=String(user.role).toUpperCase();
      return await oldBoot(user);
    };
  }

  function requireGps(){
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(Error('GPS is not available on this device. Please enable Location/GPS.'));
      navigator.geolocation.getCurrentPosition(
        p=>resolve({latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy}),
        err=>{
          const msg=err&&err.code===1?'Location permission is blocked. Allow Location for FILTER CITY HRMS and try again.':err&&err.code===2?'GPS location is unavailable. Turn on Location/GPS and try again.':'Could not get GPS location. Please go near a window/outdoor area and try again.';
          reject(Error(msg));
        },
        {enableHighAccuracy:true,timeout:15000,maximumAge:0}
      );
    });
  }

  window.fcAttendanceAction=async function(action){
    try{
      let payload={action};
      if(action==='checkin'||action==='checkout'){
        if(typeof toast==='function')toast('Getting GPS location...');
        payload=Object.assign(payload,await requireGps());
      }
      await api('POST','attendance',payload);
      if(typeof toast==='function')toast(action==='checkin'?'Checked in with GPS':action==='checkout'?'Checked out with GPS':action==='break_start'?'Break started':'Break ended');
      await refresh();
    }catch(err){if(typeof toast==='function')toast(err.message||'Attendance action failed');}
  };

  const previousView=window.viewAttendance;
  window.viewAttendance=function(){
    const user=getUser();
    const r=employeeRole();
    const all=Array.isArray(state&&state.attendance)?state.attendance:[];
    const rows=r==='EMPLOYEE'?all.filter(a=>a.employee_id===user.employeeId):all;
    const today=riyadhDate();
    const mine=rows.find(a=>String(a.work_date).slice(0,10)===today);
    let controls='';
    if(r==='EMPLOYEE'){
      if(!mine) controls='<button onclick="fcAttendanceAction(\'checkin\')">Check In + GPS</button>';
      else if(!mine.check_out&&mine.break_start&&!mine.break_end) controls='<button onclick="fcAttendanceAction(\'break_end\')">End Break</button>';
      else if(!mine.check_out) controls=`<button onclick="fcAttendanceAction('break_start')">Start Break</button><button class="secondary" onclick="fcAttendanceAction('checkout')">Check Out + GPS</button>`;
      else controls='<span class="badge">Day completed</span>';
    }
    const employeeName=id=>{const x=(state.employees||[]).find(a=>a.employee_id===id);return x?x.full_name:id};
    const gpsWarning=r==='EMPLOYEE'&&mine&&mine.latitude==null?'<div style="margin:0 16px 12px;padding:10px;border-radius:8px;background:#fff4e5;color:#8a4b08;font-size:13px">⚠ Check-in GPS was not captured for this existing record. Future Check In and Check Out actions will require GPS.</div>':'';
    const cards=r==='EMPLOYEE'&&mine?`<div style="padding:16px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><div class="card"><b>Check In</b><div>${escF(mine.check_in||'—')}</div><div class="muted" style="font-size:11px;margin-top:4px">${mine.latitude!=null?`📍 ${escF(mine.latitude)}, ${escF(mine.longitude)}${mine.checkin_accuracy?` ±${escF(mine.checkin_accuracy)}m`:''}`:'GPS not captured'}</div></div><div class="card"><b>Break</b><div>${mine.break_start?(mine.break_end?`${escF(mine.break_start)} → ${escF(mine.break_end)} (${mins(mine.break_duration_minutes)})`:`Started ${escF(mine.break_start)}`):'—'}</div></div><div class="card"><b>Check Out</b><div>${escF(mine.check_out||'—')}</div><div class="muted" style="font-size:11px;margin-top:4px">${mine.checkout_latitude!=null?`📍 ${escF(mine.checkout_latitude)}, ${escF(mine.checkout_longitude)}${mine.checkout_accuracy?` ±${escF(mine.checkout_accuracy)}m`:mine.check_out?'GPS not captured':'Waiting for checkout'}</div></div><div class="card"><b>Working</b><div>${mine.working_minutes?mins(mine.working_minutes):'—'}</div></div></div>`:'';
    const html=`<div class="section"><div class="section-head"><b>Attendance</b><div class="actions">${controls}</div></div>${cards}${gpsWarning}<div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check-in GPS</th><th>Break</th><th>Check Out</th><th>Checkout GPS</th><th>Working</th><th>Late</th><th>Early</th><th>Overtime</th><th>Night</th><th>Status</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${escF(employeeName(a.employee_id))}</td><td>${escF(String(a.work_date).slice(0,10))}</td><td>${escF(a.check_in||'—')}</td><td>${a.latitude!=null?escF(`${a.latitude}, ${a.longitude}${a.checkin_accuracy?` ±${a.checkin_accuracy}m`:''}`):'—'}</td><td>${a.break_start?escF(a.break_end?`${a.break_start} → ${a.break_end} (${mins(a.break_duration_minutes)})`:`Started ${a.break_start}`):'—'}</td><td>${escF(a.check_out||'—')}</td><td>${a.checkout_latitude!=null?escF(`${a.checkout_latitude}, ${a.checkout_longitude}${a.checkout_accuracy?` ±${a.checkout_accuracy}m`:''}`):'—'}</td><td>${a.working_minutes?mins(a.working_minutes):'—'}</td><td>${a.late_minutes?mins(a.late_minutes):'0m'}</td><td>${a.early_checkout_minutes?mins(a.early_checkout_minutes):'0m'}</td><td>${a.overtime_minutes?mins(a.overtime_minutes):'0m'}</td><td>${a.night_minutes?mins(a.night_minutes):'0m'}</td><td><span class="badge">${escF(a.status||'')}</span></td></tr>`).join('')||'<tr><td colspan="13" class="empty">No attendance records.</td></tr>'}</tbody></table></div></div>`;
    return html;
  };

  // If the employee is already on Attendance when this overlay loads, repaint it.
  try{if(typeof render==='function'&&current==='Attendance')render('Attendance');}catch(_){ }
})();
