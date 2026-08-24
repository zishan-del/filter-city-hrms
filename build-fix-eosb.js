const fs = require('fs');

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const replacement = `function eosbFormula(years,salary){const y=Math.max(0,Number(years||0));const s=Math.max(0,Number(salary||0));return s*(y<=5?y*0.5:2.5+(y-5))}
function viewEOSB(){const first=state.employees[0]||{};const years=first.joining_date?Math.max(0,(Date.now()-new Date(String(first.joining_date).slice(0,10)).getTime())/31557600000):0;return \`<div class="section"><div class="section-head"><b>End of Service Benefit (EOSB)</b><span class="badge">Saudi gratuity: ½ month/year for first 5 years, 1 month/year thereafter</span></div><div class="form-grid"><div class="field"><label>Employee</label><select id="eos_emp" onchange="eosbEmployeeChanged()">\${state.employees.map(e=>\`<option value="\${esc(e.employee_id)}" data-salary="\${Number(e.salary||0)}" data-joining="\${esc(String(e.joining_date||'').slice(0,10))}">\${esc(e.employee_id)} — \${esc(e.full_name)}</option>\`).join('')}</select></div><div class="field"><label>Service years</label><input id="eos_years" type="number" min="0" step="0.01" value="\${years.toFixed(2)}" oninput="updateEOSBPreview()"></div><div class="field"><label>Last basic salary</label><input id="eos_salary" type="number" min="0" step="0.01" value="\${Number(first.salary||0)}" oninput="updateEOSBPreview()"></div><div class="full"><div class="card"><b>Formula</b><br>First 5 years: 0.5 × monthly basic salary × years<br>After 5 years: 2.5 × monthly basic salary + monthly basic salary × (years − 5)<br>Partial years are calculated proportionally.</div></div><div class="full"><div class="card">Estimated EOSB: <b id="eos_preview">\${eosbFormula(years,first.salary||0).toFixed(2)}</b></div></div><div class="full"><button onclick="saveEOSB()">Calculate & Save</button></div></div></div>\`}
function eosbEmployeeChanged(){const s=document.getElementById('eos_emp')?.selectedOptions[0];if(!s)return;const salary=Number(s.dataset.salary||0);const joining=s.dataset.joining||'';document.getElementById('eos_salary').value=salary;document.getElementById('eos_years').value=joining?Math.max(0,(Date.now()-new Date(joining).getTime())/31557600000).toFixed(2):'0';updateEOSBPreview()}
function updateEOSBPreview(){const years=Number(document.getElementById('eos_years')?.value||0),salary=Number(document.getElementById('eos_salary')?.value||0),el=document.getElementById('eos_preview');if(el)el.textContent=eosbFormula(years,salary).toFixed(2)}
async function saveEOSB(){const employee_id=document.getElementById('eos_emp').value,service_years=Number(document.getElementById('eos_years').value||0),last_salary=Number(document.getElementById('eos_salary').value||0),benefit=eosbFormula(service_years,last_salary);await api('POST','eosb',{employee_id,service_years,last_salary,benefit});toast('EOSB saved using Saudi gratuity formula');await refresh()}`;

const start = html.indexOf('function viewEOSB(){');
const end = html.indexOf('function viewReports', start);
if (start < 0 || end < 0) throw new Error('EOSB view function boundaries not found');
html = html.slice(0, start) + replacement + '\n' + html.slice(end);
fs.writeFileSync(file, html);
console.log('FILTER CITY HRMS: EOSB calculator patched');
