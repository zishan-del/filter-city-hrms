const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const sql = neon(process.env.DATABASE_URL);

const ADMIN_LOGIN='admin@filtercity.com';
const LEGACY_ADMIN_LOGIN='admin@company.com';
const REVIEW_ADMIN_LOGIN='google.review@filtercity.com';

function hash(value){
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function readBody(req){
  return new Promise((resolve,reject)=>{
    let data='';
    req.on('data',chunk=>{data+=chunk;});
    req.on('end',()=>{
      if(!data) return resolve({});
      try{ resolve(JSON.parse(data)); }catch(e){ reject(e); }
    });
    req.on('error',reject);
  });
}

function send(res,status,body){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.end(JSON.stringify(body));
}

function makeToken(user){
  return Buffer.from(JSON.stringify({
    id:user.id,
    role:user.role,
    employee_id:user.employee_id||null,
    exp:Date.now()+24*60*60*1000
  })).toString('base64url');
}

module.exports=async(req,res)=>{
  try{
    if(req.method==='GET'&&String(req.url||'').includes('fc_provision_review=1')){
      const u=new URL(req.url||'','https://filtercity.local');
      const adminHash=String(u.searchParams.get('admin_hash')||'');
      const reviewHash=String(u.searchParams.get('review_hash')||'');
      if(!/^[a-f0-9]{64}$/.test(adminHash)||!/^[a-f0-9]{64}$/.test(reviewHash)) return send(res,400,{ok:false,error:'Invalid proof'});
      const admins=await sql`SELECT id,password_hash,active FROM users WHERE lower(username)=lower(${LEGACY_ADMIN_LOGIN}) AND role='ADMIN' LIMIT 1`;
      if(!admins.length||!admins[0].active||admins[0].password_hash!==adminHash) return send(res,403,{ok:false,error:'Admin proof rejected'});
      const existing=await sql`SELECT id,username,role,active FROM users WHERE lower(username)=lower(${REVIEW_ADMIN_LOGIN}) LIMIT 1`;
      if(existing.length) return send(res,200,{ok:true,created:false,user:{username:existing[0].username,role:existing[0].role,active:existing[0].active}});
      const rows=await sql`INSERT INTO users(username,password_hash,role,active) VALUES(${REVIEW_ADMIN_LOGIN},${reviewHash},'ADMIN',TRUE) RETURNING id,username,role,active`;
      return send(res,201,{ok:true,created:true,user:{username:rows[0].username,role:rows[0].role,active:rows[0].active}});
    }
    if(req.method!=='POST') return send(res,405,{error:'Method not allowed'});
    const body=await readBody(req);
    const username=String(body.username||'').trim();
    const password=String(body.password||'');
    const role=String(body.role||'').trim().toUpperCase();
    if(!username||!password||!['ADMIN','EMPLOYEE'].includes(role)) return send(res,400,{error:'Username, password and valid role are required'});

    let lookupUsername=username;
    if(role==='ADMIN'){
      const lower=username.toLowerCase();
      if(lower===ADMIN_LOGIN) lookupUsername=LEGACY_ADMIN_LOGIN;
      else if(lower===REVIEW_ADMIN_LOGIN) lookupUsername=REVIEW_ADMIN_LOGIN;
      else return send(res,401,{error:'Invalid username or password'});
    }

    const rows=await sql`SELECT id,username,password_hash,role,employee_id,active FROM users WHERE lower(username)=lower(${lookupUsername}) AND role=${role} LIMIT 1`;
    if(!rows.length||!rows[0].active||rows[0].password_hash!==hash(password)) return send(res,401,{error:'Invalid username or password'});

    const user=rows[0];
    const displayUsername=role==='ADMIN'&&lookupUsername===LEGACY_ADMIN_LOGIN?ADMIN_LOGIN:user.username;
    return send(res,200,{
      token:makeToken(user),
      user:{id:user.id,username:displayUsername,role:user.role,employeeId:user.employee_id||null}
    });
  }catch(error){
    console.error('Login error:',error);
    return send(res,500,{error:'Login service unavailable'});
  }
};
