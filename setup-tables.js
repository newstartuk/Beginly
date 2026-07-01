const https = require('https');

const srvKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwenh0cHdhanhxYmd5cXRiYm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NDQ1MCwiZXhwIjoyMDk2NjYwNDUwfQ.zniwTnx6SqswyGly2k2TkdEwihnUHD6wYlGe7Oulk6Q';
const projectId = 'cpzxtpwajxqbgyqtbbmx';

function mgmtQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: '/v1/projects/' + projectId + '/database/query',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + srvKey,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d.substring(0, 500) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Creating custom_users table...');
  const r1 = await mgmtQuery(`
    CREATE TABLE IF NOT EXISTS public.custom_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('Result:', r1.status, r1.body);

  console.log('Creating custom_sessions table...');
  const r2 = await mgmtQuery(`
    CREATE TABLE IF NOT EXISTS public.custom_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.custom_users(user_id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('Result:', r2.status, r2.body);

  console.log('Creating index...');
  const r3 = await mgmtQuery(`CREATE INDEX IF NOT EXISTS idx_custom_sessions_token ON public.custom_sessions(token);`);
  console.log('Result:', r3.status, r3.body);
}

main().catch(console.error);
