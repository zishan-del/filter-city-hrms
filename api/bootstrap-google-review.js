const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const username = 'google.review@filtercity.com';
  const passwordHash = '6e04331d6559569024c330f7e09c095ab347e8d956db04b11a3e1b551e9366a8';

  await sql`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'EMPLOYEE',
    employee_id TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  const rows = await sql`SELECT id, username, role, active FROM users WHERE lower(username)=lower(${username}) LIMIT 1`;
  if (rows.length) {
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true, existing: true, user: rows[0] }));
  }

  const created = await sql`INSERT INTO users(username,password_hash,role,active)
    VALUES(${username},${passwordHash},'ADMIN',TRUE)
    RETURNING id,username,role,active`;

  res.statusCode = 201;
  return res.end(JSON.stringify({ ok: true, existing: false, user: created[0] }));
};
