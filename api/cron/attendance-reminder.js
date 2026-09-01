const { neon }=require('@neondatabase/serverless');
const sql=neon(process.env.DATABASE_URL);

function riyadhDate(){
  const p={};
  for(const x of new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date())){
    if(x.type!=='literal')p[x.type]=x.value;
  }
  return `${p.year}-${p.month}-${p.day}`;
}

async function sendPush(employeeId,payload){
  if(!process.env.VAPID_PUBLIC_KEY||!process.env.VAPID_PRIVATE_KEY)return {sent:0,registered:0};
  const webpush=require('web-push');
  webpush.setVapidDetails(process.env.VAPID_SUBJECT||'mailto:admin@filtercity.com',process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
  const rows=await sql`SELECT * FROM push_subscriptions WHERE employee_id=${employeeId}`;
  let sent=0;
  for(const s of rows){
    try{
      await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},JSON.stringify(payload));
      sent++;
    }catch(e){
      if(e.statusCode===404||e.statusCode===410)await sql`DELETE FROM push_subscriptions WHERE id=${s.id}`;
      else console.error('Attendance reminder push failed',employeeId,e.message||e);
    }
  }
  return {sent,registered:rows.length};
}

async function onApprovedLeave(employeeId,today){
  try{
    const rows=await sql`SELECT id FROM leaves WHERE employee_id=${employeeId} AND status='Approved' AND start_date<=${today} AND end_date>=${today} LIMIT 1`;
    return rows.length>0;
  }catch(_){return false;}
}

async function isHoliday(today){
  try{
    const rows=await sql`SELECT id FROM holidays WHERE holiday_date=${today} LIMIT 1`;
    return rows.length>0;
  }catch(_){return false;}
}

module.exports=async(req,res)=>{
  try{
    const secret=process.env.CRON_SECRET;
    if(secret&&req.headers.authorization!==`Bearer ${secret}`)return res.status(401).json({error:'Unauthorized'});

    const today=riyadhDate();
    await sql`CREATE TABLE IF NOT EXISTS attendance_reminder_log(
      id SERIAL PRIMARY KEY,
      employee_id TEXT NOT NULL,
      work_date DATE NOT NULL,
      reminder_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(employee_id,work_date,reminder_type)
    )`;

    if(await isHoliday(today))return res.status(200).json({ok:true,date:today,sent:0,reason:'holiday'});

    const employees=await sql`SELECT employee_id,full_name FROM employees WHERE status='Active' ORDER BY id`;
    let sent=0,alreadyCheckedIn=0,onLeave=0,alreadyReminded=0,noRegisteredPhone=0,failed=0;

    for(const e of employees){
      const att=await sql`SELECT id FROM attendance WHERE employee_id=${e.employee_id} AND work_date=${today} AND check_in IS NOT NULL LIMIT 1`;
      if(att.length){alreadyCheckedIn++;continue;}
      if(await onApprovedLeave(e.employee_id,today)){onLeave++;continue;}

      const logged=await sql`SELECT id FROM attendance_reminder_log WHERE employee_id=${e.employee_id} AND work_date=${today} AND reminder_type='CHECK_IN' LIMIT 1`;
      if(logged.length){alreadyReminded++;continue;}

      const result=await sendPush(e.employee_id,{
        title:'Attendance Reminder',
        body:`${e.full_name}, you have not checked in today. Please open FILTER CITY HRMS and check in.`,
        url:'/'
      });

      if(!result.registered){noRegisteredPhone++;continue;}
      if(!result.sent){failed++;continue;}

      await sql`INSERT INTO attendance_reminder_log(employee_id,work_date,reminder_type) VALUES(${e.employee_id},${today},'CHECK_IN') ON CONFLICT DO NOTHING`;
      sent++;
    }

    return res.status(200).json({ok:true,date:today,sent,alreadyCheckedIn,onLeave,alreadyReminded,noRegisteredPhone,failed});
  }catch(e){
    console.error('Attendance reminder job failed',e);
    return res.status(500).json({error:e.message||'Reminder failed'});
  }
};
