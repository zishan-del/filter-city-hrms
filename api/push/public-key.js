const { neon } = require('@neondatabase/serverless');
const sql=neon(process.env.DATABASE_URL);
function decode(token){try{return JSON.parse(Buffer.from(String(token||'').replace(/^Bearer\s+/i,'').trim(),'base64url').toString('utf8'));}catch(_){return null;}}
module.exports=async(req,res)=>{try{const token=decode(req.headers.authorization);if(!token||!token.id||!token.exp||token.exp<Date.now()||token.role!=='EMPLOYEE')return res.status(401).json({error:'Unauthorized'});if(!process.env.VAPID_PUBLIC_KEY)return res.status(503).json({error:'Push notifications are not configured'});res.setHeader('Cache-Control','no-store');return res.status(200).json({publicKey:process.env.VAPID_PUBLIC_KEY});}catch(e){console.error(e);return res.status(500).json({error:'Notification service unavailable'});}};
