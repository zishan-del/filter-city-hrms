const http = require('http');
const fs = require('fs');
const path = require('path');
const api = require('./api/[...path].js');
const port = process.env.PORT || 3000;

http.createServer((req,res)=>{
  if ((req.url||'').startsWith('/api/')) return api(req,res);
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    return res.end(fs.readFileSync(path.join(__dirname,'index.html')));
  }
  res.writeHead(404, {'Content-Type':'text/plain'});
  res.end('Not found');
}).listen(port,()=>console.log(`FILTER CITY HRMS local server: http://localhost:${port}`));
