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
        return '<div class="section"><div class="section-head"><b>Employees</b><button onclick="employeeForm()">+ Add Employee</button></div><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Job</th><th>Salary</th><th>Status</th><th>Login</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
      }catch(err){
        console.error('Step 10 employee list render failed', err);
        return previousViewEmployees();
      }
    };
  }
})();
