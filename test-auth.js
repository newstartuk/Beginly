const http = require('http');

function api(method, path, token) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({ hostname: 'localhost', port: 3456, path, method, headers }, res => {
      let b = ''; res.on('data', d => b += d); res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('SERVER TIMEOUT')); });
    req.end();
  });
}

async function main() {
  // Sign in
  const data = JSON.stringify({ email: 'test@beginly.app', password: 'Test1234!' });
  const signinReq = http.request({
    hostname: 'localhost', port: 3456, path: '/api/auth/signin', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
  }, res => {
    let b = ''; res.on('data', d => b += d); res.on('end', async () => {
      const t0 = Date.now();
      console.log('SIGNIN:', res.statusCode, 'time:', t0, 'body:', b.substring(0, 80));
      if (res.statusCode === 200) {
        const r = JSON.parse(b);
        // Test /me with token
        try {
          const me = await api('GET', '/api/auth/me', r.token);
          console.log('ME:', me.status, me.body.substring(0, 100));
        } catch (e) { console.log('ME failed:', e.message); }
      }
    });
  });
  signinReq.on('error', e => console.log('Signin req error:', e.message));
  signinReq.setTimeout(20000, () => { console.log('Signin TIMEOUT'); signinReq.destroy(); });
  signinReq.write(data); signinReq.end();
}

main().catch(console.error);
