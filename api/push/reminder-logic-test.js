const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

function send(res,status,body){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.end(JSON.stringify(body));
}

function decode(auth){
  try{
    return JSON.parse(Buffer.from(String(auth||'').replace(/^Bearer\s+/i,'').trim(),'base64url').toString('utf8'));
  }catch(_){return null;}
}

async function readBody(req){
  if(req.body&&typeof req.body==='object')return req.body;
  return await new Promise((resolve,reject)=>{
    let data='';
    req.on('data',c=>data+=c);
    req.on('end',()=>{
      if(!data)return resolve({});
      try{resolve(JSON.parse(data));}catch(e){reject(e);}
    });
    req.on('error',reject);
  });
}

function riyadhDate(){
  const parts={};
  for(const x of new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date())){
    if(x.type!=='literal')parts[x.type]=x.value;
  }
  return `${parts.year}-${parts.month}-${parts.day}`;
}

async function reminderLogged(employeeId,today){
  try{
    const rows=await sql`SELECT id FROM attendance_reminder_log WHERE employee_id=${employeeId} AND work_date=${today} AND reminder_type='CHECK_IN' LIMIT 1`;
    return rows.length>0;
  }catch(e){
    if(String(e.message||'').toLowerCase().includes('attendance_reminder_log'))return false;
    throw e;
  }
}

function evaluate(flags){
  if(flags.holiday)return {decision:'SKIP',reason_code:'HOLIDAY',message:'SKIPPED — today is a holiday.'};
  if(flags.checked_in)return {decision:'SKIP',reason_code:'ALREADY_CHECKED_IN',message:'SKIPPED — employee already checked in today.'};
  if(flags.approved_leave)return {decision:'SKIP',reason_code:'APPROVED_LEAVE',message:'SKIPPED — employee is on approved leave today.'};
  if(flags.already_reminded)return {decision:'SKIP',reason_code:'ALREADY_REMINDED',message:'SKIPPED — attendance reminder was already sent today.'};
  if(!flags.registered_phones)return {decision:'NO_PHONE',reason_code:'NO_REGISTERED_PHONE',message:'NO PHONE — employee has no registered notification phone.'};
  return {decision:'ELIGIBLE',reason_code:'ELIGIBLE_TO_SEND',message:'ELIGIBLE — automatic reminder would be sent.'};
}

module.exports=async(req,res)=>{
  try{
    if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
    const token=decode(req.headers.authorization);
    if(!token||!token.id||!token.exp||token.exp<Date.now()||String(token.role).toUpperCase()!=='ADMIN'){
      return send(res,401,{error:'Admin access required'});
    }

    const body=await readBody(req);
    const employeeId=String(body.employee_id||'').trim();
    const scenario=String(body.scenario||'live').trim().toLowerCase();
    const allowed=new Set(['live','not_checked_in','approved_leave','holiday','already_reminded']);
    if(!employeeId)return send(res,400,{error:'Employee is required'});
    if(!allowed.has(scenario))return send(res,400,{error:'Invalid test scenario'});

    const emp=await sql`SELECT employee_id,full_name FROM employees WHERE employee_id=${employeeId} AND status='Active' LIMIT 1`;
    if(!emp.length)return send(res,404,{error:'Active employee not found'});

    const today=riyadhDate();
    const [holidayRows,attendanceRows,leaveRows,subscriptionRows,logged]=await Promise.all([
      sql`SELECT id FROM holidays WHERE holiday_date=${today} LIMIT 1`,
      sql`SELECT id FROM attendance WHERE employee_id=${employeeId} AND work_date=${today} AND check_in IS NOT NULL LIMIT 1`,
      sql`SELECT id FROM leaves WHERE employee_id=${employeeId} AND status='Approved' AND start_date<=${today} AND end_date>=${today} LIMIT 1`,
      sql`SELECT id FROM push_subscriptions WHERE employee_id=${employeeId}`,
      reminderLogged(employeeId,today)
    ]);

    const actual={
      holiday:holidayRows.length>0,
      checked_in:attendanceRows.length>0,
      approved_leave:leaveRows.length>0,
      already_reminded:logged,
      registered_phones:subscriptionRows.length
    };

    const evaluated={...actual};
    if(scenario==='not_checked_in'){
      evaluated.holiday=false;
      evaluated.checked_in=false;
      evaluated.approved_leave=false;
      evaluated.already_reminded=false;
    }else if(scenario==='approved_leave'){
      evaluated.holiday=false;
      evaluated.checked_in=false;
      evaluated.approved_leave=true;
      evaluated.already_reminded=false;
    }else if(scenario==='holiday'){
      evaluated.holiday=true;
      evaluated.checked_in=false;
      evaluated.approved_leave=false;
      evaluated.already_reminded=false;
    }else if(scenario==='already_reminded'){
      evaluated.holiday=false;
      evaluated.checked_in=false;
      evaluated.approved_leave=false;
      evaluated.already_reminded=true;
    }

    const result=evaluate(evaluated);
    return send(res,200,{
      ok:true,
      dry_run:true,
      writes_performed:false,
      date:today,
      scenario,
      employee_id:employeeId,
      employee_name:emp[0].full_name,
      actual,
      evaluated,
      ...result
    });
  }catch(e){
    console.error('Reminder logic test error',e);
    return send(res,500,{error:e.message||'Reminder logic test failed'});
  }
};
