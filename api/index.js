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

function sendAppShell(res) {
  const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const ui = fs.readFileSync(path.join(process.cwd(), 'task-photo-ui.js'), 'utf8');
  const injected = html.replace('</body>', `<script>\n${ui}\n</script>\n</body>`);
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

async function handleTaskPhoto(req, res, taskId, decoded) {
  if (!decoded || !decoded.id || !decoded.exp || decoded.exp < Date.now()) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'Unauthorized' }));
  }
  const id = Number(taskId);
  if (!id) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'Task ID required' }));
  }
  const taskRows = await sql`SELECT id, employee_id FROM tasks WHERE id=${id} LIMIT 1`;
  if (!taskRows.length) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'Task not found' }));
  }
  if (decoded.role !== 'ADMIN' && taskRows[0].employee_id !== decoded.employee_id) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'This task is not assigned to you' }));
  }
  const body = await readJson(req);
  const photo = body.photo_data ? String(body.photo_data) : null;
  if (photo && photo.length > 700000) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'Photo is too large. Please use a smaller photo.' }));
  }
  const row = await sql`UPDATE tasks SET photo_data=${photo}, updated_at=NOW() WHERE id=${id} RETURNING *`;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.end(JSON.stringify({ task: row[0] }));
}

module.exports = async (req, res) => {
  try {
    const incoming = new URL(req.url || '/api/index', 'http://localhost');
    const pathParam = incoming.searchParams.get('path');
    if (pathParam === '__app__') return sendAppShell(res);
    if (pathParam) {
      req.url = '/api/' + pathParam.replace(/^\/+/, '');
    }

    const cleanPath = (req.url || '').split('?')[0].replace(/^\/api\/?/, '').replace(/\/$/, '');
    const authHeader = req.headers.authorization || '';
    const rawToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const decoded = decodeToken(rawToken);

    if (cleanPath.startsWith('task-photo/') && (req.method === 'PUT' || req.method === 'DELETE')) {
      return handleTaskPhoto(req, res, cleanPath.split('/')[1], decoded);
    }

    // The original employee login token predates the employee_id claim.
    // Before employee-only API calls reach hrms.js, enrich that token from
    // the users table. This keeps attendance and leave tied to the logged-in
    // employee without changing the existing database or frontend behavior.
    if (authHeader && cleanPath !== 'auth/login') {
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
