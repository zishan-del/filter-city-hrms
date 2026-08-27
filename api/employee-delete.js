const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

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

module.exports = async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204, {});
    const user = auth(req);
    if (!user) return send(res, 403, { error: 'Admin access required' });
    if (req.method !== 'DELETE') return send(res, 405, { error: 'Method not allowed' });

    const url = new URL(req.url || '/', 'http://localhost');
    const employeeId = String(url.searchParams.get('id') || '').trim();
    if (!employeeId) return send(res, 400, { error: 'Employee ID required' });

    const employeeRows = await sql`SELECT employee_id FROM employees WHERE id=${Number(employeeId)} LIMIT 1`;
    if (!employeeRows.length) return send(res, 404, { error: 'Employee not found' });
    const eid = employeeRows[0].employee_id;

    await sql`DELETE FROM attendance WHERE employee_id=${eid}`;
    await sql`DELETE FROM tasks WHERE employee_id=${eid}`;
    await sql`DELETE FROM leave_requests WHERE employee_id=${eid}`;
    await sql`DELETE FROM payroll WHERE employee_id=${eid}`;
    await sql`DELETE FROM eosb_records WHERE employee_id=${eid}`;
    await sql`DELETE FROM users WHERE employee_id=${eid}`;
    await sql`DELETE FROM employees WHERE employee_id=${eid}`;

    return send(res, 200, { ok: true, employee_id: eid, message: 'Employee and all related records deleted' });
  } catch (error) {
    console.error(error);
    return send(res, 500, { error: error.message || 'Delete failed' });
  }
};
