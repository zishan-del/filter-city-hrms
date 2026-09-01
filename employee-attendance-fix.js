(function(){
  'use strict';

  function currentUser(){
    try { return JSON.parse(sessionStorage.getItem('fc_user') || '{}'); }
    catch (_) { return {}; }
  }

  function escF(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  }

  function minutesText(value){
    var n = Number(value || 0);
    return Math.floor(n / 60) + 'h ' + (n % 60) + 'm';
  }

  function riyadhDate(){
    var parts = new Intl.DateTimeFormat('en-CA', {
      timeZone:'Asia/Riyadh', year:'numeric', month:'2-digit', day:'2-digit'
    }).formatToParts(new Date());
    var obj = {};
    parts.forEach(function(p){ if(p.type !== 'literal') obj[p.type] = p.value; });
    return obj.year + '-' + obj.month + '-' + obj.day;
  }

  try {
    var saved = currentUser();
    if(saved.role) role = String(saved.role).toUpperCase();
  } catch (_) {}

  var oldBoot = window.boot;
  if(typeof oldBoot === 'function'){
    window.boot = async function(user){
      try { if(user && user.role) role = String(user.role).toUpperCase(); } catch (_) {}
      return await oldBoot(user);
    };
  }

  function requireGps(){
    return new Promise(function(resolve, reject){
      if(!navigator.geolocation){
        reject(new Error('Location/GPS is not available on this device. Turn on Location and try again.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function(p){
          resolve({latitude:p.coords.latitude, longitude:p.coords.longitude, accuracy:p.coords.accuracy});
        },
        function(err){
          var msg = 'Could not get your location. Turn on Location/GPS and allow Location for FILTER CITY HRMS, then try again.';
          if(err && err.code === 1) msg = 'Location is off or access is blocked. Turn on Location/GPS and allow Location for FILTER CITY HRMS, then try again.';
          else if(err && err.code === 2) msg = 'Location is unavailable. Turn on Location/GPS, wait a few seconds, then try again.';
          else if(err && err.code === 3) msg = 'GPS request timed out. Keep Location/GPS on and try again near a window or outdoor area.';
          reject(new Error(msg));
        },
        {enableHighAccuracy:true, timeout:15000, maximumAge:0}
      );
    });
  }

  window.fcAttendanceAction = async function(action){
    try {
      var payload = {action:action};
      if(action === 'checkin' || action === 'checkout'){
        if(typeof toast === 'function') toast('Getting GPS location...');
        var pos = await requireGps();
        payload.latitude = pos.latitude;
        payload.longitude = pos.longitude;
        payload.accuracy = pos.accuracy;
      }
      await api('POST', 'attendance', payload);
      if(typeof toast === 'function'){
        if(action === 'checkin') toast('Checked in with GPS');
        else if(action === 'checkout') toast('Checked out with GPS');
        else if(action === 'break_start') toast('Break started');
        else toast('Break ended');
      }
      await refresh();
    } catch (err) {
      if(typeof toast === 'function') toast(err.message || 'Attendance action failed');
    }
  };

  window.viewAttendance = function(){
    var user = currentUser();
    var employee = String(user.role || '').toUpperCase() === 'EMPLOYEE';
    var all = (typeof state !== 'undefined' && state && Array.isArray(state.attendance)) ? state.attendance : [];
    var rows = employee ? all.filter(function(a){ return a.employee_id === user.employeeId; }) : all;
    var today = riyadhDate();
    var mine = rows.find(function(a){ return String(a.work_date).slice(0,10) === today; });
    var controls = '';

    if(employee){
      if(!mine){
        controls = '<button onclick="fcAttendanceAction(\'checkin\')">Check In + GPS</button>';
      } else if(!mine.check_out && mine.break_start && !mine.break_end){
        controls = '<button onclick="fcAttendanceAction(\'break_end\')">End Break</button>';
      } else if(!mine.check_out){
        controls = '<button onclick="fcAttendanceAction(\'break_start\')">Start Break</button>' +
                   '<button class="secondary" onclick="fcAttendanceAction(\'checkout\')">Check Out + GPS</button>';
      } else {
        controls = '<span class="badge">Day completed</span>';
      }
    }

    function employeeName(id){
      var list = (typeof state !== 'undefined' && state && Array.isArray(state.employees)) ? state.employees : [];
      var found = list.find(function(e){ return e.employee_id === id; });
      return found ? found.full_name : id;
    }

    var cards = '';
    var gpsWarning = '';
    if(employee && mine){
      var checkinGps = mine.latitude != null
        ? '📍 ' + escF(mine.latitude) + ', ' + escF(mine.longitude) + (mine.checkin_accuracy ? ' ±' + escF(mine.checkin_accuracy) + 'm' : '')
        : 'GPS not captured';
      var checkoutGps = mine.checkout_latitude != null
        ? '📍 ' + escF(mine.checkout_latitude) + ', ' + escF(mine.checkout_longitude) + (mine.checkout_accuracy ? ' ±' + escF(mine.checkout_accuracy) + 'm' : '')
        : (mine.check_out ? 'GPS not captured' : 'Waiting for checkout');
      var breakText = '—';
      if(mine.break_start){
        breakText = mine.break_end
          ? escF(mine.break_start) + ' → ' + escF(mine.break_end) + ' (' + minutesText(mine.break_duration_minutes) + ')'
          : 'Started ' + escF(mine.break_start);
      }
      cards = '<div style="padding:16px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">' +
        '<div class="card"><b>Check In</b><div>' + escF(mine.check_in || '—') + '</div><div class="muted" style="font-size:11px;margin-top:4px">' + checkinGps + '</div></div>' +
        '<div class="card"><b>Break</b><div>' + breakText + '</div></div>' +
        '<div class="card"><b>Check Out</b><div>' + escF(mine.check_out || '—') + '</div><div class="muted" style="font-size:11px;margin-top:4px">' + checkoutGps + '</div></div>' +
        '<div class="card"><b>Working</b><div>' + (mine.working_minutes ? minutesText(mine.working_minutes) : '—') + '</div></div>' +
        '</div>';
      if(mine.latitude == null){
        gpsWarning = '<div style="margin:0 16px 12px;padding:10px;border-radius:8px;background:#fff4e5;color:#8a4b08;font-size:13px">⚠ Check-in GPS was not captured for this existing record. Future Check In and Check Out actions require GPS.</div>';
      }
    }

    var body = rows.map(function(a){
      return '<tr>' +
        '<td>' + escF(employeeName(a.employee_id)) + '</td>' +
        '<td>' + escF(String(a.work_date).slice(0,10)) + '</td>' +
        '<td>' + escF(a.check_in || '—') + '</td>' +
        '<td>' + (a.latitude != null ? escF(a.latitude + ', ' + a.longitude + (a.checkin_accuracy ? ' ±' + a.checkin_accuracy + 'm' : '')) : '—') + '</td>' +
        '<td>' + (a.break_start ? escF(a.break_end ? a.break_start + ' → ' + a.break_end + ' (' + minutesText(a.break_duration_minutes) + ')' : 'Started ' + a.break_start) : '—') + '</td>' +
        '<td>' + escF(a.check_out || '—') + '</td>' +
        '<td>' + (a.checkout_latitude != null ? escF(a.checkout_latitude + ', ' + a.checkout_longitude + (a.checkout_accuracy ? ' ±' + a.checkout_accuracy + 'm' : '')) : '—') + '</td>' +
        '<td>' + (a.working_minutes ? minutesText(a.working_minutes) : '—') + '</td>' +
        '<td>' + (a.late_minutes ? minutesText(a.late_minutes) : '0m') + '</td>' +
        '<td>' + (a.early_checkout_minutes ? minutesText(a.early_checkout_minutes) : '0m') + '</td>' +
        '<td>' + (a.overtime_minutes ? minutesText(a.overtime_minutes) : '0m') + '</td>' +
        '<td>' + (a.night_minutes ? minutesText(a.night_minutes) : '0m') + '</td>' +
        '<td><span class="badge">' + escF(a.status || '') + '</span></td>' +
        '</tr>';
    }).join('');

    if(!body) body = '<tr><td colspan="13" class="empty">No attendance records.</td></tr>';

    return '<div class="section">' +
      '<div class="section-head"><b>Attendance</b><div class="actions">' + controls + '</div></div>' +
      cards + gpsWarning +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      '<th>Employee</th><th>Date</th><th>Check In</th><th>Check-in GPS</th><th>Break</th><th>Check Out</th><th>Checkout GPS</th><th>Working</th><th>Late</th><th>Early</th><th>Overtime</th><th>Night</th><th>Status</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div></div>';
  };

  window.__fcEmployeeAttendanceFixV2 = true;
})();
