(function(){
  'use strict';
  if(window.__fcStep10AttendanceEmployeeFilter)return;
  window.__fcStep10AttendanceEmployeeFilter=true;

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  }
  function isArabic(){
    return document.documentElement.dir==='rtl' || String(document.documentElement.lang||'').toLowerCase().startsWith('ar');
  }
  function dateOnly(v){return v?String(v).slice(0,10):'';}
  function employees(){
    var list=(typeof state!=='undefined'&&state&&Array.isArray(state.employees))?state.employees:[];
    return list.slice().sort(function(a,b){
      var sa=String(a.status||'Active')==='Active'?0:1;
      var sb=String(b.status||'Active')==='Active'?0:1;
      if(sa!==sb)return sa-sb;
      return String(a.employee_id||'').localeCompare(String(b.employee_id||''));
    });
  }
  function attendanceFor(employeeId){
    var rows=(typeof state!=='undefined'&&state&&Array.isArray(state.attendance))?state.attendance:[];
    return rows.filter(function(a){return String(a.employee_id||'')===String(employeeId||'');})
      .sort(function(a,b){return dateOnly(b.work_date).localeCompare(dateOnly(a.work_date))||Number(b.id||0)-Number(a.id||0);});
  }
  function employeeForAttendanceId(id){
    var rows=(typeof state!=='undefined'&&state&&Array.isArray(state.attendance))?state.attendance:[];
    var row=rows.find(function(a){return String(a.id)===String(id);});
    return row?String(row.employee_id||''):'';
  }
  function employeeName(id){
    var row=employees().find(function(e){return String(e.employee_id||'')===String(id||'');});
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
  function loadEmployeeRecords(){
    var employeeSelect=document.getElementById('fc10_attendance_employee');
    var recordSelect=document.getElementById('fc8_record');
    if(!employeeSelect||!recordSelect)return;
    var employeeId=employeeSelect.value;
    window.__fcStep10AttendanceSelectedEmployee=employeeId;
    var rows=attendanceFor(employeeId);
    if(!rows.length){
      recordSelect.innerHTML='<option value="">'+(isArabic()?'لا توجد سجلات حضور لهذا الموظف':'No attendance records for this employee')+'</option>';
      recordSelect.value='';
      clearEditor();
      return;
    }
    recordSelect.innerHTML=rows.map(function(a){
      return '<option value="'+esc(a.id)+'">'+esc(dateOnly(a.work_date))+' · '+esc(a.employee_id)+' — '+esc(employeeName(a.employee_id))+'</option>';
    }).join('');
    recordSelect.value=String(rows[0].id);
    if(typeof window.fc8LoadRecord==='function')window.fc8LoadRecord();
  }
  window.fc10AttendanceEmployeeChanged=loadEmployeeRecords;

  function ensureSelector(){
    var panel=document.getElementById('fcAttendanceCorrection8A');
    var recordSelect=document.getElementById('fc8_record');
    if(!panel||!recordSelect)return;
    var recordField=recordSelect.closest('.field');
    if(!recordField)return;

    var select=document.getElementById('fc10_attendance_employee');
    if(!select){
      var holder=document.createElement('div');
      holder.className='field full';
      holder.id='fc10_attendance_employee_field';
      holder.innerHTML='<label id="fc10_attendance_employee_label"></label><select id="fc10_attendance_employee" onchange="fc10AttendanceEmployeeChanged()"></select>';
      recordField.parentNode.insertBefore(holder,recordField);
      select=holder.querySelector('select');
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

    var list=employees();
    var current=String(window.__fcStep10AttendanceSelectedEmployee||'');
    var recordEmployee=employeeForAttendanceId(recordSelect.value);
    var preferred=current&&list.some(function(e){return String(e.employee_id)===current;})?current:recordEmployee;
    if(!preferred&&list.length)preferred=String(list[0].employee_id||'');

    var options=list.map(function(e){
      var inactive=String(e.status||'Active')!=='Active';
      return '<option value="'+esc(e.employee_id)+'">'+esc(e.employee_id)+' — '+esc(e.full_name||e.employee_id)+(inactive?(isArabic()?' (غير نشط)':' (Inactive)'):'')+'</option>';
    }).join('');
    if(!options)options='<option value="">'+(isArabic()?'لا يوجد موظفون':'No employees available')+'</option>';

    if(select.innerHTML!==options)select.innerHTML=options;
    if(preferred&&Array.prototype.some.call(select.options,function(o){return String(o.value)===preferred;}))select.value=preferred;

    var selected=select.value;
    var allowed=attendanceFor(selected);
    var currentRecord=String(recordSelect.value||'');
    var currentAllowed=allowed.some(function(a){return String(a.id)===currentRecord;});
    if(!currentAllowed){
      if(allowed.length){
        recordSelect.innerHTML=allowed.map(function(a){
          return '<option value="'+esc(a.id)+'">'+esc(dateOnly(a.work_date))+' · '+esc(a.employee_id)+' — '+esc(employeeName(a.employee_id))+'</option>';
        }).join('');
        recordSelect.value=String(allowed[0].id);
        if(typeof window.fc8LoadRecord==='function')window.fc8LoadRecord();
      }else{
        recordSelect.innerHTML='<option value="">'+(isArabic()?'لا توجد سجلات حضور لهذا الموظف':'No attendance records for this employee')+'</option>';
        clearEditor();
      }
    }
  }

  var content=document.getElementById('content');
  if(content){
    new MutationObserver(function(){setTimeout(ensureSelector,0);}).observe(content,{childList:true,subtree:true});
  }
  var previousRender=window.render;
  if(typeof previousRender==='function'){
    window.render=function(page){
      var result=previousRender.apply(this,arguments);
      if(page==='Attendance'){setTimeout(ensureSelector,0);setTimeout(ensureSelector,350);}
      return result;
    };
  }
  setTimeout(ensureSelector,150);
  setTimeout(ensureSelector,600);
})();
