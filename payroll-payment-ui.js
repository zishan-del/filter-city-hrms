(function(){
  'use strict';
  if(window.__fcPayrollPaymentUi) return;
  window.__fcPayrollPaymentUi = true;

  const cache = {};
  let loadingKey = '';
  let monthTimer = null;

  function currentUser(){
    try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}catch(_){return {};}
  }
  function isAdmin(){return String(currentUser().role||'').toUpperCase()==='ADMIN';}
  function isArabic(){return document.documentElement.dir==='rtl'||document.documentElement.lang==='ar';}
  function escP(value){
    return String(value==null?'':value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function riyadhMonth(){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit'}).formatToParts(new Date());
    const y=parts.find(p=>p.type==='year')?.value||'';
    const m=parts.find(p=>p.type==='month')?.value||'';
    return y&&m?`${y}-${m}`:'';
  }
  function monthLabel(value){
    const m=String(value||'').match(/^(\d{4})-(\d{2})$/);
    if(!m)return value||'';
    return new Intl.DateTimeFormat('en',{timeZone:'Asia/Riyadh',month:'long',year:'numeric'}).format(new Date(Date.UTC(Number(m[1]),Number(m[2])-1,1,12)));
  }
  function arabicMonthLabel(value){
    const names=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const m=String(value||'').match(/^(\d{4})-(\d{2})$/);
    if(!m)return value||'';
    const n=Number(m[2]);
    return (names[n-1]||m[2])+' '+m[1];
  }
  function selectedMonth(){
    return document.getElementById('fcStep6MonthPicker')?.value || sessionStorage.getItem('fc_step6_month_payroll') || riyadhMonth();
  }
  function money(value){return 'SAR '+Number(value||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
  function paidDate(value){
    if(!value)return '—';
    try{return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value));}
    catch(_){return String(value);}
  }
  function employeeName(row){
    if(row.full_name)return row.full_name;
    const e=(state.employees||[]).find(x=>x.employee_id===row.employee_id);
    return e?e.full_name:row.employee_id;
  }
  async function request(method,query,body){
    const r=await fetch('/api/payroll-payment'+(query?('?'+query):''),{
      method,
      headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')},
      body:body===undefined?undefined:JSON.stringify(body)
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(d.error||'Payroll payment request failed');
    return d;
  }
  function summary(rows){
    return rows.reduce((a,r)=>{
      a.basic+=Number(r.basic_salary||0);
      a.allowances+=Number(r.allowances||0);
      a.deductions+=Number(r.deductions||0);
      a.net+=Number(r.net_salary||0);
      if(r.paid){a.paidCount++;a.paidAmount+=Number(r.net_salary||0);}else{a.unpaidCount++;a.unpaidAmount+=Number(r.net_salary||0);}
      return a;
    },{basic:0,allowances:0,deductions:0,net:0,paidCount:0,paidAmount:0,unpaidCount:0,unpaidAmount:0});
  }
  function panelHtml(month,rows){
    const s=summary(rows);
    const body=rows.length?rows.map(r=>`<tr>
      <td>${escP(r.employee_id)} — ${escP(employeeName(r))}</td>
      <td>${money(r.basic_salary)}</td>
      <td>${money(r.allowances)}</td>
      <td>${money(r.deductions)}</td>
      <td><b>${money(r.net_salary)}</b></td>
      <td><span class="badge">${r.paid?'PAID':'UNPAID'}</span></td>
      <td>${escP(paidDate(r.paid_at))}</td>
      <td><button class="${r.paid?'secondary':'success'}" onclick="fcSetPayrollPaid(${Number(r.id)},${r.paid?'false':'true'})">${r.paid?'Undo Paid':'Mark Paid'}</button></td>
    </tr>`).join(''):'<tr><td colspan="8" class="empty">No payroll records for '+escP(monthLabel(month))+'.</td></tr>';
    return `<div class="section-head"><b>💳 Payroll Payment Summary — ${escP(monthLabel(month))}</b><div class="actions"><button onclick="fcPrintPayrollSummary()">Print / Save PDF</button><button class="success" onclick="fcMarkAllPayrollPaid()" ${!rows.length||!s.unpaidCount?'disabled':''}>Mark All Paid</button></div></div>
      <div class="cards" style="padding:16px">
        <div class="card">Employees<div class="stat">${rows.length}</div></div>
        <div class="card">Total Net Payroll<div class="stat" style="font-size:21px">${money(s.net)}</div></div>
        <div class="card">Paid<div class="stat">${s.paidCount}</div><div class="muted">${money(s.paidAmount)}</div></div>
        <div class="card">Unpaid<div class="stat">${s.unpaidCount}</div><div class="muted">${money(s.unpaidAmount)}</div></div>
      </div>
      <div style="padding:0 16px 12px" class="muted">Basic ${money(s.basic)} · Allowances ${money(s.allowances)} · Deductions ${money(s.deductions)}. Payment status is saved in the cloud. “Print / Save PDF” opens the browser print dialog; choose Save as PDF when needed.</div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net</th><th>Payment</th><th>Paid Date</th><th>Action</th></tr></thead><tbody>${body}</tbody></table></div>`;
  }
  function renderPanel(month,rows){
    cache[month]=rows;
    const panel=document.getElementById('fcPayrollPaymentPanel');
    if(!panel||panel.dataset.month!==month)return;
    panel.innerHTML=panelHtml(month,rows);
  }
  async function loadPanel(month){
    const panel=document.getElementById('fcPayrollPaymentPanel');
    if(!panel)return;
    const key=month+':'+Date.now();
    loadingKey=key;
    panel.innerHTML='<div class="section-head"><b>💳 Payroll Payment Summary</b></div><div class="empty">Loading payment status…</div>';
    try{
      const d=await request('GET','pay_month='+encodeURIComponent(month));
      if(loadingKey!==key)return;
      renderPanel(month,Array.isArray(d.payroll)?d.payroll:[]);
    }catch(e){
      if(loadingKey!==key)return;
      panel.innerHTML='<div class="section-head"><b>💳 Payroll Payment Summary</b></div><div class="empty">'+escP(e.message||'Unable to load payroll payment status')+'</div>';
    }
  }
  function ensurePanel(){
    if(!isAdmin())return;
    let page='';try{page=String(current||'');}catch(_){return;}
    if(page!=='Payroll')return;
    const content=document.getElementById('content');if(!content)return;
    const month=selectedMonth();
    let panel=document.getElementById('fcPayrollPaymentPanel');
    if(panel&&panel.dataset.month===month)return;
    if(panel)panel.remove();
    panel=document.createElement('div');
    panel.id='fcPayrollPaymentPanel';
    panel.dataset.month=month;
    panel.className='section';
    const toolbar=document.getElementById('fcStep6MonthToolbar');
    if(toolbar)toolbar.insertAdjacentElement('afterend',panel);else content.prepend(panel);
    loadPanel(month);
  }

  window.fcSetPayrollPaid=async function(payrollId,paid){
    const month=selectedMonth();
    const row=(cache[month]||[]).find(x=>Number(x.id)===Number(payrollId));
    const name=row?employeeName(row):'this employee';
    const question=paid?`Mark ${name} as PAID? This saves the payment status in the cloud.`:`Change ${name} back to UNPAID?`;
    if(!confirm(question))return;
    try{
      const d=await request('POST','',{action:'set',payroll_id:Number(payrollId),paid:!!paid,pay_month:month});
      renderPanel(month,Array.isArray(d.payroll)?d.payroll:[]);
      if(typeof toast==='function')toast(paid?'Payroll marked paid':'Payroll changed to unpaid');
    }catch(e){if(typeof toast==='function')toast(e.message||'Payment status update failed');}
  };

  window.fcMarkAllPayrollPaid=async function(){
    const month=selectedMonth(),rows=cache[month]||[];
    const unpaid=rows.filter(r=>!r.paid);
    if(!unpaid.length)return;
    if(!confirm(`Mark all ${unpaid.length} unpaid payroll record(s) for ${monthLabel(month)} as PAID? This saves the payment status in the cloud.`))return;
    try{
      const d=await request('POST','',{action:'mark_all',pay_month:month,paid:true});
      renderPanel(month,Array.isArray(d.payroll)?d.payroll:[]);
      if(typeof toast==='function')toast('All payroll records marked paid');
    }catch(e){if(typeof toast==='function')toast(e.message||'Could not mark all payroll paid');}
  };

  window.fcPrintPayrollSummary=async function(){
    const month=selectedMonth();
    let rows=cache[month];
    try{
      if(!rows){const d=await request('GET','pay_month='+encodeURIComponent(month));rows=Array.isArray(d.payroll)?d.payroll:[];cache[month]=rows;}
    }catch(e){if(typeof toast==='function')toast(e.message||'Could not load payroll for printing');return;}
    const s=summary(rows);
    const company=(state.settings&&state.settings.company)||'FILTER CITY';
    const ar=isArabic();
    const labels=ar?{
      title:'ملخص الرواتب',employees:'الموظفون',totalNet:'إجمالي الصافي',paid:'مدفوع',unpaid:'غير مدفوع',basic:'الأساسي',allowances:'البدلات',deductions:'الاستقطاعات',id:'الرقم',employee:'الموظف',net:'الصافي',status:'الحالة',paidDate:'تاريخ الدفع',noRecords:'لا توجد سجلات رواتب.',paidStatus:'مدفوع',unpaidStatus:'غير مدفوع',footer:'تم إنشاء هذا التقرير من نظام FILTER CITY HRMS. حالة الدفع المعروضة هي الحالة المحفوظة في السحابة وقت الطباعة.'
    }:{
      title:'Payroll Summary',employees:'Employees',totalNet:'Total Net',paid:'Paid',unpaid:'Unpaid',basic:'Basic',allowances:'Allowances',deductions:'Deductions',id:'ID',employee:'Employee',net:'Net',status:'Status',paidDate:'Paid Date',noRecords:'No payroll records.',paidStatus:'PAID',unpaidStatus:'UNPAID',footer:'Generated from FILTER CITY HRMS. Payment status shown is the status saved in the cloud at the time of printing.'
    };
    const printMonth=ar?arabicMonthLabel(month):monthLabel(month);
    const w=window.open('','_blank');
    if(!w){if(typeof toast==='function')toast(ar?'يرجى السماح بالنوافذ المنبثقة لطباعة الرواتب':'Allow pop-ups to print payroll');return;}
    const tableRows=rows.length?rows.map(r=>`<tr><td>${escP(r.employee_id)}</td><td>${escP(employeeName(r))}</td><td>${money(r.basic_salary)}</td><td>${money(r.allowances)}</td><td>${money(r.deductions)}</td><td>${money(r.net_salary)}</td><td>${r.paid?labels.paidStatus:labels.unpaidStatus}</td><td>${escP(paidDate(r.paid_at))}</td></tr>`).join(''):`<tr><td colspan="8">${labels.noRecords}</td></tr>`;
    const align=ar?'right':'left';
    const font=ar?'Tahoma,Arial,sans-serif':'Arial,sans-serif';
    w.document.open();
    w.document.write(`<!doctype html><html lang="${ar?'ar':'en'}" dir="${ar?'rtl':'ltr'}"><head><meta charset="utf-8"><title>${escP(company)} ${escP(labels.title)} ${escP(month)}</title><style>body{font-family:${font};color:#111;padding:24px;direction:${ar?'rtl':'ltr'};text-align:${align}}h1{margin:0 0 4px}h2{margin:0 0 20px;font-size:18px;font-weight:normal}table{width:100%;border-collapse:collapse;margin-top:18px;font-size:12px;direction:${ar?'rtl':'ltr'}}th,td{border:1px solid #bbb;padding:7px;text-align:${align}}th{background:#eee}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}.box{border:1px solid #bbb;padding:10px}.big{font-size:18px;font-weight:bold;margin-top:5px}.foot{margin-top:18px;font-size:12px}@media print{body{padding:0}.no-print{display:none}}</style></head><body><h1>${escP(company)}</h1><h2>${escP(labels.title)} — ${escP(printMonth)}</h2><div class="summary"><div class="box">${labels.employees}<div class="big">${rows.length}</div></div><div class="box">${labels.totalNet}<div class="big">${money(s.net)}</div></div><div class="box">${labels.paid}<div class="big">${s.paidCount} · ${money(s.paidAmount)}</div></div><div class="box">${labels.unpaid}<div class="big">${s.unpaidCount} · ${money(s.unpaidAmount)}</div></div></div><div>${labels.basic}: <b>${money(s.basic)}</b> &nbsp; ${labels.allowances}: <b>${money(s.allowances)}</b> &nbsp; ${labels.deductions}: <b>${money(s.deductions)}</b></div><table><thead><tr><th>${labels.id}</th><th>${labels.employee}</th><th>${labels.basic}</th><th>${labels.allowances}</th><th>${labels.deductions}</th><th>${labels.net}</th><th>${labels.status}</th><th>${labels.paidDate}</th></tr></thead><tbody>${tableRows}</tbody></table><div class="foot">${labels.footer}</div></body></html>`);
    w.document.close();
    setTimeout(()=>{w.focus();w.print();},300);
  };

  function handleMonthInput(e){
    if(!e.target||e.target.id!=='fcStep6MonthPicker')return;
    if(monthTimer)clearTimeout(monthTimer);
    monthTimer=setTimeout(()=>{
      const old=document.getElementById('fcPayrollPaymentPanel');
      if(old)old.remove();
      ensurePanel();
    },20);
  }
  document.addEventListener('input',handleMonthInput);
  document.addEventListener('change',handleMonthInput);

  const content=document.getElementById('content');
  if(content)new MutationObserver(()=>setTimeout(ensurePanel,0)).observe(content,{childList:true,subtree:true});
  setTimeout(ensurePanel,200);
})();
