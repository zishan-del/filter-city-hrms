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

module.exports=async(req,res)=>{
  try{
    if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
    const token=decode(req.headers.authorization);
    if(!token||!token.id||!token.exp||token.exp<Date.now()||String(token.role).toUpperCase()!=='ADMIN'){
      return send(res,401,{error:'Admin access required'});
    }

    const body=await readBody(req);
    const employeeId=String(body.employee_id||'').trim();
    if(!employeeId)return send(res,400,{error:'Employee is required'});

    const emp=await sql`SELECT employee_id,full_name FROM employees WHERE employee_id=${employeeId} LIMIT 1`;
    if(!emp.length)return send(res,404,{error:'Employee not found'});

    const rows=await sql`SELECT id,updated_at,created_at FROM push_subscriptions WHERE employee_id=${employeeId} ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC`;
    const before=rows.length;
    if(before<=1){
      return send(res,200,{ok:true,employee_id:employeeId,employee_name:emp[0].full_name,before,removed:0,remaining:before});
    }

    const keepId=rows[0].id;
    const removed=await sql`DELETE FROM push_subscriptions WHERE employee_id=${employeeId} AND id<>${keepId} RETURNING id`;
    return send(res,200,{
      ok:true,
      employee_id:employeeId,
      employee_name:emp[0].full_name,
      before,
      removed:removed.length,
      remaining:1,
      kept_subscription_id:keepId
    });
  }catch(e){
    console.error('Push subscription cleanup error',e);
    return send(res,500,{error:e.message||'Push subscription cleanup failed'});
  }
};
