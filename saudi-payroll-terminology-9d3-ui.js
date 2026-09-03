(function(){
  'use strict';
  if(window.__fcSaudiPayrollTerminology9D3)return;
  window.__fcSaudiPayrollTerminology9D3=true;

  const copy={
    en:{
      title:'Saudi HR presentation — Payroll / Wage Payment Record',
      badge:'Step 9D.3 · Payroll only',
      body:'Amounts are shown in Saudi riyals (SAR). This screen is an internal payroll and wage-payment record. PAID / UNPAID is the status saved in FILTER CITY HRMS and, by itself, is not proof of bank transfer or an official wage-protection submission. Final wage settlement should be reconciled with the approved payroll inputs, employment contract and actual payment evidence.',
      register:'Payroll / Wage Payment Register',
      total:'Total Net Pay (SAR)',
      paid:'Paid in HRMS',
      unpaid:'Unpaid in HRMS',
      basic:'Basic Wage',
      net:'Net Pay',
      payment:'HRMS Payment Status',
      paidDate:'HRMS Paid Date',
      statusNote:'HRMS payment status is an internal control record. Reconcile it with the actual payment evidence before final payroll sign-off.'
    },
    ar:{
      title:'عرض الموارد البشرية السعودية — سجل الرواتب / دفع الأجور',
      badge:'الخطوة 9D.3 · الرواتب فقط',
      body:'تُعرض المبالغ بالريال السعودي (SAR). هذه الشاشة سجل داخلي للرواتب ودفع الأجور. حالة «مدفوع / غير مدفوع» هي الحالة المحفوظة في نظام FILTER CITY HRMS ولا تُعد بمفردها دليلاً على التحويل البنكي أو على تقديم رسمي لنظام حماية الأجور. يجب مطابقة التسوية النهائية مع مدخلات الرواتب المعتمدة وعقد العمل وإثبات الدفع الفعلي.',
      register:'سجل الرواتب / دفع الأجور',
      total:'إجمالي صافي الأجر (SAR)',
      paid:'مدفوع في النظام',
      unpaid:'غير مدفوع في النظام',
      basic:'الأجر الأساسي',
      net:'صافي الأجر',
      payment:'حالة الدفع في النظام',
      paidDate:'تاريخ الدفع في النظام',
      statusNote:'حالة الدفع في النظام سجل رقابي داخلي. يجب مطابقتها مع إثبات الدفع الفعلي قبل الاعتماد النهائي للرواتب.'
    }
  };

  const style=document.createElement('style');
  style.textContent=`
    #fc-saudi-payroll-note-9d3{margin:0 0 18px;border:1px solid #dce3eb;border-inline-start:4px solid #0b3158;border-radius:12px;background:#fff;overflow:hidden}
    #fc-saudi-payroll-note-9d3 .fc-9d3-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #edf0f4;font-weight:800;color:#0b3158}
    #fc-saudi-payroll-note-9d3 .fc-9d3-badge{font-size:11px;font-weight:700;border-radius:999px;padding:4px 9px;background:#eef4fa;color:#0b3158;white-space:nowrap}
    #fc-saudi-payroll-note-9d3 .fc-9d3-body{padding:12px 16px;line-height:1.6;color:#516175;font-size:13px}
    #fc-9d3-payroll-status-note{margin:0 16px 14px;padding:10px 12px;border:1px solid #dce3eb;border-radius:9px;background:#f7f9fb;color:#516175;font-size:12px;line-height:1.5}
    @media(max-width:600px){#fc-saudi-payroll-note-9d3 .fc-9d3-head{align-items:flex-start;flex-direction:column}#fc-saudi-payroll-note-9d3 .fc-9d3-badge{white-space:normal}}
  `;
  document.head.appendChild(style);

  function isArabic(){return document.body.classList.contains('fc-lang-ar')||document.documentElement.lang==='ar'||document.documentElement.dir==='rtl';}
  function activePage(){const b=document.querySelector('#nav button.active');return b&&b.id?b.id.replace(/^nav-/,''):'';}
  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function selectedMonth(){return document.getElementById('fcStep6MonthPicker')?.value||sessionStorage.getItem('fc_step6_month_payroll')||'';}
  function monthLabel(value,ar){
    const m=String(value||'').match(/^(\d{4})-(\d{2})$/);if(!m)return value||'';
    if(ar){const names=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];return `${names[Number(m[2])-1]||m[2]} ${m[1]}`;}
    return new Intl.DateTimeFormat('en',{timeZone:'Asia/Riyadh',month:'long',year:'numeric'}).format(new Date(Date.UTC(Number(m[1]),Number(m[2])-1,1,12)));
  }
  function setLeadingText(el,text){
    if(!el)return;
    const node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&String(n.nodeValue||'').trim());
    if(node)node.nodeValue=text;
  }

  function patchPaymentPanel(root,c,ar){
    const panel=root.querySelector('#fcPayrollPaymentPanel');
    if(!panel)return;
    const head=panel.querySelector('.section-head b');
    if(head)head.textContent=`💳 ${c.register} — ${monthLabel(selectedMonth()||panel.dataset.month,ar)}`;

    const cards=panel.querySelectorAll('.cards .card');
    cards.forEach(card=>{
      const text=(card.childNodes[0]?.nodeValue||'').trim();
      if(/Total Net Payroll|Total Net Pay|إجمالي صافي الرواتب|إجمالي صافي الأجر/.test(text))setLeadingText(card,c.total);
      else if(/^(Paid|مدفوع)(?: in HRMS| في النظام)?$/.test(text))setLeadingText(card,c.paid);
      else if(/^(Unpaid|غير مدفوع)(?: in HRMS| في النظام)?$/.test(text))setLeadingText(card,c.unpaid);
    });

    panel.querySelectorAll('thead th').forEach(th=>{
      const t=th.textContent.trim();
      if(/^(Basic|Basic Wage|الأساسي|الأجر الأساسي)$/.test(t))th.textContent=c.basic;
      else if(/^(Net|Net Pay|الصافي|صافي الأجر)$/.test(t))th.textContent=c.net;
      else if(/^(Payment|HRMS Payment Status|الدفع|حالة الدفع في النظام)$/.test(t))th.textContent=c.payment;
      else if(/^(Paid Date|HRMS Paid Date|تاريخ الدفع|تاريخ الدفع في النظام)$/.test(t))th.textContent=c.paidDate;
    });

    let note=panel.querySelector('#fc-9d3-payroll-status-note');
    if(!note){
      note=document.createElement('div');note.id='fc-9d3-payroll-status-note';
      const table=panel.querySelector('.table-wrap');
      if(table)table.insertAdjacentElement('beforebegin',note);else panel.appendChild(note);
    }
    note.textContent=c.statusNote;
  }

  function patchBasePayroll(root,c){
    root.querySelectorAll('.section table.table').forEach(table=>{
      const headers=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());
      if(!headers.some(x=>/^(Month|الشهر)$/.test(x))||!headers.some(x=>/^(Allowances|البدلات)$/.test(x)))return;
      table.querySelectorAll('thead th').forEach(th=>{
        const t=th.textContent.trim();
        if(/^(Basic|Basic Wage|الأساسي|الأجر الأساسي)$/.test(t))th.textContent=c.basic;
        else if(/^(Net|Net Pay|الصافي|صافي الأجر)$/.test(t))th.textContent=c.net;
      });
    });
  }

  function polishPrint(html,ar){
    let out=String(html||'');
    const c=copy[ar?'ar':'en'];
    if(ar){
      out=out.replace(/<h2>ملخص الرواتب\s*—/,'<h2>'+c.register+' —');
      out=out.replace(/<h2>Payroll Summary\s*—/,'<h2>'+c.register+' —');
    }else{
      out=out.replace(/<h2>Payroll Summary\s*—/,'<h2>'+c.register+' —');
      out=out.replace(/<h2>ملخص الرواتب\s*—/,'<h2>'+c.register+' —');
    }
    const extra=`<div style="margin-top:12px;padding-top:9px;border-top:1px solid #bbb;font-size:10px;line-height:1.5">${esc(c.statusNote)}</div>`;
    if(!out.includes(c.statusNote))out=out.replace('</body>',extra+'</body>');
    return out;
  }

  function installPrint(){
    if(typeof window.fcPrintPayrollSummary!=='function'||window.fcPrintPayrollSummary.__fc9d3Wrapped)return;
    const original=window.fcPrintPayrollSummary;
    const wrapped=async function(){
      const realOpen=window.open,ar=isArabic();
      window.open=function(){
        const real=realOpen.apply(window,arguments);if(!real)return real;
        return {document:{open:()=>real.document.open(),write:html=>real.document.write(polishPrint(html,ar)),close:()=>real.document.close()},focus:()=>real.focus(),print:()=>real.print()};
      };
      try{return await original.apply(this,arguments);}finally{window.open=realOpen;}
    };
    wrapped.__fc9d3Wrapped=true;
    window.fcPrintPayrollSummary=wrapped;
  }

  let scheduled=false;
  function apply(){
    scheduled=false;
    if(activePage()!=='payroll'){
      document.getElementById('fc-saudi-payroll-note-9d3')?.remove();
      installPrint();
      return;
    }
    const root=document.getElementById('content');if(!root)return;
    const ar=isArabic(),c=copy[ar?'ar':'en'];
    let note=document.getElementById('fc-saudi-payroll-note-9d3');
    if(!note){
      note=document.createElement('div');note.id='fc-saudi-payroll-note-9d3';
      const existing=document.getElementById('fc-saudi-hr-note-9d1');
      if(existing&&existing.parentElement===root)existing.insertAdjacentElement('afterend',note);else root.insertBefore(note,root.firstChild);
    }
    note.innerHTML=`<div class="fc-9d3-head"><span>${esc(c.title)}</span><span class="fc-9d3-badge">${esc(c.badge)}</span></div><div class="fc-9d3-body">${esc(c.body)}</div>`;
    patchPaymentPanel(root,c,ar);
    patchBasePayroll(root,c);
    installPrint();
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','lang','dir']});
  document.addEventListener('click',schedule,true);
  document.addEventListener('input',schedule,true);
  document.addEventListener('change',schedule,true);
  window.addEventListener('load',schedule);
  schedule();
})();
