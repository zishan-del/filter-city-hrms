(function(){
  'use strict';
  if(window.__fcStep10EmployeesValidation) return;
  window.__fcStep10EmployeesValidation = true;

  const previousSaveEmployee = window.saveEmployee;
  const previousViewEmployees = window.viewEmployees;
  if(typeof previousSaveEmployee !== 'function') return;

  let saving = false;

  function arabic(){
    return document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
  }

  function text(en, ar){
    return arabic() ? ar : en;
  }

  function showError(input, en, ar){
    if(input){
      input.setAttribute('aria-invalid','true');
      input.focus();
    }
    if(typeof toast === 'function') toast(text(en, ar));
    return false;
  }

  function clearInvalid(){
    ['employee_id','full_name','salary','payroll_allowances','leave_cycle_years','planned_leave_days'].forEach(function(id){
      const el = document.getElementById(id);
      if(el) el.removeAttribute('aria-invalid');
    });
  }

  window.saveEmployee = async function(){
    if(saving) return;

    clearInvalid();

    const employeeId = document.getElementById('employee_id');
    const fullName = document.getElementById('full_name');
    const salary = document.getElementById('salary');
    const allowances = document.getElementById('payroll_allowances');
    const leaveCycleYears = document.getElementById('leave_cycle_years');
    const plannedLeaveDays = document.getElementById('planned_leave_days');

    const employeeIdValue = String(employeeId?.value || '').trim();
    const fullNameValue = String(fullName?.value || '').trim();

    if(!employeeIdValue){
      return showError(employeeId, 'Employee ID is required.', 'رقم الموظف مطلوب.');
    }
    if(!fullNameValue){
      return showError(fullName, 'Full name is required.', 'اسم الموظف الكامل مطلوب.');
    }

    if(employeeId) employeeId.value = employeeIdValue;
    if(fullName) fullName.value = fullNameValue;

    if(salary && salary.value !== ''){
      const value = Number(salary.value);
      if(!Number.isFinite(value) || value < 0){
        return showError(salary, 'Salary must be zero or a positive number.', 'يجب أن يكون الراتب صفراً أو رقماً موجباً.');
      }
    }

    if(allowances && allowances.value !== ''){
      const value = Number(allowances.value);
      if(!Number.isFinite(value) || value < 0){
        return showError(allowances, 'Payroll allowances must be zero or a positive number.', 'يجب أن تكون بدلات الرواتب صفراً أو رقماً موجباً.');
      }
    }

    if(leaveCycleYears){
      const raw = String(leaveCycleYears.value || '').trim();
      const value = Number(raw);
      if(!raw || !Number.isFinite(value) || value <= 0){
        return showError(leaveCycleYears, 'Leave cycle must be a positive number of years.', 'يجب أن تكون دورة الإجازة عدداً موجباً من السنوات.');
      }
    }

    if(plannedLeaveDays){
      const raw = String(plannedLeaveDays.value || '').trim();
      const value = Number(raw);
      if(!raw || !Number.isInteger(value) || value < 30 || value > 60){
        return showError(plannedLeaveDays, 'Planned leave days must be a whole number from 30 to 60.', 'يجب أن تكون أيام الإجازة المخططة عدداً صحيحاً من 30 إلى 60.');
      }
    }

    saving = true;
    try{
      return await previousSaveEmployee.apply(this, arguments);
    }catch(err){
      if(typeof toast === 'function') toast(err?.message || text('Employee could not be saved.', 'تعذر حفظ الموظف.'));
      console.error('Step 10 employee save failed', err);
    }finally{
      saving = false;
    }
  };

  window.fcStep10EditEmployee = function(id){
    const numericId = Number(id);
    const employees = (typeof state !== 'undefined' && state && Array.isArray(state.employees)) ? state.employees : [];
    const employee = employees.find(function(item){ return Number(item.id) === numericId; });
    if(!employee){
      if(typeof toast === 'function') toast(text('Employee record could not be found.', 'تعذر العثور على سجل الموظف.'));
      return;
    }
    employeeForm(employee);
  };

  function printDate(){
    try{
      return new Intl.DateTimeFormat(arabic()?'ar-SA':'en-GB',{
        timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'
      }).format(new Date());
    }catch(_){return new Date().toISOString().slice(0,10);}
  }

  window.fcPrintAllEmployees = function(){
    if(typeof role !== 'undefined' && role !== 'ADMIN'){
      if(typeof toast==='function') toast(text('Admin only.','للمسؤول فقط.'));
      return;
    }
    const employees=(typeof state!=='undefined'&&state&&Array.isArray(state.employees))?state.employees:[];
    const users=(typeof state!=='undefined'&&state&&Array.isArray(state.users))?state.users:[];
    if(!employees.length){
      if(typeof toast==='function') toast(text('No employees to print.','لا يوجد موظفون للطباعة.'));
      return;
    }
    const safe=function(value){return String(value==null?'':value).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});};
    const d=function(v){return v?String(v).slice(0,10):'—';};
    const money=function(v){const n=Number(v||0);return Number.isFinite(n)?n.toLocaleString('en-SA',{minimumFractionDigits:2,maximumFractionDigits:2}):'0.00';};
    const ar=arabic();
    const title=ar?'قائمة جميع الموظفين':'ALL EMPLOYEES LIST';
    const labels=ar?[
      'م','رقم الموظف','الاسم الكامل','الجوال','الهوية / الإقامة','الجنسية','تاريخ الانضمام','القسم','المسمى الوظيفي','الراتب','البنك / الدفع','الحالة','اسم الدخول','دورة الإجازة','آخر إجازة','الإجازة القادمة','الاستحقاق','المستخدم','المعلق','المتبقي'
    ]:[
      '#','Employee ID','Full Name','Mobile','National ID / Iqama','Nationality','Joining Date','Department','Job Title','Salary','Bank / Payment','Status','Login','Leave Cycle','Last Leave End','Next Leave','Entitlement','Used','Pending','Remaining'
    ];
    const rows=employees.map(function(e,i){
      const login=(users.find(function(u){return String(u.employee_id)===String(e.employee_id);})||{}).username||'—';
      const cycle=Number(e.leave_cycle_years||0);
      return '<tr>'+
        '<td>'+(i+1)+'</td>'+
        '<td>'+safe(e.employee_id||'—')+'</td>'+
        '<td class="name">'+safe(e.full_name||'—')+'</td>'+
        '<td>'+safe(e.mobile||'—')+'</td>'+
        '<td>'+safe(e.national_id||'—')+'</td>'+
        '<td>'+safe(e.nationality||'—')+'</td>'+
        '<td>'+safe(d(e.joining_date))+'</td>'+
        '<td>'+safe(e.department||'—')+'</td>'+
        '<td>'+safe(e.job_title||'—')+'</td>'+
        '<td class="num">'+safe(money(e.salary))+'</td>'+
        '<td class="wrap">'+safe(e.bank_details||'—')+'</td>'+
        '<td>'+safe(e.status||'—')+'</td>'+
        '<td class="wrap">'+safe(login)+'</td>'+
        '<td>'+safe((Number.isFinite(cycle)&&cycle>0?cycle:'—')+(ar&&cycle?' سنة':(!ar&&cycle?' yr':'')))+'</td>'+
        '<td>'+safe(d(e.last_leave_end_date))+'</td>'+
        '<td>'+safe(d(e.next_leave_date))+'</td>'+
        '<td class="num">'+safe(e.leave_entitlement_days??e.planned_leave_days??0)+'</td>'+
        '<td class="num">'+safe(e.leave_approved_days??0)+'</td>'+
        '<td class="num">'+safe(e.leave_pending_days??0)+'</td>'+
        '<td class="num"><b>'+safe(e.leave_balance_days??e.planned_leave_days??0)+'</b></td>'+
      '</tr>';
    }).join('');
    const html='<!doctype html><html lang="'+(ar?'ar':'en')+'" dir="'+(ar?'rtl':'ltr')+'"><head><meta charset="utf-8"><title>'+title+'</title><style>'+
      '@page{size:A4 landscape;margin:8mm}*{box-sizing:border-box}body{font-family:Arial,Tahoma,sans-serif;color:#162033;margin:0;font-size:8px}.toolbar{margin-bottom:8px}.toolbar button{padding:7px 12px;border:0;border-radius:6px;background:#0b3158;color:#fff;font-weight:700;cursor:pointer}.head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #0b3158;padding-bottom:6px;margin-bottom:8px}.company{font-size:16px;font-weight:900;color:#0b3158}.title{font-size:12px;font-weight:800}.meta{font-size:8px;color:#59697b;text-align:end}table{width:100%;border-collapse:collapse;table-layout:auto}thead{display:table-header-group}tr{page-break-inside:avoid}th,td{border:1px solid #cfd7e2;padding:3px 4px;vertical-align:top;white-space:nowrap}th{background:#eef3f8;color:#17324d;font-size:7px;font-weight:800}.name,.wrap{white-space:normal;min-width:65px}.name{font-weight:700;min-width:90px}.num{text-align:right}.foot{margin-top:7px;font-size:8px;color:#66758a;display:flex;justify-content:space-between}@media print{.toolbar{display:none}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}'+
      '</style></head><body><div class="toolbar"><button onclick="window.print()">'+(ar?'طباعة / حفظ PDF':'Print / Save as PDF')+'</button></div>'+
      '<div class="head"><div><div class="company">FILTER CITY</div><div class="title">'+title+'</div></div><div class="meta">'+(ar?'عدد الموظفين: ':'Employees: ')+employees.length+'<br>'+(ar?'التاريخ: ':'Date: ')+safe(printDate())+'</div></div>'+
      '<table><thead><tr>'+labels.map(function(x){return '<th>'+safe(x)+'</th>';}).join('')+'</tr></thead><tbody>'+rows+'</tbody></table>'+
      '<div class="foot"><span>FILTER CITY HRMS</span><span>'+(ar?'تقرير قائمة الموظفين':'Employee Master List')+'</span></div>'+
      '<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},250);});<\/script></body></html>';
    const w=window.open('','_blank');
    if(!w){
      if(typeof toast==='function') toast(text('Please allow pop-ups to print the employee list.','يرجى السماح بالنوافذ المنبثقة لطباعة قائمة الموظفين.'));
      return;
    }
    w.document.open();w.document.write(html);w.document.close();
  };

  if(typeof previousViewEmployees === 'function'){
    window.viewEmployees = function(){
      try{
        if(typeof role !== 'undefined' && role !== 'ADMIN') return previousViewEmployees();
        const employees = (typeof state !== 'undefined' && state && Array.isArray(state.employees)) ? state.employees : [];
        const users = (typeof state !== 'undefined' && state && Array.isArray(state.users)) ? state.users : [];
        const safe = typeof esc === 'function' ? esc : function(value){
          return String(value ?? '').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});
        };
        const rows = employees.map(function(e){
          const id = Number(e.id);
          const safeId = Number.isInteger(id) && id > 0 ? id : 0;
          const login = (users.find(function(u){return u.employee_id === e.employee_id;}) || {}).username || '—';
          const salary = Number(e.salary || 0);
          return '<tr>'+
            '<td>'+safe(e.employee_id)+'</td>'+
            '<td>'+safe(e.full_name)+'</td>'+
            '<td>'+safe(e.department)+'</td>'+
            '<td>'+safe(e.job_title)+'</td>'+
            '<td>'+(Number.isFinite(salary) ? salary.toFixed(2) : '0.00')+'</td>'+
            '<td><span class="badge">'+safe(e.status)+'</span></td>'+
            '<td>'+safe(login)+'</td>'+
            '<td><div class="actions">'+
              '<button '+(safeId ? 'onclick="fcStep10EditEmployee('+safeId+')"' : 'disabled')+'>Edit</button>'+
              '<button class="danger" '+(safeId ? 'onclick="deleteEmployee('+safeId+')"' : 'disabled')+'>Delete</button>'+
            '</div></td>'+
          '</tr>';
        }).join('');
        return '<div class="section"><div class="section-head"><b>Employees</b><div class="actions"><button class="secondary" onclick="fcPrintAllEmployees()">'+text('Print / PDF All Employees','طباعة / PDF جميع الموظفين')+'</button><button onclick="employeeForm()">'+text('+ Add Employee','+ إضافة موظف')+'</button></div></div><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Job</th><th>Salary</th><th>Status</th><th>Login</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
      }catch(err){
        console.error('Step 10 employee list render failed', err);
        return previousViewEmployees();
      }
    };
  }
})();
