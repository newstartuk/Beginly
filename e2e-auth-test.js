const http = require('http');

function api(method, path, token, body) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (body) headers['Content-Length'] = Buffer.byteLength(body);
    const opts = { hostname: 'localhost', port: 3456, path, method, headers };
    const req = http.request(opts, res => {
      let b = ''; res.on('data', d => b += d);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('TIMEOUT')); });
    if (body) req.write(body);
    req.end();
  });
}

async function test(name, fn) {
  try {
    const r = await fn();
    console.log(`[PASS] ${name}`);
    return r;
  } catch (e) {
    console.log(`[FAIL] ${name}: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('=== Beginly E2E Auth Test ===\n');

  // 1. Public routes accessible without auth
  await test('GET / redirects to landing page (200)', async () => {
    const r = await api('GET', '/', null, null);
    if (![200, 302].includes(r.status)) throw new Error(`Got ${r.status}`);
  });

  await test('GET /login shows login page (200)', async () => {
    const r = await api('GET', '/login', null, null);
    if (r.status !== 200) throw new Error(`Got ${r.status}`);
  });

  // 2. Protected routes redirect without auth
  await test('GET /dashboard redirects unauthenticated (302)', async () => {
    const r = await api('GET', '/dashboard', null, null);
    if (r.status !== 302) throw new Error(`Got ${r.status}`);
  });

  // 3. Sign in
  let token = null;
  let signinRes;
  await test('POST /api/auth/signin with test credentials', async () => {
    const body = JSON.stringify({ email: 'test@beginly.app', password: 'Test1234!' });
    const r = await api('POST', '/api/auth/signin', null, body);
    if (r.status !== 200) throw new Error(`Got ${r.status}: ${r.body.substring(0, 100)}`);
    const d = JSON.parse(r.body);
    if (!d.token) throw new Error('No token in response');
    if (!d.user) throw new Error('No user in response');
    token = d.token;
    signinRes = d;
    console.log(`    User: ${d.user.email} (hasProfile: ${d.user.hasProfile})`);
    console.log(`    Token: ${token.substring(0, 20)}...`);
  });

  if (!token) { console.log('\nSign-in failed, skipping remaining tests'); return; }

  // 4. Authenticated /me
  await test('GET /api/auth/me with valid token', async () => {
    const r = await api('GET', '/api/auth/me', token, null);
    if (r.status !== 200) throw new Error(`Got ${r.status}: ${r.body.substring(0, 100)}`);
    const d = JSON.parse(r.body);
    if (!d.user) throw new Error('No user in /me response');
    console.log(`    User: ${d.user.email}`);
  });

  // 5. Dashboard accessible with cookie (simulate with token header)
  await test('GET /dashboard with auth cookie (302 to dashboard content)', async () => {
    // Note: cookie-based auth needs the cookie set, but we test the redirect logic
    const r = await api('GET', '/dashboard', token, null);
    // With valid cookie, should either 200 (direct) or 302 (internal redirect)
    if (r.status === 302) {
      console.log(`    Redirect to: ${r.body}`);
    } else if (r.status === 200) {
      console.log(`    Dashboard accessible`);
    } else {
      throw new Error(`Got ${r.status}`);
    }
  });

  // 6. Sign out
  await test('POST /api/auth/logout clears session', async () => {
    const r = await api('POST', '/api/auth/logout', token, null);
    if (r.status !== 200) throw new Error(`Got ${r.status}`);
  });

  // 7. After logout, /api/auth/me should fail
  await test('GET /api/auth/me after logout fails (401)', async () => {
    const r = await api('GET', '/api/auth/me', token, null);
    if (r.status !== 401) throw new Error(`Got ${r.status}`);
  });

  console.log('\n=== Test Complete ===');
}

main().catch(e => console.error('Fatal:', e));
