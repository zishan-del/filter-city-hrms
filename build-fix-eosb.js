const fs = require('fs');

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const replacement = `function eosbFormula(years,salary){const y=Math.max(0,Number(years||0));const s=Math.max(0,Number(salary||0));return s*(y<=5?y*0.5:2.5+(y-5))}
function eosbForm(){const first=state.employees[0]||{};document.getElementById('content').innerHTML=\`<div class="section"><div class="section-head"><b>Calculate EOSB</b><span class="badge">First 5 years: ½ month/year • After 5 years: 1 month/year</span></div><div class="form-grid"><div class="field"><label>Employee</label><select id="eos_emp" onchange="eosbEmployeeChanged()">\${state.employees.map(e=>\`<option value="\${esc(e.employee_id)}" data-salary="\${Number(e.salary||0)}" data-joining="\${esc(String(e.joining_date||'').slice(0,10))}">\${esc(e.employee_id)} — \${esc(e.full_name)}</option>\`).join('')}</select></div><div class="field"><label>Service years</label><input id="eos_years" type="number" min="0" step="0.01" value="\${first.joining_date?((Date.now()-new Date(String(first.joining_date).slice(0,10)).getTime())/31557600000).toFixed(2):'0'}" oninput="updateEOSBPreview()"></div><div class="field"><label>Last salary</label><input id="eos_salary" type="number" min="0" step="0.01" value="\${Number(first.salary||0)}" oninput="updateEOSBPreview()"></div><div class="full"><div class="card">EOSB formula: first 5 years = salary × 0.5 × years; after 5 years = salary × (2.5 + years − 5)</div></div><div class="full"><div class="card">Estimated EOSB: <b id="eos_preview">\${eosbFormula(first.joining_date?((Date.now()-new Date(String(first.joining_date).slice(0,10)).getTime())/31557600000):0,first.salary||0).toFixed(2)}</b></div></div><div class="full"><button onclick="saveEOSB()">Calculate & Save</button></div></div></div>\`;updateEOSBPreview()}
function eosbEmployeeChanged(){const s=document.getElementById('eos_emp').selectedOptions[0];const salary=Number(s?.dataset.salary||0);const joining=s?.dataset.joining||'';document.getElementById('eos_salary').value=salary;document.getElementById('eos_years').value=joining?Math.max(0,(Date.now()-new Date(joining).getTime())/31557600000).toFixed(2):'0';updateEOSBPreview()}
function updateEOSBPreview(){const years=Number(document.getElementById('eos_years')?.value||0),salary=Number(document.getElementById('eos_salary')?.value||0);const el=document.getElementById('eos_preview');if(el)el.textContent=eosbFormula(years,salary).toFixed(2)}
async function saveEOSB(){const years=Number(document.getElementById('eos_years').value||0),salary=Number(document.getElementById('eos_salary').value||0),benefit=eosbFormula(years,salary);await api('POST','eosb',{employee_id:document.getElementById('eos_emp').value,service_years:years,last_salary:salary,benefit});toast('EOSB saved using Saudi gratuity formula');await refresh()}`;

const re = /function eosbForm\(\)\{[\\s\\S]*?async function saveEOSB\(\)\{[\\s\\S]*?\}\nfunction viewReports/;
if (!re.test(html)) throw new Error('EOSB functions not found');
html = html.replace(re, replacement + '\\nfunction viewReports');
fs.writeFileSync(file, html);
console.log('FILTER CITY HRMS: EOSB formula UI patch applied');
