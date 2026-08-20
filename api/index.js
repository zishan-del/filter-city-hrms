const handler = require('./hrms.js');

module.exports = async (req, res) => {
  try {
    const incoming = new URL(req.url || '/api/index', 'http://localhost');
    const path = incoming.searchParams.get('path');
    if (path) {
      req.url = '/api/' + path.replace(/^\/+/, '');
    }
    return handler(req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: error.message || 'API routing error' }));
  }
};