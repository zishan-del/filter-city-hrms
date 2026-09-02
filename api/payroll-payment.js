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

function riyadhMonth(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit'}).formatToParts(new Date());
  const y=parts.find(p=>p.type==='year')?.value||'';
  const m=parts.find(p=>p.type==='month')?.value||'';
  return y&&m?`${y}-${m}`:'';
}

async function ensureSchema(){
  await sql`CREATE TABLE IF NOT EXISTS payroll_payment_status (
    payroll_id INTEGER PRIMARY KEY REFERENCES payroll(id) ON DELETE CASCADE,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMPTZ,
    paid_by INTEGER,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

async function monthRows(month){
  return await sql`
    SELECT p.*, e.full_name,
           COALESCE(s.paid,FALSE) AS paid,
           s.paid_at, s.paid_by
    FROM payroll p
    LEFT JOIN employees e ON e.employee_id=p.employee_id
    LEFT JOIN payroll_payment_status s ON s.payroll_id=p.id
    WHERE p.pay_month=${month}
    ORDER BY p.id
  `;
}

async function setPaid(payrollId,paid,actorId){
  const exists=await sql`SELECT id FROM payroll WHERE id=${payrollId} LIMIT 1`;
  if(!exists.length)return false;
  if(paid){
    await sql`INSERT INTO payroll_payment_status(payroll_id,paid,paid_at,paid_by,updated_at)
      VALUES(${payrollId},TRUE,NOW(),${actorId},NOW())
      ON CONFLICT(payroll_id) DO UPDATE SET paid=TRUE,paid_at=NOW(),paid_by=${actorId},updated_at=NOW()`;
  }else{
    await sql`INSERT INTO payroll_payment_status(payroll_id,paid,paid_at,paid_by,updated_at)
      VALUES(${payrollId},FALSE,NULL,${actorId},NOW())
      ON CONFLICT(payroll_id) DO UPDATE SET paid=FALSE,paid_at=NULL,paid_by=${actorId},updated_at=NOW()`;
  }
  return true;
}

module.exports=async(req,res)=>{
  try{
    if(req.method==='OPTIONS')return send(res,204,{});
    const user=decodeToken(req);
    if(!user)return send(res,401,{error:'Unauthorized'});
    if(String(user.role||'').toUpperCase()!=='ADMIN')return send(res,403,{error:'Admin access required'});
    await ensureSchema();

    const url=new URL(req.url||'/api/payroll-payment','http://localhost');
    if(req.method==='GET'){
      const month=String(url.searchParams.get('pay_month')||riyadhMonth()).slice(0,7);
      return send(res,200,{pay_month:month,payroll:await monthRows(month)});
    }

    if(req.method==='POST'){
      const body=await readJson(req);
      const action=String(body.action||'set');
      if(action==='set'){
        const payrollId=Number(body.payroll_id||0);
        if(!payrollId)return send(res,400,{error:'Payroll ID required'});
        const ok=await setPaid(payrollId,body.paid===true,Number(user.id));
        if(!ok)return send(res,404,{error:'Payroll record not found'});
        const month=String(body.pay_month||riyadhMonth()).slice(0,7);
        return send(res,200,{ok:true,pay_month:month,payroll:await monthRows(month)});
      }
      if(action==='mark_all'){
        const month=String(body.pay_month||riyadhMonth()).slice(0,7);
        const paid=body.paid!==false;
        const rows=await sql`SELECT id FROM payroll WHERE pay_month=${month} ORDER BY id`;
        for(const row of rows)await setPaid(Number(row.id),paid,Number(user.id));
        return send(res,200,{ok:true,pay_month:month,updated:rows.length,payroll:await monthRows(month)});
      }
      return send(res,400,{error:'Unknown payment action'});
    }

    return send(res,405,{error:'Method not allowed'});
  }catch(error){
    console.error('Payroll payment error',error);
    return send(res,500,{error:error.message||'Payroll payment error'});
  }
};
