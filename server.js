const http = require('http');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;

function json(res, status, body) {
  res.writeHead(status, {'Content-Type':'application/json','Cache-Control':'no-store'});
  res.end(JSON.stringify(body));
}
function readBody(req) { return new Promise((resolve,reject)=>{ let s=''; req.on('data',c=>s+=c); req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}}); req.on('error',reject); }); }
function hash(p){ return require('crypto').createHash('sha256').update(String(p)).digest('hex'); }
function token(id){ return Buffer.from(JSON.stringify({id,exp:Date.now()+86400000})).toString('base64url'); }
function auth(req){ try { const h=req.headers.authorization||''; const x=JSON.parse(Buffer.from(h.replace(/^Bearer /,'').trim(),'base64url').toString()); if(!x.id||x.exp<Date.now()) return null; return x.id; } catch{return null;} }

async function login(req,res){
  const b=await readBody(req); const username=String(b.username||'').trim(); const password=String(b.password||''); const role=String(b.role||'ADMIN');
  const rows=await sql`SELECT id,username,password_hash,role,employee_id,active FROM users WHERE lower(username)=lower(${username}) AND role=${role} LIMIT 1`;
  if(!rows.length||!rows[0].active||rows[0].password_hash!==hash(password)) return json(res,401,{error:'Invalid username or password'});
  const u=rows[0]; return json(res,200,{token:token(u.id),user:{id:u.id,username:u.username,role:u.role,employeeId:u.employee_id||null}});
}
async function data(req,res){
  const uid=auth(req); if(!uid)return json(res,401,{error:'Unauthorized'});
  const [users,employees,attendance,tasks,leaves,holidays,payroll,eosb,settings]=await Promise.all([
    sql`SELECT id,username,role,employee_id,active FROM users ORDER BY id`,sql`SELECT * FROM employees ORDER BY id`,sql`SELECT * FROM attendance ORDER BY work_date DESC,id DESC`,sql`SELECT * FROM tasks ORDER BY id DESC`,sql`SELECT * FROM leave_requests ORDER BY id DESC`,sql`SELECT * FROM holidays ORDER BY holiday_date`,sql`SELECT * FROM payroll ORDER BY id DESC`,sql`SELECT * FROM eosb_records ORDER BY id DESC`,sql`SELECT * FROM settings WHERE id=1`
  ]);
  json(res,200,{users,employees,attendance,tasks,leaves,holidays,payroll,eosb,settings:settings[0]||{company:'FILTER CITY',hours:8,annual_leave_days:21}});
}
async function main(){
  await sql`INSERT INTO settings(id,company) VALUES(1,'FILTER CITY') ON CONFLICT(id) DO NOTHING`;
  await sql`INSERT INTO users(username,password_hash,role) VALUES('admin@company.com',${hash('Admin@12345')},'ADMIN') ON CONFLICT(username) DO UPDATE SET password_hash=EXCLUDED.password_hash,role='ADMIN',active=true WHERE users.role='ADMIN'`;
  const server=http.createServer(async(req,res)=>{try{
    if(req.method==='POST'&&req.url==='/api/auth/login')return login(req,res);
    if(req.method==='GET'&&req.url==='/api/data')return data(req,res);
    if(req.url==='/api/health')return json(res,200,{ok:true,cloud:true,company:'FILTER CITY'});
    json(res,404,{error:'Not found'});
  }catch(e){console.error(e);json(res,500,{error:'Server error'});}});
  server.listen(PORT,()=>console.log('FILTER CITY HRMS API listening on '+PORT));
}
main().catch(e=>{console.error(e);process.exit(1)});
