const https = require('https');
const bcrypt = require('bcryptjs');

const srvKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwenh0cHdhanhxYmd5cXRiYm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NDQ1MCwiZXhwIjoyMDk2NjYwNDUwfQ.zniwTnx6SqswyGly2k2TkdEwihnUHD6wYlGe7Oulk6Q';
const projectId = 'cpzxtpwajxqbgyqtbbmx';

function rest(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const req = https.request({
      hostname: projectId + '.supabase.co',
      path: '/rest/v1/' + path,
      method,
      headers: {
        'apikey': srvKey,
        'Authorization': 'Bearer ' + srvKey,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : undefined
      }
    }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d.substring(0, 200) }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function main() {
  // 1. Check if custom_users already has test@beginly.app
  const existing = await rest('GET', 'custom_users?email=eq.test@beginly.app&select=user_id,email');
  console.log('Existing custom_users check:', existing.status, JSON.stringify(existing.body));

  if (existing.body && existing.body.length > 0) {
    console.log('User already linked:', existing.body[0].user_id);
  } else {
    console.log('Need to link user...');
  }

  // 2. Get user_id from auth.users using admin API
  const adminRes = await rest('GET', 'auth.users?email=eq.test@beginly.app&select=id,email');
  console.log('Auth.users lookup:', adminRes.status, JSON.stringify(adminRes.body));
}

main().catch(console.error);
