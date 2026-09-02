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
function dateOnly(v){return v?String(v).slice(0,10):'';}
function normalizeLocalDateTime(v){
  if(v==null||v==='')return null;
  const m=String(v).trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if(!m)return undefined;
  return `${m[1]} ${m[2]}:${m[3]}:${m[4]||'00'}`;
}
function parseLocal(s){
  if(!s)return null;
  const m=String(s).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if(!m)return null;
  return new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4]-3,+m[5],+(m[6]||0)));
}
function minutesBetween(a,b){
  const x=parseLocal(a),y=parseLocal(b);
  return x&&y?Math.max(0,Math.round((y-x)/60000)):0;
}
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
  const m=String(value).match(/[T\s](\d{2}):(\d{2})/)||String(value).match(/^(\d{2}):(\d{2})/);
  return m?Number(m[1])*60+Number(m[2]):null;
}
function normalizeClock(clock,start,overnight){return clock==null?null:(overnight&&clock<start?clock+1440:clock);}
function nullableNumber(v,min,max){
  if(v==null||v==='')return null;
  const n=Number(v);
  if(!Number.isFinite(n)||n<min||n>max)return undefined;
  return n;
}
function displayValue(v){return v==null||v===''?'—':String(v);}
function changeSummary(oldRow,newRow,changedKeys){
  const labels={
    check_in:'Check In',check_out:'Check Out',break_start:'Break Start',break_end:'Break End',
    latitude:'Check-in Latitude',longitude:'Check-in Longitude',checkin_accuracy:'Check-in Accuracy',
    checkout_latitude:'Checkout Latitude',checkout_longitude:'Checkout Longitude',checkout_accuracy:'Checkout Accuracy'
  };
  return changedKeys.map(k=>`${labels[k]||k}: ${displayValue(oldRow[k])} -> ${displayValue(newRow[k])}`).join('; ');
}
async function ensureSchema(){
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
async function effectiveSchedule(employeeId,date){
  try{
    const rows=await sql`
      SELECT employee_id,effective_from,work_days,start_time,end_time,break_minutes,grace_minutes
      FROM work_schedule_history
      WHERE employee_id=${employeeId} AND effective_from<=${date}
      ORDER BY effective_from DESC
      LIMIT 1
    `;
    return rows[0]||null;
  }catch(error){
    if(String(error?.code||'')==='42P01')return null;
    throw error;
  }
}
async function scheduleRules(employeeId,date,checkIn,checkOut,breakMinutes,working){
  const s=await effectiveSchedule(employeeId,date);
  if(!s){
    const hours=(await sql`SELECT hours FROM settings WHERE id=1 LIMIT 1`)[0]?.hours||8;
    const expected=Math.round(Number(hours)*60);
    return {classification:'LEGACY_SETTINGS',effectiveFrom:null,expected,late:0,early:checkOut?Math.max(0,expected-working):0,overtime:checkOut?Math.max(0,working-expected):0,breakOver:0};
  }
  const weekday=dayName(date);
  const workDays=String(s.work_days||'').split(',').filter(Boolean);
  const holiday=(await sql`SELECT id FROM holidays WHERE holiday_date=${date} LIMIT 1`)[0]||null;
  const leave=(await sql`SELECT id FROM leave_requests WHERE employee_id=${employeeId} AND status='Approved' AND start_date<=${date} AND end_date>=${date} LIMIT 1`)[0]||null;
  const classification=holiday?'HOLIDAY':leave?'APPROVED_LEAVE':workDays.includes(weekday)?'SCHEDULED':'OFF_DAY';
  const scheduled=classification==='SCHEDULED';
  const start=clockMinutes(s.start_time);
  let end=clockMinutes(s.end_time);
  if(start==null||end==null)return {classification,effectiveFrom:dateOnly(s.effective_from),expected:0,late:0,early:0,overtime:0,breakOver:0};
  const overnight=end<=start;
  if(overnight)end+=1440;
  const allowedBreak=Math.max(0,Number(s.break_minutes||0));
  const grace=Math.max(0,Number(s.grace_minutes||0));
  const expected=Math.max(0,end-start-allowedBreak);
  const cin=normalizeClock(clockMinutes(checkIn),start,overnight);
  const cout=normalizeClock(clockMinutes(checkOut),start,overnight);
  return {
    classification,
    effectiveFrom:dateOnly(s.effective_from),
    expected,
    late:scheduled&&cin!=null?Math.max(0,cin-(start+grace)):0,
    early:scheduled&&cout!=null?Math.max(0,end-cout):0,
    overtime:scheduled&&cout!=null?Math.max(0,cout-end):0,
    breakOver:scheduled?Math.max(0,Number(breakMinutes||0)-allowedBreak):0
  };
}

module.exports=async function attendanceCorrectionApi(req,res){
  try{
    if(req.method==='OPTIONS')return send(res,204,{});
    const user=decodeToken(req);
    if(!user)return send(res,401,{error:'Unauthorized'});
    if(String(user.role||'').toUpperCase()!=='ADMIN')return send(res,403,{error:'Admin access required'});
    if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
    await ensureSchema();
    const body=await readJson(req);
    if(String(body.action||'')!=='save_attendance_correction')return send(res,400,{error:'Unknown correction action'});
    const attendanceId=Number(body.attendance_id||0);
    const reason=String(body.reason||'').trim();
    const changes=body.changes&&typeof body.changes==='object'&&!Array.isArray(body.changes)?body.changes:{};
    if(!attendanceId)return send(res,400,{error:'Attendance record is required'});
    if(reason.length<5)return send(res,400,{error:'A clear correction reason is required'});
    const existing=(await sql`SELECT * FROM attendance WHERE id=${attendanceId} LIMIT 1`)[0];
    if(!existing)return send(res,404,{error:'Attendance record not found'});

    const allowed=new Set(['check_in','check_out','break_start','break_end','latitude','longitude','checkin_accuracy','checkout_latitude','checkout_longitude','checkout_accuracy']);
    const supplied=Object.keys(changes).filter(k=>allowed.has(k));
    if(!supplied.length)return send(res,400,{error:'No attendance changes were supplied'});
    const merged={...existing};
    const datetimeFields=['check_in','check_out','break_start','break_end'];
    for(const key of datetimeFields){
      if(!supplied.includes(key))continue;
      const value=normalizeLocalDateTime(changes[key]);
      if(value===undefined)return send(res,400,{error:`Invalid ${key.replaceAll('_',' ')} date/time`});
      merged[key]=value;
    }
    const numberRules={latitude:[-90,90],longitude:[-180,180],checkin_accuracy:[0,100000],checkout_latitude:[-90,90],checkout_longitude:[-180,180],checkout_accuracy:[0,100000]};
    for(const [key,[min,max]] of Object.entries(numberRules)){
      if(!supplied.includes(key))continue;
      const value=nullableNumber(changes[key],min,max);
      if(value===undefined)return send(res,400,{error:`Invalid ${key.replaceAll('_',' ')}`});
      merged[key]=value;
    }
    if(!merged.check_in)return send(res,400,{error:'Check In cannot be blank for an attendance record'});
    const workDate=dateOnly(existing.work_date);
    if(dateOnly(merged.check_in)!==workDate)return send(res,400,{error:'Check In must stay on the attendance work date'});
    if(Boolean(merged.break_start)!==Boolean(merged.break_end))return send(res,400,{error:'Break Start and Break End must both be entered or both be blank'});
    if(merged.check_out&&minutesBetween(merged.check_in,merged.check_out)<=0)return send(res,400,{error:'Check Out must be after Check In'});
    if(merged.break_start&&merged.break_end){
      if(minutesBetween(merged.break_start,merged.break_end)<=0)return send(res,400,{error:'Break End must be after Break Start'});
      if(minutesBetween(merged.check_in,merged.break_start)<=0)return send(res,400,{error:'Break Start must be after Check In'});
      if(merged.check_out&&minutesBetween(merged.break_end,merged.check_out)<=0)return send(res,400,{error:'Break End must be before Check Out'});
    }

    const breakM=merged.break_start&&merged.break_end?minutesBetween(merged.break_start,merged.break_end):0;
    const presence=merged.check_out?minutesBetween(merged.check_in,merged.check_out):0;
    const working=merged.check_out?Math.max(0,presence-breakM):0;
    const rules=await scheduleRules(existing.employee_id,workDate,merged.check_in,merged.check_out,breakM,working);
    const night=merged.check_out?nightMinutes(merged.check_in,merged.check_out):0;
    const normalizedChanged=supplied.filter(k=>String(existing[k]??'')!==String(merged[k]??''));
    if(!normalizedChanged.length)return send(res,400,{error:'No actual change detected. Preview a different value first.'});
    const details=`Reason: ${reason}; ${changeSummary(existing,merged,normalizedChanged)}; Recalculated: working ${working}m, late ${rules.late}m, early ${rules.early}m, overtime ${rules.overtime}m, break ${breakM}m, break over ${rules.breakOver}m, expected ${rules.expected}m, night ${night}m; Schedule ${rules.classification}, effective ${rules.effectiveFrom||'legacy'}`;

    const rows=await sql`
      WITH updated AS (
        UPDATE attendance SET
          check_in=${merged.check_in},check_out=${merged.check_out},
          break_start=${merged.break_start},break_end=${merged.break_end},
          latitude=${merged.latitude??null},longitude=${merged.longitude??null},checkin_accuracy=${merged.checkin_accuracy??null},
          checkout_latitude=${merged.checkout_latitude??null},checkout_longitude=${merged.checkout_longitude??null},checkout_accuracy=${merged.checkout_accuracy??null},
          break_duration_minutes=${breakM},working_minutes=${working},late_minutes=${rules.late},early_checkout_minutes=${rules.early},
          overtime_minutes=${rules.overtime},night_minutes=${night},break_over_minutes=${rules.breakOver},expected_work_minutes=${rules.expected},status='Present'
        WHERE id=${attendanceId}
        RETURNING *
      ), logged AS (
        INSERT INTO attendance_audit(attendance_id,employee_id,action,actor_id,actor_role,details)
        SELECT id,employee_id,'ADMIN_CORRECTION',${Number(user.id)||null},${String(user.role||'ADMIN')},${details}
        FROM updated
        RETURNING id
      )
      SELECT updated.*, (SELECT id FROM logged LIMIT 1) AS correction_audit_id FROM updated
    `;
    if(!rows.length)return send(res,404,{error:'Attendance record was not updated'});
    return send(res,200,{ok:true,attendance:rows[0],changed_fields:normalizedChanged,schedule_effective_from:rules.effectiveFrom||null,classification:rules.classification,audit_id:rows[0].correction_audit_id,step:'8B'});
  }catch(error){
    console.error('Step 8B attendance correction error',error);
    return send(res,500,{error:error.message||'Attendance correction failed'});
  }
};
