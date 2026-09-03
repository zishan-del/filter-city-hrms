(function(){
  'use strict';
  if(window.__fcStep10AttendanceEmployeeFilterV2)return;
  window.__fcStep10AttendanceEmployeeFilterV2=true;

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  }
  function isArabic(){
    return document.documentElement.dir==='rtl' || String(document.documentElement.lang||'').toLowerCase().startsWith('ar');
  }
  function dateOnly(v){return v?String(v).slice(0,10):'';}

  function employeeDirectory(){
    var result=[];
    var seen=new Set();
    var employeeRows=(typeof state!=='undefined'&&state&&Array.isArray(state.employees))?state.employees:[];
    var attendanceRows=(typeof state!=='undefined'&&state&&Array.isArray(state.attendance))?state.attendance:[];
    var userRows=(typeof state!=='undefined'&&state&&Array.isArray(state.users))?state.users:[];

    employeeRows.forEach(function(e){
      var id=String(e.employee_id||'').trim();
      if(!id||seen.has(id))return;
      seen.add(id);
      result.push({
        employee_id:id,
        full_name:String(e.full_name||id),
        status:String(e.status||'Active')
      });
    });

    attendanceRows.forEach(function(a){
      var id=String(a.employee_id||'').trim();
      if(!id||seen.has(id))return;
      seen.add(id);
      result.push({employee_id:id,full_name:id,status:'Active'});
    });

    userRows.forEach(function(u){
      var id=String(u.employee_id||'').trim();
      if(!id||seen.has(id))return;
      seen.add(id);
      result.push({employee_id:id,full_name:id,status:u.active===false?'Inactive':'Active'});
    });

    result.sort(function(a,b){
      var sa=String(a.status||'Active')==='Active'?0:1;
      var sb=String(b.status||'Active')==='Active'?0:1;
      if(sa!==sb)return sa-sb;
      return String(a.employee_id||'').localeCompare(String(b.employee_id||''));
    });
    return result;
  }

  function attendanceFor(employeeId){
    var rows=(typeof state!=='undefined'&&state&&Array.isArray(state.attendance))?state.attendance:[];
    return rows.filter(function(a){return String(a.employee_id||'')===String(employeeId||'');})
      .sort(function(a,b){return dateOnly(b.work_date).localeCompare(dateOnly(a.work_date))||Number(b.id||0)-Number(a.id||0);});
  }

  function attendanceRow(id){
    var rows=(typeof state!=='undefined'&&state&&Array.isArray(state.attendance))?state.attendance:[];
    return rows.find(function(a){return String(a.id)===String(id);})||null;
  }

  function employeeName(id){
    var row=employeeDirectory().find(function(e){return String(e.employee_id||'')===String(id||'');});
    return row?String(row.full_name||row.employee_id||''):String(id||'');
  }

  function clearEditor(){
    ['fc8_checkin','fc8_checkout','fc8_break_start','fc8_break_end','fc8_lat','fc8_lng','fc8_acc','fc8_out_lat','fc8_out_lng','fc8_out_acc','fc8_reason'].forEach(function(id){
      var el=document.getElementById(id);if(el)el.value='';
    });
    var preview=document.getElementById('fc8_preview');
    if(preview)preview.innerHTML='<div class="empty">'+(isArabic()?'لا توجد سجلات حضور لهذا الموظف.':'No attendance records are available for this employee.')+'</div>';
    var audit=document.getElementById('fc8_audit');
    if(audit)audit.innerHTML='<div class="empty">'+(isArabic()?'لا توجد أحداث تدقيق لسجل حضور محدد.':'No attendance record is selected for audit history.')+'</div>';
  }

  function recordOptions(rows){
    return rows.map(function(a){
      return '<option value="'+esc(a.id)+'">'+esc(dateOnly(a.work_date))+' · '+esc(a.employee_id)+' — '+esc(employeeName(a.employee_id))+'</option>';
    }).join('');
  }

  function loadEmployeeRecords(){
    var employeeSelect=document.getElementById('fc10_attendance_employee');
    var recordSelect=document.getElementById('fc8_record');
    if(!employeeSelect||!recordSelect)return;

    var employeeId=String(employeeSelect.value||'');
    window.__fcStep10AttendanceSelectedEmployee=employeeId;
    var rows=attendanceFor(employeeId);

    if(!rows.length){
      recordSelect.innerHTML='<option value="">'+(isArabic()?'لا توجد سجلات حضور لهذا الموظف':'No attendance records for this employee')+'</option>';
      recordSelect.value='';
      clearEditor();
      return;
    }

    recordSelect.innerHTML=recordOptions(rows);
    recordSelect.value=String(rows[0].id);
    if(typeof window.fc8LoadRecord==='function')window.fc8LoadRecord();
  }
  window.fc10AttendanceEmployeeChanged=loadEmployeeRecords;

  function employeeOptions(list){
    return list.map(function(e){
      var inactive=String(e.status||'Active')!=='Active';
      return '<option value="'+esc(e.employee_id)+'">'+esc(e.employee_id)+' — '+esc(e.full_name||e.employee_id)+(inactive?(isArabic()?' (غير نشط)':' (Inactive)'):'')+'</option>';
    }).join('');
  }

  function ensureSelector(){
    var panel=document.getElementById('fcAttendanceCorrection8A');
    var recordSelect=document.getElementById('fc8_record');
    if(!panel||!recordSelect)return;
    var recordField=recordSelect.closest('.field');
    if(!recordField)return;

    var select=document.getElementById('fc10_attendance_employee');
    var created=false;
    if(!select){
      var holder=document.createElement('div');
      holder.className='field full';
      holder.id='fc10_attendance_employee_field';
      holder.innerHTML='<label id="fc10_attendance_employee_label"></label><select id="fc10_attendance_employee"></select>';
      recordField.parentNode.insertBefore(holder,recordField);
      select=holder.querySelector('select');
      select.addEventListener('change',loadEmployeeRecords);
      created=true;
    }

    var label=document.getElementById('fc10_attendance_employee_label');
    if(label)label.textContent=isArabic()?'الموظف':'Employee';
    var recordLabel=recordField.querySelector('label');
    if(recordLabel)recordLabel.textContent=isArabic()?'سجل الحضور':'Attendance Record';

    var intro=panel.querySelector(':scope > div:nth-child(2) > .muted');
    if(intro){
      intro.innerHTML=isArabic()
        ? 'اختر <b>الموظف</b> أولاً، ثم اختر سجل الحضور الخاص به، وأدخل القيم المصححة والسبب، ثم اضغط <b>معاينة</b>. يظهر زر الحفظ الفعلي فقط بعد معاينة صحيحة.'
        : 'Select an <b>employee</b> first, then choose that employee\'s attendance record, enter corrected values and a reason, then <b>Preview</b>. The real Save button appears only after a valid preview.';
    }

    var list=employeeDirectory();
    var signature=list.map(function(e){return [e.employee_id,e.full_name,e.status].join('|');}).join('||')+'|'+(isArabic()?'ar':'en');
    var previousValue=String(select.value||window.__fcStep10AttendanceSelectedEmployee||'');

    if(created||select.dataset.directorySignature!==signature){
      select.innerHTML=employeeOptions(list) || '<option value="">'+(isArabic()?'لا يوجد موظفون':'No employees available')+'</option>';
      select.dataset.directorySignature=signature;
    }

    var validPrevious=previousValue&&Array.prototype.some.call(select.options,function(o){return String(o.value)===previousValue;});
    var currentRecord=attendanceRow(recordSelect.value);
    var recordEmployee=currentRecord?String(currentRecord.employee_id||''):'';
    var validRecordEmployee=recordEmployee&&Array.prototype.some.call(select.options,function(o){return String(o.value)===recordEmployee;});

    if(validPrevious)select.value=previousValue;
    else if(validRecordEmployee)select.value=recordEmployee;
    else if(select.options.length)select.selectedIndex=0;

    window.__fcStep10AttendanceSelectedEmployee=String(select.value||'');

    var selectedEmployee=String(select.value||'');
    var selectedRow=attendanceRow(recordSelect.value);
    if(!selectedRow||String(selectedRow.employee_id||'')!==selectedEmployee){
      loadEmployeeRecords();
    }
  }

  var lastPanel=null;
  function ensureIfNeeded(){
    var panel=document.getElementById('fcAttendanceCorrection8A');
    if(!panel)return;
    if(panel!==lastPanel||!document.getElementById('fc10_attendance_employee')){
      lastPanel=panel;
      ensureSelector();
      return;
    }
    var select=document.getElementById('fc10_attendance_employee');
    var list=employeeDirectory();
    var signature=list.map(function(e){return [e.employee_id,e.full_name,e.status].join('|');}).join('||')+'|'+(isArabic()?'ar':'en');
    if(select&&select.dataset.directorySignature!==signature)ensureSelector();
  }

  var content=document.getElementById('content');
  if(content){
    new MutationObserver(function(){setTimeout(ensureIfNeeded,0);}).observe(content,{childList:true,subtree:true});
  }

  var previousRender=window.render;
  if(typeof previousRender==='function'){
    window.render=function(page){
      var result=previousRender.apply(this,arguments);
      if(page==='Attendance'){
        setTimeout(ensureIfNeeded,0);
        setTimeout(ensureIfNeeded,350);
        setTimeout(ensureIfNeeded,800);
      }
      return result;
    };
  }

  new MutationObserver(function(){
    if(document.getElementById('fcAttendanceCorrection8A'))setTimeout(ensureIfNeeded,0);
  }).observe(document.documentElement,{attributes:true,attributeFilter:['dir','lang']});

  setTimeout(ensureIfNeeded,150);
  setTimeout(ensureIfNeeded,600);
})();
