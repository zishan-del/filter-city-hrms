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
    if (!decoded.id || !decoded.exp || decoded.exp < Date.now()) return null;
    return decoded;
  } catch (_) {
    return null;
  }
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return send(res, 204, {});
    if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
    if (!auth(req)) return send(res, 401, { error: 'Unauthorized' });

    const [users, employees, attendance, tasks, leaves, holidays, payroll, eosb, settings] = await Promise.all([
      sql`SELECT id,username,role,employee_id,active FROM users ORDER BY id`,
      sql`SELECT * FROM employees ORDER BY id`,
      sql`SELECT id,employee_id,
            to_char(COALESCE(check_in, created_at) AT TIME ZONE 'Asia/Riyadh','YYYY-MM-DD') AS work_date,
            CASE WHEN check_in IS NULL THEN NULL ELSE to_char(check_in AT TIME ZONE 'Asia/Riyadh','YYYY-MM-DD HH24:MI:SS') END AS check_in,
            CASE WHEN check_out IS NULL THEN NULL ELSE to_char(check_out AT TIME ZONE 'Asia/Riyadh','YYYY-MM-DD HH24:MI:SS') END AS check_out,
            latitude,longitude,status,created_at
          FROM attendance ORDER BY work_date DESC,id DESC`,
      sql`SELECT * FROM tasks ORDER BY id DESC`,
      sql`SELECT * FROM leave_requests ORDER BY id DESC`,
      sql`SELECT * FROM holidays ORDER BY holiday_date`,
      sql`SELECT * FROM payroll ORDER BY id DESC`,
      sql`SELECT * FROM eosb_records ORDER BY id DESC`,
      sql`SELECT * FROM settings WHERE id=1`
    ]);

    return send(res, 200, {
      users,
      employees,
      attendance,
      tasks,
      leaves,
      holidays,
      payroll,
      eosb,
      settings: settings[0] || { company:'FILTER CITY', hours:8, annual_leave_days:21 }
    });
  } catch (error) {
    console.error(error);
    return send(res, 500, { error: 'Cloud data unavailable' });
  }
};
