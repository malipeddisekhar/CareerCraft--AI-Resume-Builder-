import dotenv from 'dotenv';
dotenv.config();

const BASE = 'http://localhost:5000';

async function test(label, fn) {
  try {
    const result = await fn();
    console.log(`✅ ${label}: ${result}`);
  } catch(e) {
    console.log(`❌ ${label}: ${e.message}`);
  }
}

async function req(method, path, body, headers = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json };
}

async function run() {
  console.log('===== BACKEND API TESTS =====\n');

  // 1. Health check (server running?)
  await test('Server reachable', async () => {
    const r = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({}) });
    return `HTTP ${r.status}`;
  });

  // 2. Register - missing fields
  await test('POST /api/auth/register - missing fields', async () => {
    const r = await req('POST', '/api/auth/register', {});
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 3. Register - unverified email
  await test('POST /api/auth/register - unverified email rejected', async () => {
    const r = await req('POST', '/api/auth/register', { username: 'testuser', email: 'noexist@test.com', password: 'password123' });
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 4. Login - wrong creds
  await test('POST /api/auth/login - wrong credentials', async () => {
    const r = await req('POST', '/api/auth/login', { email: 'wrong@email.com', password: 'wrongpass' });
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 5. Login - missing fields
  await test('POST /api/auth/login - missing fields', async () => {
    const r = await req('POST', '/api/auth/login', { email: '' });
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 6. Send verification - missing email
  await test('POST /api/auth/send-verification - missing email', async () => {
    const r = await req('POST', '/api/auth/send-verification', {});
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 7. Verify email - invalid token
  await test('POST /api/auth/verify-email - invalid token', async () => {
    const r = await req('POST', '/api/auth/verify-email', { token: '00000000-0000-0000-0000-000000000000' });
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 8. Check verification - valid email not verified
  await test('GET /api/auth/check-verification - unknown email', async () => {
    const r = await req('GET', '/api/auth/check-verification?email=unknown@test.com');
    return `status=${r.status} is_verified=${r.json.is_verified}`;
  });

  // 9. Forgot password - non-existent email
  await test('POST /api/auth/forgot-password - nonexistent email', async () => {
    const r = await req('POST', '/api/auth/forgot-password', { email: 'nobody@nowhere.com' });
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 10. Reset password - invalid token
  await test('POST /api/auth/reset-password - invalid token', async () => {
    const r = await req('POST', '/api/auth/reset-password', { token: 'badtoken', newPassword: 'newpass123' });
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 11. Protected endpoint without auth
  await test('GET /api/user/dashboard - no token (should 401)', async () => {
    const r = await req('GET', '/api/user/dashboard');
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 12. Protected endpoint without auth
  await test('GET /api/resume/all - no token (should 401)', async () => {
    const r = await req('GET', '/api/resume/all');
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 13. Protected endpoint without auth
  await test('GET /api/user/profile - no token (should 401)', async () => {
    const r = await req('GET', '/api/user/profile');
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 14. Admin endpoint without auth
  await test('GET /api/admin/dashboard-stat - no token (should 401)', async () => {
    const r = await req('GET', '/api/admin/dashboard-stat');
    return `status=${r.status} msg="${r.json.message}"`;
  });

  // 15. Public plans endpoint
  await test('GET /api/plans - public (should 200)', async () => {
    const r = await req('GET', '/api/plans');
    return `status=${r.status} plans=${r.json.length || JSON.stringify(r.json).substring(0,60)}`;
  });

  // 16. Templates
  await test('GET /api/template - public (should 200)', async () => {
    const r = await req('GET', '/api/template');
    return `status=${r.status} data=${JSON.stringify(r.json).substring(0,80)}`;
  });

  // 17. Blog
  await test('GET /api/blog - public (should 200)', async () => {
    const r = await req('GET', '/api/blog');
    return `status=${r.status} data=${JSON.stringify(r.json).substring(0,80)}`;
  });

  // 18. Newsletter subscribe - missing email
  await test('POST /api/newsletter - missing email', async () => {
    const r = await req('POST', '/api/newsletter', {});
    return `status=${r.status} msg=${JSON.stringify(r.json).substring(0,80)}`;
  });

  // 19. Login admin to get token for further tests
  console.log('\n===== ADMIN LOGIN TEST =====');
  await test('POST /api/auth/login - admin login', async () => {
    const r = await req('POST', '/api/auth/login', { 
      email: process.env.ADMIN_EMAIL, 
      password: process.env.ADMIN_PASSWORD 
    });
    if (r.json.token) {
      global.adminToken = r.json.token;
      return `status=${r.status} token=YES admin=${r.json.isAdmin}`;
    }
    return `status=${r.status} msg="${r.json.message}"`;
  });

  if (global.adminToken) {
    console.log('\n===== AUTHENTICATED ADMIN TESTS =====');
    
    await test('GET /api/admin/dashboard-stat - with admin token', async () => {
      const r = await req('GET', '/api/admin/dashboard-stat', null, { Authorization: `Bearer ${global.adminToken}` });
      return `status=${r.status} keys=${Object.keys(r.json || {}).join(',')}`;
    });

    await test('GET /api/user/ - all users (admin)', async () => {
      const r = await req('GET', '/api/user/', null, { Authorization: `Bearer ${global.adminToken}` });
      return `status=${r.status} count=${Array.isArray(r.json) ? r.json.length : JSON.stringify(r.json).substring(0,60)}`;
    });

    await test('GET /api/user/dashboard - with admin token', async () => {
      const r = await req('GET', '/api/user/dashboard', null, { Authorization: `Bearer ${global.adminToken}` });
      return `status=${r.status} keys=${Object.keys(r.json || {}).join(',')}`;
    });

    await test('GET /api/resume/all - with admin token', async () => {
      const r = await req('GET', '/api/resume/all', null, { Authorization: `Bearer ${global.adminToken}` });
      return `status=${r.status} data=${JSON.stringify(r.json).substring(0,80)}`;
    });

    await test('GET /api/notifications/all - with admin token', async () => {
      const r = await req('GET', '/api/notifications/all', null, { Authorization: `Bearer ${global.adminToken}` });
      return `status=${r.status} data=${JSON.stringify(r.json).substring(0,80)}`;
    });
  }

  console.log('\n===== EMAIL TEST =====');
  await test('POST /api/auth/send-verification - email to test address', async () => {
    const r = await req('POST', '/api/auth/send-verification', { email: 'auditbot@mailinator.com' });
    if (r.json.devToken) {
      return `status=${r.status} DEV_MODE - email not configured, devToken returned`;
    }
    return `status=${r.status} msg="${r.json.message}"`;
  });

  console.log('\n===== DONE =====');
}
run();
