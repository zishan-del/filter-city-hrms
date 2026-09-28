(function(){
  'use strict';
  if(window.__fcDashboardRedesign9C41Fix)return;
  window.__fcDashboardRedesign9C41Fix=true;


  const style=document.createElement('style');
  style.id='fc-dashboard-attendance-names-style';
  style.textContent=`
    .fc-att-name-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
    .fc-att-name-box{border:1px solid #e4eaf1;border-radius:9px;padding:10px;background:#fbfcfe;min-width:0}
    .fc-att-name-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;font-size:11px;font-weight:900;color:#17324d}
    .fc-att-name-count{border-radius:999px;padding:2px 7px;background:#eef3f8;color:#52667b;font-size:10px}
    .fc-att-name-list{display:grid;gap:5px;max-height:132px;overflow:auto}
    .fc-att-name-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;font-size:11px;padding:5px 0;border-bottom:1px solid #edf1f5}
    .fc-att-name-row:last-child{border-bottom:0}
    .fc-att-name-main{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700;color:#17324d}
    .fc-att-name-meta{font-size:9px;color:#718096;white-space:nowrap}
    .fc-att-name-empty{font-size:10px;color:#7b8794;padding:6px 0}
    @media(max-width:620px){.fc-att-name-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
  function currentPage(){try{return String(current||'');}catch(_){return '';}}
  function dateOnly(v){return v?String(v).slice(0,10):'';}
  function riyadhDate(){
    const p={};
    new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).forEach(x=>{if(x.type!=='literal')p[x.type]=x.value;});
    return `${p.year}-${p.month}-${p.day}`;
  }
  function arabic(){return document.documentElement.dir==='rtl'||document.documentElement.lang==='ar';}
  function escName(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function employeeLabel(id){const e=(state.employees||[]).find(x=>String(x.employee_id)===String(id));return e?e.full_name:String(id||'');}
  function attendanceNamesMarkup(employees,attendance,presentIds,lateIds,leaveIds){
    const lateRows=attendance.filter(a=>lateIds.has(a.employee_id)).sort((a,b)=>Number(b.late_minutes||0)-Number(a.late_minutes||0));
    const notCheckedEmployees=employees.filter(e=>!presentIds.has(e.employee_id)&&!leaveIds.has(e.employee_id));
    const lateTitle=arabic()?'المتأخرون اليوم':'Late Today';
    const absentTitle=arabic()?'لم يسجلوا الحضور':'Not Checked In';
    const noneLate=arabic()?'لا يوجد موظفون متأخرون اليوم.':'No late employees today.';
    const noneAbsent=arabic()?'جميع الموظفين سجلوا الحضور أو لديهم إجازة معتمدة.':'Everyone checked in or is on approved leave.';
    const minLabel=arabic()?'د':'m';
    const lateBody=lateRows.length?lateRows.map(a=>`<div class="fc-att-name-row"><div class="fc-att-name-main">${escName(employeeLabel(a.employee_id))}</div><div class="fc-att-name-meta">${Math.max(0,Number(a.late_minutes||0))}${minLabel}</div></div>`).join(''):`<div class="fc-att-name-empty">${noneLate}</div>`;
    const absentBody=notCheckedEmployees.length?notCheckedEmployees.map(e=>`<div class="fc-att-name-row"><div class="fc-att-name-main">${escName(e.full_name||e.employee_id)}</div><div class="fc-att-name-meta">${escName(e.employee_id||'')}</div></div>`).join(''):`<div class="fc-att-name-empty">${noneAbsent}</div>`;
    return `<div class="fc-att-name-grid" id="fcDashAttendanceNames"><div class="fc-att-name-box"><div class="fc-att-name-head"><span>${lateTitle}</span><span class="fc-att-name-count">${lateRows.length}</span></div><div class="fc-att-name-list">${lateBody}</div></div><div class="fc-att-name-box"><div class="fc-att-name-head"><span>${absentTitle}</span><span class="fc-att-name-count">${notCheckedEmployees.length}</span></div><div class="fc-att-name-list">${absentBody}</div></div></div>`;
  }

  function polish(){
    if(currentPage()!=='Dashboard'||typeof state==='undefined'||!state)return;
    const chart=document.querySelector('.fc-attendance-chart');
    const donut=chart&&chart.querySelector('.fc-donut');
    const legend=chart&&chart.querySelectorAll('.fc-chart-legend-row');
    if(!donut||!legend||legend.length<4)return;

    const today=riyadhDate();
    const employees=(state.employees||[]).filter(e=>String(e.status||'').toLowerCase()!=='inactive');
    const attendance=(state.attendance||[]).filter(a=>dateOnly(a.work_date)===today&&String(a.status||'').toLowerCase()!=='absent');
    const presentIds=new Set(attendance.map(a=>a.employee_id));
    const lateIds=new Set(attendance.filter(a=>Number(a.late_minutes||0)>0).map(a=>a.employee_id));
    const leaveIds=new Set((state.leaves||[]).filter(l=>String(l.status||'').toLowerCase()==='approved'&&dateOnly(l.start_date)<=today&&dateOnly(l.end_date)>=today).map(l=>l.employee_id));
    const onTime=Math.max(0,presentIds.size-lateIds.size);
    const late=lateIds.size;
    const onLeave=leaveIds.size;
    const notChecked=Math.max(0,employees.length-presentIds.size-onLeave);
    const total=Math.max(1,employees.length);
    const a1=onTime/total*100;
    const a2=(onTime+late)/total*100;
    const a3=(onTime+late+onLeave)/total*100;
    donut.style.background=`conic-gradient(#062b55 0 ${a1}%,#e31b23 ${a1}% ${a2}%,#14804a ${a2}% ${a3}%,#d9e0e8 ${a3}% 100%)`;

    const labels=arabic()?['في الوقت','متأخر','في إجازة','لم يسجل الحضور']:['On Time','Late','On Leave','Not Checked In'];
    const counts=[onTime,late,onLeave,notChecked];
    const colors=['#062b55','#e31b23','#14804a','#d9e0e8'];
    legend.forEach((row,i)=>{
      const dot=row.querySelector('.fc-dot');
      const text=row.querySelector('span:nth-child(2)');
      const count=row.querySelector('b');
      if(dot)dot.style.setProperty('--dot',colors[i]);
      if(text)text.textContent=labels[i];
      if(count)count.textContent=String(counts[i]);
    });
    const panel=chart.closest('.fc-dash-panel-body');
    if(panel){
      panel.querySelector('#fcDashAttendanceNames')?.remove();
      panel.insertAdjacentHTML('beforeend',attendanceNamesMarkup(employees,attendance,presentIds,lateIds,leaveIds));
    }
  }

  const content=document.getElementById('content');
  if(content)new MutationObserver(()=>setTimeout(polish,0)).observe(content,{childList:true,subtree:true});
  new MutationObserver(()=>setTimeout(polish,0)).observe(document.documentElement,{attributes:true,attributeFilter:['dir','lang']});
  setTimeout(polish,100);
})();
