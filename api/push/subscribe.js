const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
function send(res,status,body){res.status(status).setHeader('Cache-Control','no-store').json(body);}
function decode(auth){try{return JSON.parse(Buffer.from(String(auth||'').replace(/^Bearer\s+/i,'').trim(),'base64url').toString('utf8'));}catch(_){return null;}}
module.exports=async(req,res)=>{
  try{
    const token=decode(req.headers.authorization);if(!token||!token.id||!token.exp||token.exp<Date.now()||token.role!=='EMPLOYEE')return send(res,401,{error:'Unauthorized'});
    if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
    if(!process.env.VAPID_PUBLIC_KEY||!process.env.VAPID_PRIVATE_KEY)return send(res,503,{error:'Push notifications are not configured on the server'});
    const body=typeof req.body==='object'&&req.body?req.body:{};
    if(!body.endpoint||!body.keys?.p256dh||!body.keys?.auth)return send(res,400,{error:'Invalid push subscription'});
    await sql`CREATE TABLE IF NOT EXISTS push_subscriptions (id SERIAL PRIMARY KEY,employee_id TEXT NOT NULL,endpoint TEXT UNIQUE NOT NULL,p256dh TEXT NOT NULL,auth TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await sql`INSERT INTO push_subscriptions(employee_id,endpoint,p256dh,auth,updated_at) VALUES(${token.employee_id},${body.endpoint},${body.keys.p256dh},${body.keys.auth},NOW()) ON CONFLICT(endpoint) DO UPDATE SET employee_id=EXCLUDED.employee_id,p256dh=EXCLUDED.p256dh,auth=EXCLUDED.auth,updated_at=NOW()`;
    return send(res,200,{ok:true});
  }catch(e){console.error('Push subscribe error',e);return send(res,500,{error:'Unable to register mobile notifications'});}
};
