(function(){
  'use strict';
  if(window.__fcDashboardRedesign9C41Fix)return;
  window.__fcDashboardRedesign9C41Fix=true;

  function currentPage(){try{return String(current||'');}catch(_){return '';}}
  function dateOnly(v){return v?String(v).slice(0,10):'';}
  function riyadhDate(){
    const p={};
    new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).forEach(x=>{if(x.type!=='literal')p[x.type]=x.value;});
    return `${p.year}-${p.month}-${p.day}`;
  }
  function arabic(){return document.documentElement.dir==='rtl'||document.documentElement.lang==='ar';}

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
  }

  const content=document.getElementById('content');
  if(content)new MutationObserver(()=>setTimeout(polish,0)).observe(content,{childList:true,subtree:true});
  new MutationObserver(()=>setTimeout(polish,0)).observe(document.documentElement,{attributes:true,attributeFilter:['dir','lang']});
  setTimeout(polish,100);
})();
