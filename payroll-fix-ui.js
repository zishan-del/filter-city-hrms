(() => {
  if (window.__fcPayrollFixInstalled) return;
  window.__fcPayrollFixInstalled = true;

  function addAllowanceFields() {
    if (typeof role === 'undefined' || role !== 'ADMIN') return;
    if (document.getElementById('housing_allowance')) return;
    const salary = document.getElementById('salary');
    if (!salary) return;
    const salaryField = salary.closest('.field');
    const grid = salaryField && salaryField.parentElement;
    if (!salaryField || !grid) return;

    const makeField = (id, label, value) => {
      const wrap = document.createElement('div');
      wrap.className = 'field';
      wrap.innerHTML = `<label>${label}</label><input id="${id}" type="number" step="0.01" value="${Number(value || 0)}">`;
      return wrap;
    };

    salaryField.insertAdjacentElement('afterend', makeField('housing_allowance', 'Housing allowance', 0));
    document.getElementById('housing_allowance').closest('.field').insertAdjacentElement('afterend', makeField('transport_allowance', 'Transport allowance', 0));
    document.getElementById('transport_allowance').closest('.field').insertAdjacentElement('afterend', makeField('other_allowance', 'Other fixed allowance', 0));

    const currentId = document.getElementById('eid')?.value;
    if (currentId && typeof state !== 'undefined') {
      const employee = (state.employees || []).find(e => String(e.id) === String(currentId));
      if (employee) {
        document.getElementById('housing_allowance').value = Number(employee.housing_allowance || 0);
        document.getElementById('transport_allowance').value = Number(employee.transport_allowance || 0);
        document.getElementById('other_allowance').value = Number(employee.other_allowance || 0);
      }
    }
  }

  const originalEmployeeForm = window.employeeForm;
  if (typeof originalEmployeeForm === 'function') {
    window.employeeForm = function(employee = {}) {
      originalEmployeeForm(employee);
      setTimeout(addAllowanceFields, 0);
    };
  }

  const originalSaveEmployee = window.saveEmployee;
  if (typeof originalSaveEmployee === 'function') {
    window.saveEmployee = async function() {
      const employeeId = document.getElementById('employee_id')?.value || '';
      const housing = Number(document.getElementById('housing_allowance')?.value || 0);
      const transport = Number(document.getElementById('transport_allowance')?.value || 0);
      const other = Number(document.getElementById('other_allowance')?.value || 0);

      await originalSaveEmployee();
      await api('PUT', 'employee-allowances', {
        employee_id: employeeId,
        housing_allowance: housing,
        transport_allowance: transport,
        other_allowance: other
      });
      toast('Employee allowances saved to cloud');
      await refresh();
    };
  }
})();
