const http = require('http');
const https = require('https');
const url = require('url');

const TARGET_HOST = 'gacha-travel--s8869420.replit.app';
const PORT = 3001;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url);
  const targetPath = parsedUrl.path.replace(/^\/api-proxy/, '');
  
  const options = {
    hostname: TARGET_HOST,
    port: 443,
    path: targetPath,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  console.log(`Proxying ${req.method} ${targetPath} to ${TARGET_HOST}`);

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
    });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502);
    res.end(JSON.stringify({ error: 'Proxy Error', message: err.message }));
  });

  if (req.method === 'POST' || req.method === 'PUT') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
    proxyReq.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CORS Proxy running on http://0.0.0.0:${PORT}`);
  console.log(`Target: https://${TARGET_HOST}`);
});
