const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

function send(res,status,body){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.end(JSON.stringify(body));
}

function decodeToken(req){
  try{
    const raw=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
    const token=JSON.parse(Buffer.from(raw,'base64url').toString('utf8'));
    if(!token.id||!token.exp||token.exp<Date.now())return null;
    return token;
  }catch(_){return null;}
}

function readJson(req){
  return new Promise((resolve,reject)=>{
    let data='';
    req.on('data',c=>{data+=c;});
    req.on('end',()=>{if(!data)return resolve({});try{resolve(JSON.parse(data));}catch(e){reject(e);}});
    req.on('error',reject);
  });
}

async function ensureSchema(){
  await sql`CREATE TABLE IF NOT EXISTS work_schedules (
    employee_id TEXT PRIMARY KEY,
    work_days TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER NOT NULL DEFAULT 0,
    grace_minutes INTEGER NOT NULL DEFAULT 0,
    updated_by INTEGER,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

async function scheduleRows(){
  return await sql`
    SELECT e.employee_id,e.full_name,e.status,
           s.work_days,s.start_time,s.end_time,s.break_minutes,s.grace_minutes,s.updated_at
    FROM employees e
    LEFT JOIN work_schedules s ON s.employee_id=e.employee_id
    ORDER BY e.id
  `;
}

function validTime(value){return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value||''));}

module.exports=async(req,res)=>{
  try{
    if(req.method==='OPTIONS')return send(res,204,{});
    const user=decodeToken(req);
    if(!user)return send(res,401,{error:'Unauthorized'});
    if(String(user.role||'').toUpperCase()!=='ADMIN')return send(res,403,{error:'Admin access required'});
    await ensureSchema();

    if(req.method==='GET')return send(res,200,{schedules:await scheduleRows()});

    if(req.method==='POST'){
      const body=await readJson(req);
      const employeeId=String(body.employee_id||'').trim();
      const days=Array.isArray(body.work_days)?body.work_days.map(x=>String(x)) : [];
      const allowed=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const uniqueDays=[...new Set(days.filter(d=>allowed.includes(d)))];
      const start=String(body.start_time||'').slice(0,5);
      const end=String(body.end_time||'').slice(0,5);
      const breakMinutes=Math.round(Number(body.break_minutes||0));
      const graceMinutes=Math.round(Number(body.grace_minutes||0));

      if(!employeeId)return send(res,400,{error:'Employee is required'});
      if(!uniqueDays.length)return send(res,400,{error:'Select at least one working day'});
      if(!validTime(start)||!validTime(end))return send(res,400,{error:'Valid shift start and end times are required'});
      if(!Number.isFinite(breakMinutes)||breakMinutes<0||breakMinutes>300)return send(res,400,{error:'Break minutes must be between 0 and 300'});
      if(!Number.isFinite(graceMinutes)||graceMinutes<0||graceMinutes>120)return send(res,400,{error:'Late grace minutes must be between 0 and 120'});
      const employee=await sql`SELECT employee_id FROM employees WHERE employee_id=${employeeId} LIMIT 1`;
      if(!employee.length)return send(res,404,{error:'Employee not found'});

      await sql`INSERT INTO work_schedules(employee_id,work_days,start_time,end_time,break_minutes,grace_minutes,updated_by,updated_at)
        VALUES(${employeeId},${uniqueDays.join(',')},${start},${end},${breakMinutes},${graceMinutes},${Number(user.id)},NOW())
        ON CONFLICT(employee_id) DO UPDATE SET
          work_days=EXCLUDED.work_days,start_time=EXCLUDED.start_time,end_time=EXCLUDED.end_time,
          break_minutes=EXCLUDED.break_minutes,grace_minutes=EXCLUDED.grace_minutes,
          updated_by=${Number(user.id)},updated_at=NOW()`;
      return send(res,200,{ok:true,schedules:await scheduleRows()});
    }

    return send(res,405,{error:'Method not allowed'});
  }catch(error){
    console.error('Work schedule error',error);
    return send(res,500,{error:error.message||'Work schedule error'});
  }
};
