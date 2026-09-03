(function(){
  'use strict';
  if(window.__fcStep10EmployeesValidation) return;
  window.__fcStep10EmployeesValidation = true;

  const previousSaveEmployee = window.saveEmployee;
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
    ['employee_id','full_name','salary','payroll_allowances','planned_leave_days'].forEach(function(id){
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

    if(plannedLeaveDays && plannedLeaveDays.value !== ''){
      const value = Number(plannedLeaveDays.value);
      if(!Number.isInteger(value) || value < 30 || value > 60){
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
})();
