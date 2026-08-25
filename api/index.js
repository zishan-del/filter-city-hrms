const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const handler = require('./hrms.js');
const sql = neon(process.env.DATABASE_URL);

function decodeToken(token) {
  try { return JSON.parse(Buffer.from(token, 'base64url').toString('utf8')); } catch (_) { return null; }
}

function makeEmployeeAwareToken(decoded, employeeId) {
  return Buffer.from(JSON.stringify({
    id: decoded.id,
    role: decoded.role,
    employee_id: employeeId || null,
    exp: decoded.exp
  })).toString('base64url');
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify(body));
}

function sendAppShell(res) {
  const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const ui = fs.readFileSync(path.join(process.cwd(), 'task-photo-ui.js'), 'utf8');
  const leaveReasonUi = fs.readFileSync(path.join(process.cwd(), 'leave-reason-ui.js'), 'utf8');
  const payrollUi = fs.readFileSync(path.join(process.cwd(), 'payroll-ui.js'), 'utf8');
  const injected = html.replace('</body>', `<script>\n${ui}\n</script>\n<script>\n${leaveReasonUi}\n</script>\n<script>\n${payrollUi}\n</script>\n</body>`);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(injected);
}

async function readJson(req) {
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function riyadhNowParts() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const out = {};
  for (const p of parts) if (p.type !== 'literal') out[p.type] = p.value;
  return out;
}

function riyadhDate() {
  const p = riyadhNowParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function riyadhDateTime() {
  const p = riyadhNowParts();
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

function riyadhMonth() {
  const p = riyadhNowParts();
  return `${p.year}-${p.month}`;
}

async function ensureAttendanceTimezone() {
  const cols = await sql`SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='attendance' AND column_name IN ('check_in','check_out')`;
  const types = Object.fromEntries(cols.map(c => [c.column_name, c.data_type]));
  if (types.check_in === 'timestamp with time zone') {
    await sql`ALTER TABLE attendance ALTER COLUMN check_in TYPE TEXT USING CASE WHEN check_in IS NULL THEN NULL ELSE to_char(check_in AT TIME ZONE 'Asia/Riyadh','YYYY-MM-DD HH24:MI:SS') END`;
  }
  if (types.check_out === 'timestamp with time zone') {
    await sql`ALTER TABLE attendance ALTER COLUMN check_out TYPE TEXT USING CASE WHEN check_out IS NULL THEN NULL ELSE to_char(check_out AT TIME ZONE 'Asia/Riyadh','YYYY-MM-DD HH24:MI:SS') END`;
  }
}

async function handleAttendance(req, res, decoded) {
  if (!decoded || !decoded.id || !decoded.exp || decoded.exp < Date.now()) return sendJson(res, 401, { error: 'Unauthorized' });
  await ensureAttendanceTimezone();
  const body = req.method === 'POST' ? await readJson(req) : {};
  const employeeId = decoded.role === 'EMPLOYEE' ? decoded.employee_id : String(body.employee_id || '').trim();
  if (!employeeId) return sendJson(res, 400, { error: 'Employee ID required' });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const today = String(body.work_date || riyadhDate()).slice(0, 10);
  const existing = await sql`SELECT * FROM attendance WHERE employee_id=${employeeId} AND work_date=${today} LIMIT 1`;

  if (body.action === 'checkout') {
    if (!existing.length) return sendJson(res, 400, { error: 'Check in first' });
    const row = await sql`UPDATE attendance SET check_out=${riyadhDateTime()},status='Present' WHERE id=${existing[0].id} RETURNING *`;
    return sendJson(res, 200, { attendance: row[0] });
  }

  if (existing.length) return sendJson(res, 200, { attendance: existing[0] });
  const row = await sql`INSERT INTO attendance(employee_id,work_date,check_in,latitude,longitude,status) VALUES(${employeeId},${today},${riyadhDateTime()},${body.latitude||null},${body.longitude||null},'Present') RETURNING *`;
  return sendJson(res, 201, { attendance: row[0] });
}

async function handleTaskPhoto(req, res, taskId, decoded) {
  if (!decoded || !decoded.id || !decoded.exp || decoded.exp < Date.now()) {
    return sendJson(res, 401, { error: 'Unauthorized' });
  }
  const id = Number(taskId);
  if (!id) return sendJson(res, 400, { error: 'Task ID required' });
  const taskRows = await sql`SELECT id, employee_id FROM tasks WHERE id=${id} LIMIT 1`;
  if (!taskRows.length) return sendJson(res, 404, { error: 'Task not found' });
  if (decoded.role !== 'ADMIN' && taskRows[0].employee_id !== decoded.employee_id) return sendJson(res, 403, { error: 'This task is not assigned to you' });
  const body = await readJson(req);
  const photo = body.photo_data ? String(body.photo_data) : null;
  if (photo && photo.length > 700000) return sendJson(res, 400, { error: 'Photo is too large. Please use a smaller photo.' });
  const row = await sql`UPDATE tasks SET photo_data=${photo}, updated_at=NOW() WHERE id=${id} RETURNING *`;
  return sendJson(res, 200, { task: row[0] });
}

async function ensurePayrollSchema() {
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS payroll_allowances NUMERIC(14,2) NOT NULL DEFAULT 0`;
}

async function handlePayrollSync(req, res, decoded) {
  if (!decoded || decoded.role !== 'ADMIN') return sendJson(res, 403, { error: 'Admin access required' });
  const body = req.method === 'POST' ? await readJson(req) : {};
  await ensurePayrollSchema();
  const month = String(body.pay_month || riyadhMonth()).slice(0,7);
  const employees = await sql`SELECT employee_id,salary,payroll_allowances,status FROM employees WHERE status='Active' ORDER BY id`;
  for (const e of employees) {
    const existing = await sql`SELECT id FROM payroll WHERE employee_id=${e.employee_id} AND pay_month=${month} LIMIT 1`;
    if (!existing.length) {
      const basic = Number(e.salary || 0);
      const allowances = Number(e.payroll_allowances || 0);
      await sql`INSERT INTO payroll(employee_id,pay_month,basic_salary,allowances,deductions,net_salary) VALUES(${e.employee_id},${month},${basic},${allowances},0,${basic+allowances})`;
    }
  }
  const rows = await sql`SELECT * FROM payroll WHERE pay_month=${month} ORDER BY id DESC`;
  return sendJson(res, 200, { pay_month: month, payroll: rows });
}

async function handleEmployeePayrollDefault(req, res, decoded) {
  if (!decoded || decoded.role !== 'ADMIN') return sendJson(res, 403, { error: 'Admin access required' });
  const body = await readJson(req);
  await ensurePayrollSchema();
  const employeeId = String(body.employee_id || '').trim();
  if (!employeeId) return sendJson(res, 400, { error: 'Employee ID required' });
  const allowance = Math.max(0, Number(body.allowances || 0));
  const month = String(body.pay_month || riyadhMonth()).slice(0,7);
  const employees = await sql`SELECT employee_id,salary FROM employees WHERE employee_id=${employeeId} LIMIT 1`;
  if (!employees.length) return sendJson(res, 404, { error: 'Employee not found' });
  await sql`UPDATE employees SET payroll_allowances=${allowance} WHERE employee_id=${employeeId}`;
  const basic = Number(employees[0].salary || 0);
  const existing = await sql`SELECT id,deductions FROM payroll WHERE employee_id=${employeeId} AND pay_month=${month} LIMIT 1`;
  if (existing.length) {
    const deductions = Number(existing[0].deductions || 0);
    const row = await sql`UPDATE payroll SET basic_salary=${basic},allowances=${allowance},net_salary=${basic+allowance-deductions} WHERE id=${existing[0].id} RETURNING *`;
    return sendJson(res, 200, { payroll: row[0] });
  }
  const row = await sql`INSERT INTO payroll(employee_id,pay_month,basic_salary,allowances,deductions,net_salary) VALUES(${employeeId},${month},${basic},${allowance},0,${basic+allowance}) RETURNING *`;
  return sendJson(res, 201, { payroll: row[0] });
}

module.exports = async (req, res) => {
  try {
    const incoming = new URL(req.url || '/api/index', 'http://localhost');
    const pathParam = incoming.searchParams.get('path');
    if (pathParam === '__app__') return sendAppShell(res);
    if (pathParam) req.url = '/api/' + pathParam.replace(/^\/+/, '');

    const cleanPath = (req.url || '').split('?')[0].replace(/^\/api\/?/, '').replace(/\/$/, '');
    const authHeader = req.headers.authorization || '';
    const rawToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    let decoded = decodeToken(rawToken);

    if (authHeader && cleanPath !== 'auth/login' && decoded && decoded.id && decoded.role === 'EMPLOYEE' && !decoded.employee_id) {
      const rows = await sql`SELECT employee_id FROM users WHERE id=${Number(decoded.id)} AND role='EMPLOYEE' LIMIT 1`;
      if (rows.length && rows[0].employee_id) {
        decoded = { ...decoded, employee_id: rows[0].employee_id };
        req.headers.authorization = 'Bearer ' + makeEmployeeAwareToken(decoded, rows[0].employee_id);
      }
    }

    if (cleanPath === 'attendance') return handleAttendance(req, res, decoded);
    if (cleanPath.startsWith('task-photo/') && (req.method === 'PUT' || req.method === 'DELETE')) {
      return handleTaskPhoto(req, res, cleanPath.split('/')[1], decoded);
    }
    if (cleanPath === 'payroll/sync' && req.method === 'POST') return handlePayrollSync(req, res, decoded);
    if (cleanPath === 'employee-payroll-default' && req.method === 'POST') return handleEmployeePayrollDefault(req, res, decoded);

    return handler(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || 'API routing error' });
  }
};
