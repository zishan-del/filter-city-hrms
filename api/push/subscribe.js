const { neon } = require('@neondatabase/serverless');

function send(res,status,body){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.end(JSON.stringify(body));
}
function decode(auth){
  try{return JSON.parse(Buffer.from(String(auth||'').replace(/^Bearer\s+/i,'').trim(),'base64url').toString('utf8'));}
  catch(_){return null;}
}
async function readBody(req){
  if(req.body && typeof req.body==='object') return req.body;
  return await new Promise((resolve,reject)=>{
    let data='';
    req.on('data',c=>data+=c);
    req.on('end',()=>{if(!data)return resolve({});try{resolve(JSON.parse(data));}catch(e){reject(e);}});
    req.on('error',reject);
  });
}
module.exports=async(req,res)=>{
  try{
    const token=decode(req.headers.authorization);
    if(!token||!token.id||!token.exp||token.exp<Date.now()||String(token.role).toUpperCase()!=='EMPLOYEE') return send(res,401,{error:'Unauthorized'});
    if(req.method!=='POST') return send(res,405,{error:'Method not allowed'});
    if(!process.env.VAPID_PUBLIC_KEY||!process.env.VAPID_PRIVATE_KEY) return send(res,503,{error:'Push notifications are not configured on the server'});
    if(!process.env.DATABASE_URL) return send(res,503,{error:'Notification database is not configured'});

    const body=await readBody(req);
    if(!body.endpoint||!body.keys?.p256dh||!body.keys?.auth) return send(res,400,{error:'Invalid push subscription'});

    const sql=neon(process.env.DATABASE_URL);
    let employeeId=String(token.employee_id||'').trim();
    if(!employeeId){
      const users=await sql`SELECT employee_id FROM users WHERE id=${Number(token.id)} AND role='EMPLOYEE' AND active=true LIMIT 1`;
      employeeId=String(users[0]?.employee_id||'').trim();
    }
    if(!employeeId) return send(res,409,{error:'Employee account is not linked to an employee record'});

    await sql`CREATE TABLE IF NOT EXISTS push_subscriptions (id SERIAL PRIMARY KEY,employee_id TEXT NOT NULL,endpoint TEXT UNIQUE NOT NULL,p256dh TEXT NOT NULL,auth TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await sql`INSERT INTO push_subscriptions(employee_id,endpoint,p256dh,auth,updated_at) VALUES(${employeeId},${String(body.endpoint)},${String(body.keys.p256dh)},${String(body.keys.auth)},NOW()) ON CONFLICT(endpoint) DO UPDATE SET employee_id=EXCLUDED.employee_id,p256dh=EXCLUDED.p256dh,auth=EXCLUDED.auth,updated_at=NOW()`;
    return send(res,200,{ok:true});
  }catch(e){
    console.error('Push subscribe error',e);
    return send(res,500,{error:'Unable to register mobile notifications',code:e?.code||null});
  }
};
