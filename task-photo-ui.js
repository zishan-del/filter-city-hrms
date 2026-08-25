(function(){
  'use strict';
  const escTask = window.esc || (x => String(x ?? '').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m])));
  const taskApi = async (method, path, body) => {
    const r = await fetch('/api/' + path, { method, headers:{'Content-Type':'application/json', Authorization:'Bearer '+localStorage.getItem('fc_hrms_token')}, body: body === undefined ? undefined : JSON.stringify(body) });
    const d = await r.json().catch(()=>({}));
    if(!r.ok) throw Error(d.error || 'Task request failed');
    return d;
  };
  const taskDate = v => v ? String(v).slice(0,10) : '';
  const taskTime = v => v ? String(v).slice(0,5) : '';
  const currentUser = () => JSON.parse(sessionStorage.getItem('fc_user')||'{}');
  const isAdmin = () => String(currentUser().role||role||'').toUpperCase()==='ADMIN';
  const employeeName = id => {
    const e = (state.employees || []).find(x=>x.employee_id===id);
    return e ? `${e.employee_id} — ${e.full_name}` : id;
  };
  function photoThumb(photo, label){
    if(!photo) return '<span class="muted">No photo</span>';
    return `<img src="${escTask(photo)}" alt="${escTask(label||'Task photo')}" style="width:82px;height:62px;object-fit:cover;border-radius:7px;border:1px solid #dce3eb;cursor:pointer" onclick="window.open(this.src,'_blank')">`;
  }
  window.fcTaskForm = function(task){
    if(!isAdmin()) { render('Tasks'); return; }
    task = task || {};
    const options = (state.employees||[]).filter(e=>e.status!=='Inactive').map(e=>`<option value="${escTask(e.employee_id)}" ${e.employee_id===task.employee_id?'selected':''}>${escTask(e.employee_id)} — ${escTask(e.full_name)}</option>`).join('');
    document.getElementById('content').innerHTML = `<div class="section"><div class="section-head"><b>${task.id?'Edit':'Assign'} Task</b><button class="secondary" onclick="render('Tasks')">Back</button></div><div class="form-grid">
      <input type="hidden" id="fc_task_id" value="${task.id||''}">
      <div class="field"><label>Employee</label><select id="fc_task_employee" required>${options}</select></div>
      <div class="field"><label>Title</label><input id="fc_task_title" value="${escTask(task.title||'')}" required></div>
      <div class="field"><label>Priority</label><select id="fc_task_priority"><option ${task.priority==='Low'?'selected':''}>Low</option><option ${!task.priority||task.priority==='Normal'?'selected':''}>Normal</option><option ${task.priority==='High'?'selected':''}>High</option><option ${task.priority==='Urgent'?'selected':''}>Urgent</option></select></div>
      <div class="field"><label>Date</label><input id="fc_task_date" type="date" value="${escTask(taskDate(task.task_date))}"></div>
      <div class="field"><label>Start time</label><input id="fc_task_start" type="time" value="${escTask(taskTime(task.start_time))}"></div>
      <div class="field"><label>Deadline</label><input id="fc_task_deadline" type="time" value="${escTask(taskTime(task.deadline_time))}"></div>
      <div class="field full"><label>Description</label><textarea id="fc_task_description" rows="5">${escTask(task.description||'')}</textarea></div>
      <div class="field full"><label>Task Photo</label><div>${photoThumb(task.photo_data,task.title)}<div style="margin-top:8px"><input id="fc_task_photo" type="file" accept="image/*"><div class="muted" style="font-size:12px;margin-top:5px">Optional. You can upload or replace the photo here. Photos are compressed before cloud storage.</div>${task.photo_data?'<div class="actions" style="margin-top:7px"><button class="danger" onclick="fcDeleteAdminPhoto('+task.id+')">Delete Photo</button></div>':''}</div></div></div>
      <div class="full"><button onclick="fcSaveTask()">${task.id?'Save Changes':'Assign Task'}</button></div>
    </div></div>`;
  };
  window.fcSaveTask = async function(){
    if(!isAdmin()) { toast('Only Admin can assign or edit tasks'); return; }
    try{
      const id=document.getElementById('fc_task_id').value;
      const body={employee_id:document.getElementById('fc_task_employee').value,title:document.getElementById('fc_task_title').value.trim(),priority:document.getElementById('fc_task_priority').value,task_date:document.getElementById('fc_task_date').value||null,start_time:document.getElementById('fc_task_start').value||null,deadline_time:document.getElementById('fc_task_deadline').value||null,description:document.getElementById('fc_task_description').value};
      if(!body.title) return toast('Task title is required');
      const result=await taskApi(id?'PUT':'POST', id?`tasks/${id}`:'tasks', body);
      const taskId=id||result.task?.id;
      const input=document.getElementById('fc_task_photo');
      if(taskId && input && input.files.length){const photo=await compressPhoto(input.files[0]);await taskApi('PUT',`task-photo/${taskId}`,{photo_data:photo});}
      toast(id?'Task updated':'Task assigned');
      await refresh();
    }catch(e){toast(e.message)}
  };
  window.fcDeleteTask = async function(id){
    if(!isAdmin()) return toast('Only Admin can delete tasks');
    if(!confirm('Delete this task? Any stored employee photo will also be deleted.')) return;
    try{await taskApi('DELETE',`tasks/${id}`);toast('Task deleted');await refresh()}catch(e){toast(e.message)}
  };
  async function compressPhoto(file){
    if(!file || !file.type.startsWith('image/')) throw Error('Please select an image file.');
    const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
    const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Could not read image'));i.src=data});
    let maxSide=1280, quality=.78, out='';
    for(let n=0;n<6;n++){
      const scale=Math.min(1,maxSide/Math.max(img.width,img.height));
      const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);out=c.toDataURL('image/jpeg',quality);
      if(out.length<=680000) return out;
      maxSide=Math.round(maxSide*.82);quality=Math.max(.5,quality-.06);
    }
    if(out.length>700000) throw Error('Photo is too large. Please choose a smaller image.');
    return out;
  }
  window.fcDeleteAdminPhoto = async function(id){
    if(!isAdmin()) return toast('Only Admin can delete task photos');
    if(!confirm('Delete this task photo?')) return;
    try{await taskApi('DELETE',`task-photo/${id}`);toast('Photo deleted');await refresh()}catch(e){toast(e.message)}
  };
  window.fcUploadPhoto = async function(id){
    const input=document.getElementById('fc_photo_'+id);
    if(!input || !input.files.length) return toast('Choose a photo first');
    try{const photo=await compressPhoto(input.files[0]);await taskApi('PUT',`task-photo/${id}`,{photo_data:photo});toast('Photo saved');await refresh()}catch(e){toast(e.message)}
  };
  window.fcDeletePhoto = async function(id){
    if(!confirm('Delete the employee photo from this task?')) return;
    try{await taskApi('DELETE',`task-photo/${id}`);toast('Photo deleted');await refresh()}catch(e){toast(e.message)}
  };
  window.fcSaveEmployeeTask = async function(id){
    if(isAdmin()) return toast('Admin should manage the task from the Admin task list');
    const status=document.getElementById('fc_status_'+id).value;
    try{await taskApi('PUT',`tasks/${id}`,{status});toast('Task status saved');await refresh()}catch(e){toast(e.message)}
  };
  window.viewTasks = function(){
    const me=currentUser();
    const admin=isAdmin();
    const rows=admin ? (state.tasks||[]) : (state.tasks||[]).filter(t=>t.employee_id===me.employeeId);
    if(admin) return `<div class="section"><div class="section-head"><b>Tasks</b><button onclick="fcTaskForm()">+ Assign Task</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Task</th><th>Date</th><th>Priority</th><th>Status</th><th>Photo</th><th>Actions</th></tr></thead><tbody>${rows.length?rows.map(t=>`<tr><td>${escTask(employeeName(t.employee_id))}</td><td><b>${escTask(t.title)}</b><div class="muted" style="max-width:260px;white-space:normal">${escTask(t.description||'')}</div></td><td>${escTask(taskDate(t.task_date))||'—'}<br>${escTask(taskTime(t.start_time))}${t.deadline_time?' – '+escTask(taskTime(t.deadline_time)):''}</td><td><span class="badge">${escTask(t.priority||'Normal')}</span></td><td><span class="badge">${escTask(t.status||'Pending')}</span></td><td>${photoThumb(t.photo_data,t.title)}</td><td><div class="actions"><button onclick='fcTaskForm(${JSON.stringify(t)})'>Edit</button><button class="danger" onclick="fcDeleteTask(${t.id})">Delete</button></div></td></tr>`).join(''):`<tr><td colspan="7"><div class="empty">No tasks yet.</div></td></tr>`}</tbody></table></div></div>`;
    return `<div class="section"><div class="section-head"><b>My Tasks</b><span class="badge">Employee</span></div><div class="table-wrap"><table class="table"><thead><tr><th>Task</th><th>Date</th><th>Priority</th><th>Status</th><th>Employee Photo</th><th>Save</th></tr></thead><tbody>${rows.length?rows.map(t=>`<tr><td><b>${escTask(t.title)}</b><div class="muted" style="max-width:330px;white-space:normal">${escTask(t.description||'')}</div></td><td>${escTask(taskDate(t.task_date))||'—'}<br>${escTask(taskTime(t.start_time))}${t.deadline_time?' – '+escTask(taskTime(t.deadline_time)):''}</td><td><span class="badge">${escTask(t.priority||'Normal')}</span></td><td><select id="fc_status_${t.id}"><option ${t.status==='Pending'?'selected':''}>Pending</option><option ${t.status==='In Progress'?'selected':''}>In Progress</option><option ${t.status==='Completed'?'selected':''}>Completed</option></select></td><td>${photoThumb(t.photo_data,t.title)}<div style="margin-top:8px"><input id="fc_photo_${t.id}" type="file" accept="image/*" style="max-width:230px"><div class="actions" style="margin-top:6px"><button onclick="fcUploadPhoto(${t.id})">Upload / Replace</button>${t.photo_data?`<button class="danger" onclick="fcDeletePhoto(${t.id})">Delete Photo</button>`:''}</div></div></td><td><button onclick="fcSaveEmployeeTask(${t.id})">Save Status</button></td></tr>`).join(''):`<tr><td colspan="6"><div class="empty">No tasks assigned to you.</div></td></tr>`}</tbody></table></div></div>`;
  };
  if(typeof render==='function' && current==='Tasks') render('Tasks');
})();