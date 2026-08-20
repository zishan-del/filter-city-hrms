const { neon } = require('@neondatabase/serverless');

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

module.exports = async (req, res) => {
  try {
    const incoming = new URL(req.url || '/api/index', 'http://localhost');
    const path = incoming.searchParams.get('path');
    if (path) {
      req.url = '/api/' + path.replace(/^\/+/, '');
    }

    // The original employee login token predates the employee_id claim.
    // Before employee-only API calls reach hrms.js, enrich that token from
    // the users table. This keeps attendance and leave tied to the logged-in
    // employee without changing the existing database or frontend behavior.
    const cleanPath = (req.url || '').split('?')[0].replace(/^\/api\/?/, '').replace(/\/$/, '');
    const authHeader = req.headers.authorization || '';
    if (authHeader && cleanPath !== 'auth/login') {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const decoded = decodeToken(token);
      if (decoded && decoded.id && decoded.role === 'EMPLOYEE' && !decoded.employee_id) {
        const rows = await sql`SELECT employee_id FROM users WHERE id=${Number(decoded.id)} AND role='EMPLOYEE' LIMIT 1`;
        if (rows.length && rows[0].employee_id) {
          req.headers.authorization = 'Bearer ' + makeEmployeeAwareToken(decoded, rows[0].employee_id);
        }
      }
    }

    return handler(req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: error.message || 'API routing error' }));
  }
};
