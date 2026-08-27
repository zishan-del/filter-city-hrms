const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const handler = require('./hrms.js');

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify(body));
}

function auth(req) {
  try {
    const header = req.headers.authorization || '';
    const token = header.replace(/^Bearer\s+/i, '').trim();
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    if (!decoded.id || !decoded.exp || decoded.exp < Date.now() || decoded.role !== 'ADMIN') return null;
    return decoded;
  } catch (_) {
    return null;
  }
}

async function cleanupOrphans() {
  const attendance = await sql`DELETE FROM attendance a WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id=a.employee_id)`;
  const tasks = await sql`DELETE FROM tasks t WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id=t.employee_id)`;
  const leaves = await sql`DELETE FROM leave_requests l WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id=l.employee_id)`;
  const payroll = await sql`DELETE FROM payroll p WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id=p.employee_id)`;
  const eosb = await sql`DELETE FROM eosb_records x WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id=x.employee_id)`;
  const users = await sql`DELETE FROM users u WHERE u.role='EMPLOYEE' AND NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id=u.employee_id)`;
  return {
    attendance: attendance.count,
    tasks: tasks.count,
    leaves: leaves.count,
    payroll: payroll.count,
    eosb: eosb.count,
    users: users.count
  };
}

module.exports = async (req, res) => {
  try {
    const user = auth(req);
    if (!user) return send(res, 403, { error: 'Admin access required' });
    if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
    await cleanupOrphans();
    req.url = '/api/data';
    return handler(req, res);
  } catch (error) {
    console.error(error);
    return send(res, 500, { error: error.message || 'Cleanup failed' });
  }
};
