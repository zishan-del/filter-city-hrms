(function(){
  'use strict';
  if(window.__fcCurrentMonthViewStep6) return;
  window.__fcCurrentMonthViewStep6 = true;

  function currentUser(){
    try{return JSON.parse(sessionStorage.getItem('fc_user')||'{}');}
    catch(_){return {};}
  }
  function userRole(){return String(currentUser().role||'').toUpperCase();}
  function isEmployee(){return userRole()==='EMPLOYEE';}
  function isAdmin(){return userRole()==='ADMIN';}

  function riyadhMonth(){
    const parts=new Intl.DateTimeFormat('en-CA',{
      timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit'
    }).formatToParts(new Date());
    const y=parts.find(p=>p.type==='year')?.value||'';
    const m=parts.find(p=>p.type==='month')?.value||'';
    return y&&m?`${y}-${m}`:'';
  }
  function monthLabel(value){
    const match=String(value||'').match(/^(\d{4})-(\d{2})$/);
    if(!match)return value||'';
    return new Intl.DateTimeFormat('en',{timeZone:'Asia/Riyadh',month:'long',year:'numeric'})
      .format(new Date(Date.UTC(Number(match[1]),Number(match[2])-1,1,12)));
  }
  function monthBounds(value){
    const match=String(value||'').match(/^(\d{4})-(\d{2})$/);
    if(!match)return null;
    const year=Number(match[1]),month=Number(match[2]);
    const last=new Date(Date.UTC(year,month,0)).getUTCDate();
    return {start:`${match[1]}-${match[2]}-01`,end:`${match[1]}-${match[2]}-${String(last).padStart(2,'0')}`};
  }
  function monthKey(value){
    const match=String(value||'').match(/^(\d{4}-\d{2})/);
    return match?match[1]:'';
  }
  function escM(value){
    return String(value==null?'':value).replace(/[&<>"']/g,m=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  function enabledFor(page){
    if(page==='Attendance') return isEmployee()||isAdmin();
    if(page==='Tasks'||page==='Leave') return isEmployee();
    if(page==='Payroll') return isAdmin();
    return false;
  }
  function storageKey(page){return 'fc_step6_month_'+String(page||'').toLowerCase();}
  function selectedMonth(page){
    const now=riyadhMonth();
    const key=storageKey(page),anchor=key+'_riyadh_anchor';
    if(sessionStorage.getItem(anchor)!==now){
      sessionStorage.setItem(anchor,now);
      sessionStorage.setItem(key,now);
    }
    return sessionStorage.getItem(key)||now;
  }

  function scopedRecords(page){
    const u=currentUser(),id=u.employeeId;
    if(typeof state==='undefined'||!state)return [];
    if(page==='Attendance'){
      const rows=Array.isArray(state.attendance)?state.attendance:[];
      return isEmployee()?rows.filter(x=>x.employee_id===id):rows;
    }
    if(page==='Tasks'){
      const rows=Array.isArray(state.tasks)?state.tasks:[];
      return rows.filter(x=>x.employee_id===id);
    }
    if(page==='Leave'){
      const rows=Array.isArray(state.leaves)?state.leaves:[];
      return rows.filter(x=>x.employee_id===id);
    }
    if(page==='Payroll') return Array.isArray(state.payroll)?state.payroll:[];
    return [];
  }

  function recordVisible(page,record,month){
    if(!record)return false;
    if(page==='Attendance') return monthKey(record.work_date)===month;
    if(page==='Tasks') return monthKey(record.task_date||record.created_at)===month;
    if(page==='Payroll') return String(record.pay_month||'').slice(0,7)===month;
    if(page==='Leave'){
      const bounds=monthBounds(month);
      if(!bounds)return true;
      const start=String(record.start_date||'').slice(0,10);
      const end=String(record.end_date||record.start_date||'').slice(0,10);
      return !!start && start<=bounds.end && end>=bounds.start;
    }
    return true;
  }

  function tableFor(page){
    const tables=[...document.querySelectorAll('#content table.table')];
    return tables.find(table=>{
      const headers=[...table.querySelectorAll('thead th')].map(th=>(th.textContent||'').trim().toLowerCase());
      if(page==='Attendance')return headers.includes('date')&&headers.includes('check in');
      if(page==='Tasks')return headers.includes('task')&&headers.includes('date');
      if(page==='Leave')return headers.includes('start')&&headers.includes('end');
      if(page==='Payroll')return headers.includes('month')&&headers.includes('basic');
      return false;
    })||null;
  }

  function toolbarNote(page,month){
    const attendanceNote=page==='Attendance'?' Today’s check-in/break/check-out controls stay live; the history table below follows the selected month.':'';
    return 'Showing '+monthLabel(month)+'. Old records are kept; choose another month to view history.'+attendanceNote;
  }

  function addToolbar(page,month){
    const content=document.getElementById('content');
    if(!content)return;
    let box=document.getElementById('fcStep6MonthToolbar');
    if(box && box.dataset.page!==page){box.remove();box=null;}
    if(box)return;
    box=document.createElement('div');
    box.id='fcStep6MonthToolbar';
    box.dataset.page=page;
    box.className='section';
    box.innerHTML='<div class="section-head"><b>📅 Current Month View — Step 6</b><span class="badge">Saudi/Riyadh</span></div>'+ 
      '<div style="padding:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">'+
        '<label for="fcStep6MonthPicker" style="font-weight:700">Month</label>'+ 
        '<input id="fcStep6MonthPicker" type="month" value="'+escM(month)+'" style="padding:9px;border:1px solid #c9d2dd;border-radius:8px;background:#fff">'+
        '<span id="fcStep6MonthText" class="muted">'+escM(toolbarNote(page,month))+'</span>'+ 
      '</div>';
    content.prepend(box);
    const picker=document.getElementById('fcStep6MonthPicker');
    if(picker){
      const useMonth=function(){
        if(!this.value)return;
        sessionStorage.setItem(storageKey(page),this.value);
        applyPage(page);
      };
      picker.addEventListener('input',useMonth);
      picker.addEventListener('change',useMonth);
    }
  }

  function filterTable(page,month){
    const table=tableFor(page);
    if(!table)return;
    const body=table.querySelector('tbody');
    if(!body)return;
    let monthEmpty=body.querySelector('tr[data-fc-step6-empty="1"]');
    const allRows=[...body.querySelectorAll(':scope > tr')].filter(row=>row!==monthEmpty);
    const dataRows=allRows.filter(row=>row.querySelectorAll('td').length>1);
    const genericEmpty=allRows.filter(row=>row.querySelectorAll('td').length===1);
    genericEmpty.forEach(row=>row.style.display='none');
    const records=scopedRecords(page);
    let visible=0;
    dataRows.forEach((row,index)=>{
      const show=recordVisible(page,records[index],month);
      row.style.display=show?'':'none';
      if(show)visible++;
    });
    if(visible){
      if(monthEmpty)monthEmpty.remove();
      return;
    }
    if(!monthEmpty){
      monthEmpty=document.createElement('tr');
      monthEmpty.dataset.fcStep6Empty='1';
      const td=document.createElement('td');
      td.className='empty';
      monthEmpty.appendChild(td);
      body.appendChild(monthEmpty);
    }
    const td=monthEmpty.querySelector('td');
    if(td){
      td.colSpan=Math.max(1,table.querySelectorAll('thead th').length);
      td.textContent='No '+page.toLowerCase()+' records for '+monthLabel(month)+'.';
    }
  }

  function applyPage(page){
    if(!enabledFor(page))return;
    const month=selectedMonth(page);
    addToolbar(page,month);
    const picker=document.getElementById('fcStep6MonthPicker');
    if(picker && picker.value!==month)picker.value=month;
    const note=document.getElementById('fcStep6MonthText');
    if(note)note.textContent=toolbarNote(page,month);
    filterTable(page,month);
  }

  function activePage(){
    try{return String(current||'');}catch(_){return '';}
  }

  let applying=false;
  function applyActive(){
    if(applying)return;
    const page=activePage();
    if(!enabledFor(page))return;
    applying=true;
    try{applyPage(page);}finally{applying=false;}
  }
  function scheduleActive(){
    setTimeout(applyActive,0);
    setTimeout(applyActive,80);
    setTimeout(applyActive,350);
  }

  const previousRender=window.render;
  if(typeof previousRender==='function'){
    window.render=function(page){
      const result=previousRender(page);
      if(enabledFor(page))scheduleActive();
      return result;
    };
  }

  const content=document.getElementById('content');
  if(content){
    new MutationObserver(function(){
      if(enabledFor(activePage()))setTimeout(applyActive,0);
    }).observe(content,{childList:true,subtree:true});
  }
})();
