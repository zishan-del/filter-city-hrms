const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const sql = neon(process.env.DATABASE_URL);

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
    if(req.method!=='POST') return send(res,405,{error:'Method not allowed'});
    const body=await readBody(req);
    const username=String(body.username||'').trim();
    const password=String(body.password||'');
    const role=String(body.role||'').trim().toUpperCase();
    if(!username||!password||!['ADMIN','EMPLOYEE'].includes(role)) return send(res,400,{error:'Username, password and valid role are required'});

    const rows=await sql`SELECT id,username,password_hash,role,employee_id,active FROM users WHERE lower(username)=lower(${username}) AND role=${role} LIMIT 1`;
    if(!rows.length||!rows[0].active||rows[0].password_hash!==hash(password)) return send(res,401,{error:'Invalid username or password'});

    const user=rows[0];
    return send(res,200,{
      token:makeToken(user),
      user:{id:user.id,username:user.username,role:user.role,employeeId:user.employee_id||null}
    });
  }catch(error){
    console.error('Login error:',error);
    return send(res,500,{error:'Login service unavailable'});
  }
};
