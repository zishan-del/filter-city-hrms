module.exports = async function handler(req, res) {
  try {
    const raw = String(process.env.DATABASE_URL || '');
    if (!raw) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ ok: false, error: 'DATABASE_URL not configured' }));
    }
    const parsed = new URL(raw);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.end(JSON.stringify({ ok: true, db_host: parsed.hostname, db_name: parsed.pathname.replace(/^\//, '') || null }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ ok: false, error: 'Unable to inspect database target' }));
  }
};
