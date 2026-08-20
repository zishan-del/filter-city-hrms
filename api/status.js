const { neon } = require('@neondatabase/serverless');

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify(body));
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { ok: false, error: 'GET only' });

  if (!process.env.DATABASE_URL) {
    return send(res, 500, {
      ok: false,
      cloud: false,
      error: 'DATABASE_URL is not configured in Vercel.'
    });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT current_database() AS database_name, current_user AS database_user`;
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users','employees','attendance','tasks','leave_requests','holidays','payroll','eosb_records','settings')
      ORDER BY table_name
    `;

    return send(res, 200, {
      ok: true,
      cloud: true,
      company: 'FILTER CITY',
      database: result[0]?.database_name || null,
      tables: tables.map(row => row.table_name),
      expectedTables: 9,
      ready: tables.length === 9
    });
  } catch (error) {
    console.error('FILTER CITY cloud status error:', error);
    return send(res, 500, {
      ok: false,
      cloud: false,
      error: error.message || 'Database connection failed'
    });
  }
};
