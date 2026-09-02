(function(){
  'use strict';
  if(window.__fcAttendanceCorrectionStep8B)return;
  window.__fcAttendanceCorrectionStep8B=true;

  let lastPreview=null;
  function escB(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function value(id){return document.getElementById(id)?.value??'';}
  function rowById(id){return (state.attendance||[]).find(a=>String(a.id)===String(id))||null;}
  function asInputDateTime(v){
    if(!v)return '';
    const m=String(v).replace(' ','T').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
    return m?`${m[1]}T${m[2]}:${m[3]}`:'';
  }
  function numberChanged(oldValue,newValue){
    if(newValue==='')return oldValue!=null&&oldValue!=='';
    if(oldValue==null||oldValue==='')return true;
    return Number(oldValue)!==Number(newValue);
  }
  function buildChanges(row){
    const changes={};
    const timeFields=[
      ['check_in','fc8_checkin'],['check_out','fc8_checkout'],['break_start','fc8_break_start'],['break_end','fc8_break_end']
    ];
    timeFields.forEach(([key,id])=>{
      const proposed=value(id),current=asInputDateTime(row[key]);
      if(proposed!==current)changes[key]=proposed||null;
    });
    const numberFields=[
      ['latitude','fc8_lat'],['longitude','fc8_lng'],['checkin_accuracy','fc8_acc'],
      ['checkout_latitude','fc8_out_lat'],['checkout_longitude','fc8_out_lng'],['checkout_accuracy','fc8_out_acc']
    ];
    numberFields.forEach(([key,id])=>{
      const proposed=value(id);
      if(numberChanged(row[key],proposed))changes[key]=proposed===''?null:Number(proposed);
    });
    return changes;
  }
  function fingerprint(attendanceId,reason,changes){
    const ordered={};Object.keys(changes).sort().forEach(k=>ordered[k]=changes[k]);
    return JSON.stringify({attendance_id:String(attendanceId),reason:String(reason),changes:ordered});
  }
  function fieldLabel(k){return ({check_in:'Check In',check_out:'Check Out',break_start:'Break Start',break_end:'Break End',latitude:'Check-in Latitude',longitude:'Check-in Longitude',checkin_accuracy:'Check-in Accuracy',checkout_latitude:'Checkout Latitude',checkout_longitude:'Checkout Longitude',checkout_accuracy:'Checkout Accuracy'})[k]||k;}

  function promoteLabels(){
    const box=document.getElementById('fcAttendanceCorrection8A');
    if(!box)return;
    const head=box.querySelector('.section-head');
    if(head){
      const title=head.querySelector('b');if(title)title.textContent='🛠 Attendance Correction + Audit Trail — Step 8B';
      const badge=head.querySelector('.badge');if(badge)badge.textContent='Preview first · Admin save';
    }
    const intro=box.querySelector(':scope > div:nth-child(2) > .muted');
    if(intro)intro.innerHTML='Select an attendance record, enter corrected values and a reason, then <b>Preview</b>. The real Save button appears only after a valid preview. Saving recalculates attendance and creates a permanent <b>ADMIN_CORRECTION</b> audit entry.';
  }

  function appendSavePanel(attendanceId,reason,changes){
    const box=document.getElementById('fc8_preview');
    if(!box)return;
    const keys=Object.keys(changes);
    box.querySelector('#fc8b_save_panel')?.remove();
    if(!keys.length){
      box.insertAdjacentHTML('beforeend','<div id="fc8b_save_panel" style="margin:0 16px 16px;padding:12px;border:1px solid #dce3eb;border-radius:8px;background:#f7f9fb"><b>No real change to save.</b><div class="muted" style="margin-top:5px">Change at least one field and preview again.</div></div>');
      lastPreview=null;
      return;
    }
    lastPreview={attendanceId:String(attendanceId),reason,changes,fingerprint:fingerprint(attendanceId,reason,changes)};
    const list=keys.map(k=>escB(fieldLabel(k))).join(', ');
    box.insertAdjacentHTML('beforeend',`<div id="fc8b_save_panel" style="margin:0 16px 16px;padding:14px;border:1px solid #f0c36d;border-radius:8px;background:#fff8e6">
      <div style="font-weight:700">⚠ Step 8B — Real Attendance Correction</div>
      <div style="margin-top:6px">Fields to save: <b>${list}</b></div>
      <div class="muted" style="margin-top:6px">This will update the attendance record, recalculate Working/Late/Early/Overtime/Break/Night using the effective schedule, and add a permanent ADMIN_CORRECTION audit event with the reason and old → new values.</div>
      <button class="success" style="margin-top:12px" onclick="fc8SaveCorrection()">Save Correction to Cloud</button>
    </div>`);
  }

  const previousPreview=window.fc8PreviewCorrection;
  if(typeof previousPreview==='function'){
    window.fc8PreviewCorrection=async function(){
      lastPreview=null;
      await previousPreview();
      promoteLabels();
      const preview=document.getElementById('fc8_preview');
      if(!preview||!preview.textContent.includes('Correction Preview'))return;
      const attendanceId=value('fc8_record'),row=rowById(attendanceId),reason=value('fc8_reason').trim();
      if(!row||reason.length<5)return;
      appendSavePanel(attendanceId,reason,buildChanges(row));
    };
  }

  async function freshAudit(attendanceId){
    try{
      const r=await fetch('/api/work-schedule',{headers:{Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')}});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)return;
      const rows=(Array.isArray(d.attendance_audit)?d.attendance_audit:[]).filter(a=>String(a.attendance_id)===String(attendanceId));
      const holder=document.getElementById('fc8_audit');
      if(!holder)return;
      if(!rows.length){holder.innerHTML='<div class="empty">No audit events found for this attendance record.</div>';return;}
      holder.innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Employee</th><th>Action</th><th>Actor</th><th>Details</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${escB(String(a.created_at||'').replace('T',' ').slice(0,19))}</td><td>${escB(a.employee_id||'')}</td><td><span class="badge">${escB(a.action||'')}</span></td><td>${escB(a.actor_username||a.actor_role||'System')}</td><td style="white-space:normal;min-width:280px">${escB(a.details||'')}</td></tr>`).join('')}</tbody></table></div>`;
    }catch(e){console.error('Step 8B audit refresh failed',e);}
  }

  window.fc8SaveCorrection=async function(){
    const attendanceId=value('fc8_record'),row=rowById(attendanceId),reason=value('fc8_reason').trim();
    if(!row)return toast('Choose an attendance record');
    if(!lastPreview)return toast('Preview the correction first');
    const changes=buildChanges(row),currentFingerprint=fingerprint(attendanceId,reason,changes);
    if(currentFingerprint!==lastPreview.fingerprint)return toast('The correction changed after preview. Preview it again before saving.');
    if(!Object.keys(changes).length)return toast('No real change to save');
    if(!confirm('Save this attendance correction to the cloud? A permanent ADMIN_CORRECTION audit event will be created.'))return;
    const btn=document.querySelector('#fc8b_save_panel button');
    try{
      if(btn){btn.disabled=true;btn.textContent='Saving correction...';}
      const r=await fetch('/?fc_mode=attendance-correction',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')},body:JSON.stringify({action:'save_attendance_correction',attendance_id:Number(attendanceId),reason,changes})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw Error(d.error||'Attendance correction failed');
      lastPreview=null;
      if(d.attendance){
        const index=(state.attendance||[]).findIndex(a=>String(a.id)===String(attendanceId));
        if(index>=0)state.attendance[index]=d.attendance;
      }
      if(typeof toast==='function')toast('Attendance correction saved with audit trail');
      if(typeof refresh==='function')await refresh();else render('Attendance');
      setTimeout(async()=>{
        promoteLabels();
        const select=document.getElementById('fc8_record');
        if(select&&[...select.options].some(o=>String(o.value)===String(attendanceId))){select.value=String(attendanceId);if(typeof window.fc8LoadRecord==='function')window.fc8LoadRecord();}
        await freshAudit(attendanceId);
      },500);
    }catch(e){
      if(typeof toast==='function')toast(e.message||'Attendance correction failed');
      if(btn){btn.disabled=false;btn.textContent='Save Correction to Cloud';}
    }
  };

  const previousRender=window.render;
  if(typeof previousRender==='function'){
    window.render=function(page){const result=previousRender(page);if(page==='Attendance'){setTimeout(promoteLabels,0);setTimeout(promoteLabels,300);}return result;};
  }
  const content=document.getElementById('content');
  if(content)new MutationObserver(()=>setTimeout(promoteLabels,0)).observe(content,{childList:true,subtree:true});
  setTimeout(promoteLabels,200);
})();
