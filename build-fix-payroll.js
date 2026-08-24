const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'index.html');
let html = fs.readFileSync(file, 'utf8');

const replacement = "async function saveEmployee(){const id=document.getElementById('eid').value;const body={employee_id:employee_id.value,full_name:full_name.value,mobile:mobile.value,national_id:national_id.value,nationality:nationality.value,joining_date:joining_date.value||null,department:department.value,job_title:job_title.value,salary:salary.value,housing_allowance:housing_allowance.value,transport_allowance:transport_allowance.value,other_allowance:other_allowance.value,bank_details:bank_details.value,status:status.value,leave_cycle_years:leave_cycle_years.value,last_leave_end_date:last_leave_end_date.value||null,next_leave_date:next_leave_date.value||null,planned_leave_days:planned_leave_days.value,username:emp_username.value,password:emp_password.value};await api(id?'PUT':'POST',id?'employees/'+id:'employees',body);await refresh();const month=new Date().toISOString().slice(0,7);const pay=state.payroll.find(p=>p.employee_id===body.employee_id&&String(p.pay_month).slice(0,7)===month);if(pay){const allowances=Number(body.housing_allowance||0)+Number(body.transport_allowance||0)+Number(body.other_allowance||0);await api('PUT','payroll/'+pay.id,{basic_salary:Number(body.salary||0),allowances,deductions:Number(pay.deductions||0)});await refresh()}toast('Employee and current payroll saved to cloud')}";

const re = /async function saveEmployee\(\)\{[\s\S]*?\}\nfunction viewAttendance/;
if (!re.test(html)) throw new Error('saveEmployee function not found');
html = html.replace(re, replacement + '\nfunction viewAttendance');
fs.writeFileSync(file, html);
console.log('FILTER CITY HRMS: payroll sync build patch applied');
