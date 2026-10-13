const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const KEY = 'fcdiag_7Jx9P4mQ2vL8nR6sT1wK5aB3';
function send(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store, max-age=0');res.end(JSON.stringify(body));}
module.exports=async(req,res)=>{
  try{
    const url=new URL(req.url,'https://local');
    if(url.searchParams.get('key')!==KEY)return send(res,404,{error:'Not found'});
    const today='2026-10-13';
    const employees=await sql`
      SELECT employee_id,full_name,status
      FROM employees
      WHERE lower(full_name) LIKE '%zishan%' OR lower(full_name) LIKE '%ali%'
      ORDER BY full_name
    `;
    const ids=employees.map(e=>e.employee_id);
    const attendance=ids.length?await sql`
      SELECT employee_id,to_char(work_date,'YYYY-MM-DD') AS work_date,
             check_in,
             to_char(check_in AT TIME ZONE 'Asia/Riyadh','YYYY-MM-DD HH24:MI:SS') AS check_in_riyadh,
             late_minutes,status
      FROM attendance
      WHERE employee_id = ANY(${ids}) AND work_date=${today}
      ORDER BY employee_id
    `:[];
    const schedules=ids.length?await sql`
      SELECT employee_id,to_char(effective_from,'YYYY-MM-DD') AS effective_from,
             work_days,to_char(start_time,'HH24:MI') AS start_time,
             to_char(end_time,'HH24:MI') AS end_time,
             grace_minutes,break_minutes
      FROM work_schedule_history
      WHERE employee_id = ANY(${ids}) AND effective_from<=${today}
      ORDER BY employee_id,effective_from DESC
    `:[];
    return send(res,200,{today,employees,attendance,schedules});
  }catch(e){return send(res,500,{error:e.message});}
};