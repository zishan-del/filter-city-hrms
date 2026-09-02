const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

function send(res,status,body,attendanceMode=false){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(attendanceMode)res.setHeader('X-FC-Attendance-Rules','Step7C');
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

async function ensureWorkScheduleSchema(){
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

function riyadhNowParts(){
  const parts=new Intl.DateTimeFormat('en-GB',{
    timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
  }).formatToParts(new Date());
  const out={};
  for(const p of parts)if(p.type!=='literal')out[p.type]=p.value;
  return out;
}
function riyadhDate(){const p=riyadhNowParts();return `${p.year}-${p.month}-${p.day}`;}
function riyadhDateTime(){const p=riyadhNowParts();return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;}
function parseLocal(s){
  if(!s)return null;
  const m=String(s).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if(!m)return null;
  return new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4]-3,+m[5],+(m[6]||0)));
}
function minutesBetween(a,b){const x=parseLocal(a),y=parseLocal(b);return x&&y?Math.max(0,Math.round((y-x)/60000)):0;}
function nightMinutes(a,b){
  const x=parseLocal(a),y=parseLocal(b);
  if(!x||!y||y<=x)return 0;
  let total=0;
  for(let d=new Date(Date.UTC(x.getUTCFullYear(),x.getUTCMonth(),x.getUTCDate()));d<y;d.setUTCDate(d.getUTCDate()+1)){
    const n1=new Date(d);n1.setUTCHours(19,0,0,0);
    const n2=new Date(d);n2.setUTCDate(n2.getUTCDate()+1);n2.setUTCHours(3,0,0,0);
    const start=Math.max(x,n1),end=Math.min(y,n2);
    if(end>start)total+=Math.round((end-start)/60000);
  }
  return total;
}
function dayName(date){
  return new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Riyadh',weekday:'short'})
    .format(new Date(String(date).slice(0,10)+'T12:00:00Z'));
}
function clockMinutes(value){
  if(!value)return null;
  const s=String(value);
  const m=s.match(/[T\s](\d{2}):(\d{2})/)||s.match(/^(\d{2}):(\d{2})/);
  if(!m)return null;
  return Number(m[1])*60+Number(m[2]);
}
function normalizeClock(clock,start,overnight){
  if(clock==null)return null;
  return overnight&&clock<start?clock+1440:clock;
}

async function ensureAttendanceSchema(){
  await ensureWorkScheduleSchema();
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS checkin_accuracy NUMERIC(10,2)`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS checkout_latitude NUMERIC(10,7)`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS checkout_longitude NUMERIC(10,7)`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS checkout_accuracy NUMERIC(10,2)`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS break_start TEXT`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS break_end TEXT`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS break_duration_minutes INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS working_minutes INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS overtime_minutes INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS night_minutes INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS early_checkout_minutes INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS late_minutes INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS break_over_minutes INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS expected_work_minutes INTEGER NOT NULL DEFAULT 0`;
  await sql`CREATE TABLE IF NOT EXISTS attendance_audit (
    id SERIAL PRIMARY KEY,attendance_id INTEGER NOT NULL,employee_id TEXT NOT NULL,
    action TEXT NOT NULL,actor_id INTEGER,actor_role TEXT,details TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

async function audit(att,user,action,details=''){
  await sql`INSERT INTO attendance_audit(attendance_id,employee_id,action,actor_id,actor_role,details)
    VALUES(${att.id},${att.employee_id},${action},${Number(user?.id||0)||null},${user?.role||''},${details})`;
}

async function scheduleRules(employeeId,date,checkIn,checkOut,breakMinutes){
  const rows=await sql`SELECT employee_id,work_days,start_time,end_time,break_minutes,grace_minutes
    FROM work_schedules WHERE employee_id=${employeeId} LIMIT 1`;
  if(!rows.length)return null;
  const s=rows[0];
  const weekday=dayName(date);
  const workDays=String(s.work_days||'').split(',').filter(Boolean);
  const holiday=(await sql`SELECT id,name FROM holidays WHERE holiday_date=${date} LIMIT 1`)[0]||null;
  const leave=(await sql`SELECT id,leave_type FROM leave_requests
    WHERE employee_id=${employeeId} AND status='Approved' AND start_date<=${date} AND end_date>=${date} LIMIT 1`)[0]||null;
  const scheduledDay=workDays.includes(weekday)&&!holiday&&!leave;

  const start=clockMinutes(s.start_time);
  let end=clockMinutes(s.end_time);
  if(start==null||end==null)return null;
  const overnight=end<=start;
  if(overnight)end+=1440;
  const allowedBreak=Math.max(0,Number(s.break_minutes||0));
  const grace=Math.max(0,Number(s.grace_minutes||0));
  const expected=Math.max(0,(end-start)-allowedBreak);
  const cin=normalizeClock(clockMinutes(checkIn),start,overnight);
  const cout=normalizeClock(clockMinutes(checkOut),start,overnight);
  const usedBreak=Math.max(0,Number(breakMinutes||0));

  return {
    scheduledDay,
    weekday,
    classification:holiday?'HOLIDAY':leave?'APPROVED_LEAVE':workDays.includes(weekday)?'SCHEDULED':'OFF_DAY',
    expected,
    late:scheduledDay&&cin!=null?Math.max(0,cin-(start+grace)):0,
    early:scheduledDay&&cout!=null?Math.max(0,end-cout):0,
    overtime:scheduledDay&&cout!=null?Math.max(0,cout-end):0,
    breakOver:scheduledDay?Math.max(0,usedBreak-allowedBreak):0,
    allowedBreak,
    grace
  };
}

async function legacyRules(working){
  const hours=(await sql`SELECT hours FROM settings WHERE id=1 LIMIT 1`)[0]?.hours||8;
  const scheduled=Math.round(Number(hours)*60);
  return {
    scheduledDay:true,classification:'LEGACY_SETTINGS',expected:scheduled,late:0,
    early:Math.max(0,scheduled-working),overtime:Math.max(0,working-scheduled),breakOver:0,
    allowedBreak:0,grace:0
  };
}

async function handleLiveAttendance(req,res,user){
  const attendanceMode=true;
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'},attendanceMode);
  await ensureAttendanceSchema();

  const body=await readJson(req);
  const employeeId=String(user.role||'').toUpperCase()==='EMPLOYEE'
    ? String(user.employee_id||'').trim()
    : String(body.employee_id||'').trim();
  if(!employeeId)return send(res,400,{error:'Employee ID required'},attendanceMode);

  const date=String(body.work_date||riyadhDate()).slice(0,10);
  let existing=(await sql`SELECT * FROM attendance WHERE employee_id=${employeeId} AND work_date=${date} LIMIT 1`)[0];
  const action=String(body.action||'checkin');

  if(action==='checkin'){
    if(existing)return send(res,200,{attendance:existing,rule_mode:'existing'},attendanceMode);
    const checkIn=riyadhDateTime();
    const rules=await scheduleRules(employeeId,date,checkIn,null,0);
    const late=rules?rules.late:0;
    const expected=rules?rules.expected:0;
    const row=(await sql`INSERT INTO attendance(
      employee_id,work_date,check_in,latitude,longitude,checkin_accuracy,status,late_minutes,expected_work_minutes
    ) VALUES(
      ${employeeId},${date},${checkIn},${body.latitude??null},${body.longitude??null},${body.accuracy??null},'Present',${late},${expected}
    ) RETURNING *`)[0];
    await audit(row,user,'CHECK_IN',`GPS ${body.latitude??''},${body.longitude??''}; Step7C ${rules?rules.classification:'NO_SCHEDULE'}; late ${late}m`);
    return send(res,201,{attendance:row,rule_mode:rules?'schedule':'legacy'},attendanceMode);
  }

  if(!existing)return send(res,400,{error:'Check in first'},attendanceMode);

  if(action==='break_start'){
    if(existing.check_out)return send(res,400,{error:'Already checked out'},attendanceMode);
    if(existing.break_start&&!existing.break_end)return send(res,400,{error:'Break already started'},attendanceMode);
    const row=(await sql`UPDATE attendance SET break_start=${riyadhDateTime()},break_end=NULL,break_duration_minutes=0,break_over_minutes=0
      WHERE id=${existing.id} RETURNING *`)[0];
    await audit(row,user,'BREAK_START');
    return send(res,200,{attendance:row},attendanceMode);
  }

  if(action==='break_end'){
    if(!existing.break_start)return send(res,400,{error:'Start break first'},attendanceMode);
    if(existing.break_end)return send(res,400,{error:'Break already ended'},attendanceMode);
    const end=riyadhDateTime();
    const breakM=minutesBetween(existing.break_start,end);
    const rules=await scheduleRules(employeeId,date,existing.check_in,existing.check_out,breakM);
    const breakOver=rules?rules.breakOver:0;
    const expected=rules?rules.expected:Number(existing.expected_work_minutes||0);
    const row=(await sql`UPDATE attendance SET break_end=${end},break_duration_minutes=${breakM},break_over_minutes=${breakOver},expected_work_minutes=${expected}
      WHERE id=${existing.id} RETURNING *`)[0];
    await audit(row,user,'BREAK_END',`Duration ${breakM} minutes; break over ${breakOver}m`);
    return send(res,200,{attendance:row,rule_mode:rules?'schedule':'legacy'},attendanceMode);
  }

  if(action==='checkout'){
    if(existing.check_out)return send(res,400,{error:'Already checked out'},attendanceMode);
    if(existing.break_start&&!existing.break_end)return send(res,400,{error:'End your break before checking out'},attendanceMode);
    const out=riyadhDateTime();
    const presence=minutesBetween(existing.check_in,out);
    const breakM=Number(existing.break_duration_minutes||0);
    const working=Math.max(0,presence-breakM);
    let rules=await scheduleRules(employeeId,date,existing.check_in,out,breakM);
    const mode=rules?'schedule':'legacy';
    if(!rules)rules=await legacyRules(working);
    const night=nightMinutes(existing.check_in,out);
    const row=(await sql`UPDATE attendance SET
      check_out=${out},checkout_latitude=${body.latitude??null},checkout_longitude=${body.longitude??null},checkout_accuracy=${body.accuracy??null},
      working_minutes=${working},overtime_minutes=${rules.overtime},night_minutes=${night},early_checkout_minutes=${rules.early},
      late_minutes=${rules.late},break_over_minutes=${rules.breakOver},expected_work_minutes=${rules.expected},status='Present'
      WHERE id=${existing.id} RETURNING *`)[0];
    await audit(row,user,'CHECK_OUT',`GPS ${body.latitude??''},${body.longitude??''}; working ${working}m; Step7C ${rules.classification}; late ${rules.late}m; early ${rules.early}m; overtime ${rules.overtime}m; break over ${rules.breakOver}m`);
    return send(res,200,{attendance:row,rule_mode:mode,rules:{classification:rules.classification,expected_work_minutes:rules.expected,break_over_minutes:rules.breakOver}},attendanceMode);
  }

  return send(res,400,{error:'Unknown attendance action'},attendanceMode);
}

async function handleWorkSchedule(req,res,user){
  if(String(user.role||'').toUpperCase()!=='ADMIN')return send(res,403,{error:'Admin access required'});
  await ensureWorkScheduleSchema();

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
}

module.exports=async(req,res)=>{
  const attendanceMode=String(req.url||'').includes('fc_mode=attendance')||/^\/api\/attendance(?:\?|$)/.test(String(req.url||''));
  try{
    if(req.method==='OPTIONS')return send(res,204,{},attendanceMode);
    const user=decodeToken(req);
    if(!user)return send(res,401,{error:'Unauthorized'},attendanceMode);
    return attendanceMode?await handleLiveAttendance(req,res,user):await handleWorkSchedule(req,res,user);
  }catch(error){
    console.error(attendanceMode?'Step 7C attendance error':'Work schedule error',error);
    return send(res,500,{error:error.message||(attendanceMode?'Attendance error':'Work schedule error')},attendanceMode);
  }
};
