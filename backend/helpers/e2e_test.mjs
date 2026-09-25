/**
 * Comprehensive end-to-end test of all database operations:
 * 1. Send verification email (generates OTP/token in DB)
 * 2. Verify email token
 * 3. Register user (creates users + user_profiles rows)
 * 4. Login
 * 5. Get profile
 * 6. Update profile
 * 7. Get dashboard
 * 8. Check admin dashboard stats
 */
const BASE = 'http://localhost:5000';
const TEST_EMAIL = `testuser_${Date.now()}@test.com`;
const TEST_PASS = 'test@123';

const go = async (label, fn) => {
  try {
    const r = await fn();
    console.log(`✅ ${label}:`, typeof r === 'object' ? JSON.stringify(r).substring(0,200) : r);
    return r;
  } catch (e) {
    console.log(`❌ ${label}:`, e.message);
    return null;
  }
};

const api = async (method, path, body, token) => {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + path, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(json)}`);
  return json;
};

// Step 1: Send verification email
const sendRes = await go('Send Verification Email', () =>
  api('POST', '/api/auth/send-verification', { email: TEST_EMAIL })
);

// Step 2: Get the token from DB directly
import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.POSTGRESQL_URI, ssl: { rejectUnauthorized: false } });

const tokenRow = await pool.query('SELECT token FROM email_verifications WHERE email = $1', [TEST_EMAIL]);
const verifyToken = tokenRow.rows[0]?.token;
console.log('📧 Verification token from DB:', verifyToken ? verifyToken.substring(0,20) + '...' : 'NOT FOUND');

// Step 3: Verify email
const verifyRes = await go('Verify Email Token', () =>
  api('POST', '/api/auth/verify-email', { token: verifyToken })
);

// Step 4: Register user
const regRes = await go('Register User', () =>
  api('POST', '/api/auth/register', { username: 'testuser', email: TEST_EMAIL, password: TEST_PASS })
);

// Step 5: Login
const loginData = await go('Login', () =>
  api('POST', '/api/auth/login', { email: TEST_EMAIL, password: TEST_PASS })
);
const authToken = loginData?.token;

// Step 6: Get profile
if (authToken) {
  await go('Get Profile', () => api('GET', '/api/user/profile', null, authToken));
  await go('Get Dashboard', () => api('GET', '/api/user/dashboard', null, authToken));
  await go('Update Profile', () =>
    api('PUT', '/api/user/profile', {
      fullName: 'Test User', phone: '9999999999', bio: 'Hello world', location: 'Hyderabad'
    }, authToken)
  );
}

// Step 7: Admin login + dashboard
const adminLogin = await go('Admin Login', () =>
  api('POST', '/api/auth/login', { email: 'admin@gmail.com', password: 'admin@' })
);
if (adminLogin?.token) {
  await go('Admin Dashboard Stats', () => api('GET', '/api/admin/dashboard-stat', null, adminLogin.token));
}

// Cleanup: delete test user
await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
await pool.query('DELETE FROM email_verifications WHERE email = $1', [TEST_EMAIL]);
console.log('🧹 Cleaned up test user');

await pool.end();
