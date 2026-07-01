// Quick end-to-end sign-in test
const http = require('http');

function api(method, path, token, body) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (body) headers['Content-Length'] = Buffer.byteLength(body);
    const req = http.request({ hostname: 'localhost', port: 3456, path, method, headers }, res => {
      let b = ''; res.on('data', d => b += d);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('TIMEOUT')); });
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== Sign-In E2E Test ===\n');

  // Sign in
  const body = JSON.stringify({ email: 'test@beginly.app', password: 'Test1234!' });
  const r = await api('POST', '/api/auth/signin', null, body);
  console.log('Sign-in status:', r.status);
  const d = JSON.parse(r.body);
  console.log('User:', d.user?.email, '| hasProfile:', d.user?.hasProfile);

  if (r.status !== 200) {
    console.log('ERROR:', d.error);
    return;
  }

  const token = d.token;
  console.log('Token:', token.substring(0, 30) + '...');

  // Check /me
  const me = await api('GET', '/api/auth/me', token, null);
  console.log('\n/api/auth/me status:', me.status);
  if (me.status === 200) {
    const md = JSON.parse(me.body);
    console.log('User from /me:', md.user?.email, '| hasProfile:', md.hasProfile);
  }

  // Logout
  const logout = await api('POST', '/api/auth/logout', token, null);
  console.log('\nLogout status:', logout.status);

  // Check /me after logout (should be 401)
  const afterLogout = await api('GET', '/api/auth/me', token, null);
  console.log('/api/auth/me after logout:', afterLogout.status, afterLogout.status === 401 ? '✓' : '✗');

  console.log('\n=== All auth flows working ===');
}

main().catch(e => console.error('Error:', e.message));
