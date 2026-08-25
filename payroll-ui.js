
(function(){
  const originalEmployeeForm = window.employeeForm;
  const originalSaveEmployee = window.saveEmployee;
  const payrollMonth = () => {
    const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit'}).formatToParts(new Date());
    const y=parts.find(p=>p.type==='year')?.value, m=parts.find(p=>p.type==='month')?.value;
    return `${y}-${m}`;
  };

  window.employeeForm = function(e={}){
    originalEmployeeForm(e);
    const salaryField = document.getElementById('salary')?.closest('.field');
    if (!salaryField || document.getElementById('payroll_allowances')) return;
    const defaultAllowance = e.payroll_allowances ?? e.allowances ?? 0;
    salaryField.insertAdjacentHTML('afterend',
      `<div class="field"><label>Payroll Allowances</label><input id="payroll_allowances" type="number" step="0.01" min="0" value="${esc(defaultAllowance)}"><div class="muted" style="font-size:11px;margin-top:4px">Used automatically for the current payroll month.</div></div>`
    );
  };

  window.saveEmployee = async function(){
    const allowance = Number(document.getElementById('payroll_allowances')?.value || 0);
    const employeeId = document.getElementById('employee_id')?.value || '';
    const wasNew = !document.getElementById('eid')?.value;
    await originalSaveEmployee();
    if (!employeeId) return;
    try {
      await api('POST','employee-payroll-default',{employee_id:employeeId,allowances:allowance,pay_month:payrollMonth()});
      toast(wasNew ? 'Employee and payroll created' : 'Employee and payroll allowance saved');
      if (current==='Employees') await refresh();
    } catch (e) {
      toast(e.message || 'Payroll allowance could not be saved');
    }
  };

  function payrollMarkup(){
    if(role!=='ADMIN') return `<div class="section"><div class="empty">Admin only.</div></div>`;
    return `<div class="section"><div class="section-head"><b>Payroll</b><button onclick="payrollForm()">+ Add Payroll</button></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Month</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net</th></tr></thead>
      <tbody>${state.payroll.map(p=>`<tr><td>${esc(p.employee_id)}</td><td>${esc(p.pay_month)}</td><td>${Number(p.basic_salary||0).toFixed(2)}</td><td>${Number(p.allowances||0).toFixed(2)}</td><td>${Number(p.deductions||0).toFixed(2)}</td><td>${Number(p.net_salary||0).toFixed(2)}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">No payroll records.</td></tr>'}</tbody></table></div></div>`;
  }

  window.viewPayroll = function(){
    const html = payrollMarkup();
    if(role==='ADMIN'){
      setTimeout(async()=>{
        try{
          const d = await api('POST','payroll/sync',{pay_month:payrollMonth()});
          if(Array.isArray(d.payroll)){
            state.payroll = [...state.payroll.filter(p=>p.pay_month!==payrollMonth()), ...d.payroll];
            if(current==='Payroll') document.getElementById('content').innerHTML = payrollMarkup();
          }
        }catch(e){ console.error('Payroll sync failed',e); }
      },0);
    }
    return html;
  };

  window.payrollForm = function(){
    document.getElementById('content').innerHTML=`<div class="section"><div class="section-head"><b>Add Payroll</b><button class="secondary" onclick="render('Payroll')">Back</button></div>
      <div class="form-grid"><div class="field"><label>Employee</label><select id="pay_emp">${state.employees.filter(e=>e.status==='Active').map(e=>`<option value="${esc(e.employee_id)}">${esc(e.employee_id)} — ${esc(e.full_name)}</option>`).join('')}</select></div>
      <div class="field"><label>Pay month</label><input id="pay_month" type="month" value="${payrollMonth()}"></div>
      <div class="field"><label>Basic salary</label><input id="pay_basic" type="number" step="0.01"></div>
      <div class="field"><label>Allowances</label><input id="pay_allow" type="number" step="0.01" value="0"></div>
      <div class="field"><label>Deductions</label><input id="pay_ded" type="number" step="0.01" value="0"></div>
      <div class="full"><button onclick="savePayroll()">Save to Cloud</button></div></div></div>`;
    const emp = document.getElementById('pay_emp');
    const syncBasic=()=>{const e=state.employees.find(x=>x.employee_id===emp?.value); if(e) document.getElementById('pay_basic').value=Number(e.salary||0);};
    emp?.addEventListener('change',syncBasic); syncBasic();
  };

  window.savePayroll = async function(){
    await api('POST','payroll',{employee_id:pay_emp.value,pay_month:pay_month.value,basic_salary:pay_basic.value,allowances:pay_allow.value,deductions:pay_ded.value});
    toast('Payroll saved'); await refresh();
  };
})();
