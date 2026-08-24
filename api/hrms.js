const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const sql = neon(process.env.DATABASE_URL);

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify(body));
}

function getPath(req) {
  const raw = req.url || '';
  return raw.split('?')[0].replace(/^\/api\/?/, '').replace(/\/$/, '');
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function auth(req) {
  try {
    const header = req.headers.authorization || '';
    const token = header.replace(/^Bearer\s+/i, '').trim();
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    if (!decoded.id || !decoded.exp || decoded.exp < Date.now()) return null;
    return decoded;
  } catch (_) {
    return null;
  }
}

function makeToken(user) {
  return Buffer.from(JSON.stringify({
    id: user.id,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000
  })).toString('base64url');
}

async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'EMPLOYEE',
    employee_id TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    mobile TEXT DEFAULT '',
    national_id TEXT DEFAULT '',
    nationality TEXT DEFAULT 'Saudi',
    joining_date DATE,
    department TEXT DEFAULT '',
    job_title TEXT DEFAULT '',
    salary NUMERIC(14,2) DEFAULT 0,
    housing_allowance NUMERIC(14,2) DEFAULT 0,
    transport_allowance NUMERIC(14,2) DEFAULT 0,
    other_allowance NUMERIC(14,2) DEFAULT 0,
    bank_details TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS housing_allowance NUMERIC(14,2) NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS transport_allowance NUMERIC(14,2) NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS other_allowance NUMERIC(14,2) NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS leave_cycle_years NUMERIC(5,2) NOT NULL DEFAULT 2`;
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_leave_end_date DATE`;
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS next_leave_date DATE`;
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS planned_leave_days NUMERIC(5,2) NOT NULL DEFAULT 30`;
  await sql`CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    work_date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    status TEXT NOT NULL DEFAULT 'Present',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, work_date)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    task_date DATE,
    start_time TIME,
    deadline_time TIME,
    priority TEXT DEFAULT 'Normal',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    leave_type TEXT DEFAULT 'Annual Leave',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days NUMERIC(8,2) DEFAULT 1,
    reason TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS holidays (
    id SERIAL PRIMARY KEY,
    holiday_date DATE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'Company',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS payroll (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    pay_month TEXT NOT NULL,
    basic_salary NUMERIC(14,2) DEFAULT 0,
    allowances NUMERIC(14,2) DEFAULT 0,
    deductions NUMERIC(14,2) DEFAULT 0,
    net_salary NUMERIC(14,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`ALTER TABLE payroll ADD COLUMN IF NOT EXISTS manual_override BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`CREATE TABLE IF NOT EXISTS eosb_records (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    service_years NUMERIC(8,2) DEFAULT 0,
    last_salary NUMERIC(14,2) DEFAULT 0,
    benefit NUMERIC(14,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    company TEXT NOT NULL DEFAULT 'FILTER CITY',
    hours NUMERIC(5,2) NOT NULL DEFAULT 8,
    annual_leave_days NUMERIC(5,2) NOT NULL DEFAULT 21,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`INSERT INTO settings(id, company) VALUES(1, 'FILTER CITY') ON CONFLICT(id) DO NOTHING`;
  await sql`INSERT INTO users(username,password_hash,role,active) VALUES('admin@company.com',${hash('Admin@12345')},'ADMIN',TRUE)
    ON CONFLICT(username) DO NOTHING`;
}

async function login(req, res) {
  const body = await getBody(req);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const role = String(body.role || 'ADMIN').toUpperCase();
  const rows = await sql`SELECT id,username,password_hash,role,employee_id,active FROM users
    WHERE lower(username)=lower(${username}) AND role=${role} LIMIT 1`;
  if (!rows.length || !rows[0].active || rows[0].password_hash !== hash(password)) {
    return send(res, 401, { error: 'Invalid username or password' });
  }
  const user = rows[0];
  return send(res, 200, { token: makeToken(user), user: { id:user.id, username:user.username, role:user.role, employeeId:user.employee_id || null } });
}

async function ensureCurrentPayroll() {
  const month = new Date().toISOString().slice(0,7);
  const employees = await sql`SELECT employee_id,salary,housing_allowance,transport_allowance,other_allowance,status FROM employees WHERE status='Active' ORDER BY employee_id`;
  for (const e of employees) {
    const basic = Number(e.salary || 0);
    const allowances = Number(e.housing_allowance || 0) + Number(e.transport_allowance || 0) + Number(e.other_allowance || 0);
    const existing = await sql`SELECT id,deductions,manual_override FROM payroll WHERE employee_id=${e.employee_id} AND pay_month=${month} LIMIT 1`;
    if (existing.length) {
      if (!existing[0].manual_override) {
        const deductions = Number(existing[0].deductions || 0);
        await sql`UPDATE payroll SET basic_salary=${basic},allowances=${allowances},net_salary=${basic+allowances-deductions} WHERE id=${existing[0].id}`;
      }
      continue;
    }
    await sql`INSERT INTO payroll(employee_id,pay_month,basic_salary,allowances,deductions,net_salary,manual_override)
      VALUES(${e.employee_id},${month},${basic},${allowances},0,${basic+allowances},FALSE)`;
  }
}

async function data(req, res) {
  const user = auth(req);
  if (!user) return send(res, 401, { error: 'Unauthorized' });
  await ensureCurrentPayroll();
  const [users, employees, attendance, tasks, leaves, holidays, payroll, eosb, settings] = await Promise.all([
    sql`SELECT id,username,role,employee_id,active FROM users ORDER BY id`,
    sql`SELECT * FROM employees ORDER BY id`,
    sql`SELECT * FROM attendance ORDER BY work_date DESC,id DESC`,
    sql`SELECT * FROM tasks ORDER BY id DESC`,
    sql`SELECT * FROM leave_requests ORDER BY id DESC`,
    sql`SELECT * FROM holidays ORDER BY holiday_date`,
    sql`SELECT * FROM payroll ORDER BY pay_month DESC,id DESC`,
    sql`SELECT * FROM eosb_records ORDER BY id DESC`,
    sql`SELECT * FROM settings WHERE id=1`
  ]);
  return send(res, 200, { users, employees, attendance, tasks, leaves, holidays, payroll, eosb, settings: settings[0] });
}

function adminOnly(user, res) {
  if (!user || user.role !== 'ADMIN') {
    send(res, 403, { error: 'Admin access required' });
    return false;
  }
  return true;
}

async function createEmployee(body) {
  const e = await sql`INSERT INTO employees(employee_id,full_name,mobile,national_id,nationality,joining_date,department,job_title,salary,housing_allowance,transport_allowance,other_allowance,bank_details,status,leave_cycle_years,last_leave_end_date,next_leave_date,planned_leave_days)
    VALUES(${body.employee_id},${body.full_name},${body.mobile||''},${body.national_id||''},${body.nationality||'Saudi'},${body.joining_date||null},${body.department||''},${body.job_title||''},${Number(body.salary||0)},${Number(body.housing_allowance||0)},${Number(body.transport_allowance||0)},${Number(body.other_allowance||0)},${body.bank_details||''},${body.status||'Active'},${Number(body.leave_cycle_years||2)},${body.last_leave_end_date||null},${body.next_leave_date||null},${Math.min(60,Math.max(30,Number(body.planned_leave_days||30)))}) RETURNING *`;
  if (body.username && body.password) {
    await sql`INSERT INTO users(username,password_hash,role,employee_id,active) VALUES(${body.username},${hash(body.password)},'EMPLOYEE',${body.employee_id},${body.status !== 'Inactive'})
      ON CONFLICT(username) DO UPDATE SET password_hash=EXCLUDED.password_hash, employee_id=EXCLUDED.employee_id, active=EXCLUDED.active`;
  }
  return e[0];
}

async function updateEmployee(id, body) {
  const e = await sql`UPDATE employees SET full_name=${body.full_name},mobile=${body.mobile||''},national_id=${body.national_id||''},nationality=${body.nationality||'Saudi'},joining_date=${body.joining_date||null},department=${body.department||''},job_title=${body.job_title||''},salary=${Number(body.salary||0)},housing_allowance=${Number(body.housing_allowance||0)},transport_allowance=${Number(body.transport_allowance||0)},other_allowance=${Number(body.other_allowance||0)},bank_details=${body.bank_details||''},status=${body.status||'Active'},leave_cycle_years=${Number(body.leave_cycle_years||2)},last_leave_end_date=${body.last_leave_end_date||null},next_leave_date=${body.next_leave_date||null},planned_leave_days=${Math.min(60,Math.max(30,Number(body.planned_leave_days||30)))} WHERE id=${id} RETURNING *`;
  if (!e.length) return null;
  if (body.username) {
    await sql`UPDATE users SET username=${body.username}, active=${body.status !== 'Inactive'} WHERE employee_id=${e[0].employee_id}`;
  }
  if (body.password) {
    await sql`UPDATE users SET password_hash=${hash(body.password)} WHERE employee_id=${e[0].employee_id}`;
  }
  return e[0];
}

async function changeAdminPassword(req, res, user) {
  if (!adminOnly(user,res)) return;
  const body = await getBody(req);
  const currentPassword = String(body.current_password || '');
  const newPassword = String(body.new_password || '');
  if (newPassword.length < 8) return send(res,400,{error:'New password must be at least 8 characters'});
  const rows = await sql`SELECT password_hash FROM users WHERE id=${Number(user.id)} AND role='ADMIN' LIMIT 1`;
  if (!rows.length || rows[0].password_hash !== hash(currentPassword)) return send(res,400,{error:'Current password is incorrect'});
  await sql`UPDATE users SET password_hash=${hash(newPassword)} WHERE id=${Number(user.id)} AND role='ADMIN'`;
  return send(res,200,{ok:true});
}

async function handle(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return send(res, 204, {});

  await ensureSchema();
  const path = getPath(req);
  if (req.method === 'GET' && path === 'health') return send(res, 200, { ok:true, cloud:true, company:'FILTER CITY' });
  if (req.method === 'POST' && path === 'auth/login') return login(req, res);

  const user = auth(req);
  if (!user) return send(res, 401, { error:'Unauthorized' });
  if (req.method === 'GET' && path === 'data') return data(req, res);
  if (req.method === 'POST' && path === 'auth/change-password') return changeAdminPassword(req,res,user);

  const body = ['POST','PUT'].includes(req.method) ? await getBody(req) : {};
  const parts = path.split('/').filter(Boolean);
  const resource = parts[0];
  const id = parts[1] ? Number(parts[1]) : null;

  if (resource === 'employees') {
    if (!adminOnly(user,res)) return;
    if (req.method === 'POST') return send(res,201,{employee:await createEmployee(body)});
    if (req.method === 'PUT' && id) return send(res,200,{employee:await updateEmployee(id,body)});
    if (req.method === 'DELETE' && id) {
      await sql`DELETE FROM users WHERE employee_id=(SELECT employee_id FROM employees WHERE id=${id})`;
      await sql`DELETE FROM employees WHERE id=${id}`;
      return send(res,200,{ok:true});
    }
  }

  if (resource === 'attendance') {
    if (req.method === 'POST') {
      const employeeId = user.role === 'EMPLOYEE' ? user.employee_id : body.employee_id;
      const today = body.work_date || new Date().toISOString().slice(0,10);
      if (!employeeId) return send(res,400,{error:'Employee ID required'});
      const existing = await sql`SELECT * FROM attendance WHERE employee_id=${employeeId} AND work_date=${today} LIMIT 1`;
      if (body.action === 'checkout') {
        if (!existing.length) return send(res,400,{error:'Check in first'});
        const row = await sql`UPDATE attendance SET check_out=NOW(),status='Present' WHERE id=${existing[0].id} RETURNING *`;
        return send(res,200,{attendance:row[0]});
      }
      if (existing.length) return send(res,200,{attendance:existing[0]});
      const row = await sql`INSERT INTO attendance(employee_id,work_date,check_in,latitude,longitude,status) VALUES(${employeeId},${today},NOW(),${body.latitude||null},${body.longitude||null},'Present') RETURNING *`;
      return send(res,201,{attendance:row[0]});
    }
  }

  if (resource === 'tasks') {
    if (req.method === 'POST') {
      if (!adminOnly(user,res)) return;
      const row = await sql`INSERT INTO tasks(employee_id,title,description,task_date,start_time,deadline_time,priority,status) VALUES(${body.employee_id},${body.title},${body.description||''},${body.task_date||null},${body.start_time||null},${body.deadline_time||null},${body.priority||'Normal'},${body.status||'Pending'}) RETURNING *`;
      return send(res,201,{task:row[0]});
    }
    if (req.method === 'PUT' && id) {
      const row = await sql`UPDATE tasks SET status=${body.status},priority=COALESCE(${body.priority},priority),updated_at=NOW() WHERE id=${id} RETURNING *`;
      return send(res,200,{task:row[0]});
    }
  }

  if (resource === 'leaves') {
    if (req.method === 'POST') {
      const employeeId = user.role === 'EMPLOYEE' ? user.employee_id : body.employee_id;
      const row = await sql`INSERT INTO leave_requests(employee_id,leave_type,start_date,end_date,days,reason,status) VALUES(${employeeId},${body.leave_type||'Annual Leave'},${body.start_date},${body.end_date},${Number(body.days||1)},${body.reason||''},'Pending') RETURNING *`;
      return send(res,201,{leave:row[0]});
    }
    if (req.method === 'PUT' && id) {
      if (!adminOnly(user,res)) return;
      const row = await sql`UPDATE leave_requests SET status=${body.status} WHERE id=${id} RETURNING *`;
      return send(res,200,{leave:row[0]});
    }
  }

  if (resource === 'holidays') {
    if (!adminOnly(user,res)) return;
    if (req.method === 'POST') {
      const row = await sql`INSERT INTO holidays(holiday_date,name,type) VALUES(${body.holiday_date},${body.name},${body.type||'Company'}) RETURNING *`;
      return send(res,201,{holiday:row[0]});
    }
    if (req.method === 'DELETE' && id) { await sql`DELETE FROM holidays WHERE id=${id}`; return send(res,200,{ok:true}); }
  }

  if (resource === 'payroll') {
    if (!adminOnly(user,res)) return;
    if (req.method === 'POST') {
      const empRows = await sql`SELECT salary,housing_allowance,transport_allowance,other_allowance FROM employees WHERE employee_id=${body.employee_id} LIMIT 1`;
      if (!empRows.length) return send(res,404,{error:'Employee not found'});
      const e=empRows[0];
      const basic=Number(body.basic_salary ?? e.salary ?? 0);
      const allowances=Number(body.allowances ?? (Number(e.housing_allowance||0)+Number(e.transport_allowance||0)+Number(e.other_allowance||0)));
      const deductions=Number(body.deductions||0);
      const row=await sql`INSERT INTO payroll(employee_id,pay_month,basic_salary,allowances,deductions,net_salary) VALUES(${body.employee_id},${body.pay_month},${basic},${allowances},${deductions},${basic+allowances-deductions}) RETURNING *`;
      return send(res,201,{payroll:row[0]});
    }
    if (req.method === 'PUT' && id) {
      const basic=Number(body.basic_salary||0), allowances=Number(body.allowances||0), deductions=Number(body.deductions||0);
      const row=await sql`UPDATE payroll SET basic_salary=${basic},allowances=${allowances},deductions=${deductions},net_salary=${basic+allowances-deductions},manual_override=TRUE WHERE id=${id} RETURNING *`;
      return send(res,200,{payroll:row[0]});
    }
  }

  if (resource === 'eosb') {
    if (!adminOnly(user,res)) return;
    if (req.method === 'POST') {
      const years=Number(body.service_years||0), salary=Number(body.last_salary||0);
      const benefit=salary * (years <= 5 ? years*0.5 : 2.5 + (years-5));
      const row=await sql`INSERT INTO eosb_records(employee_id,service_years,last_salary,benefit) VALUES(${body.employee_id},${years},${salary},${benefit}) RETURNING *`;
      return send(res,201,{eosb:row[0]});
    }
  }

  if (resource === 'settings') {
    if (!adminOnly(user,res)) return;
    if (req.method === 'PUT') {
      const row=await sql`UPDATE settings SET company=${body.company||'FILTER CITY'},hours=${Number(body.hours||8)},annual_leave_days=${Number(body.annual_leave_days||21)},updated_at=NOW() WHERE id=1 RETURNING *`;
      return send(res,200,{settings:row[0]});
    }
  }

  return send(res,404,{error:'Not found'});
}

module.exports = async (req, res) => {
  try { await handle(req,res); } catch (error) { console.error(error); send(res,500,{error:error.message || 'Server error'}); }
};