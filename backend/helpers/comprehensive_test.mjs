import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const BASE = 'http://localhost:5000';
const TEST_EMAIL = `dbtest_${Date.now()}@careercraft.test`;
const TEST_PASS = 'P@ssword123!';
const TEST_USER = `dbuser_${Date.now().toString().slice(-6)}`;

const pool = new pg.Pool({
  connectionString: process.env.POSTGRESQL_URI,
  ssl: { rejectUnauthorized: false }
});

const report = [];

const step = async (name, fn) => {
  try {
    const result = await fn();
    report.push({ name, status: 'PASSED', details: result });
    console.log(`✅ [PASS] ${name}`);
    return result;
  } catch (err) {
    report.push({ name, status: 'FAILED', error: err.message });
    console.error(`❌ [FAIL] ${name}: ${err.message}`);
    return null;
  }
};

const api = async (method, path, body = null, token = null) => {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${json.message || json.error || JSON.stringify(json)}`);
  }
  return json;
};

console.log('🚀 Starting Comprehensive Database & API Operations Test...');

// 1. Send verification email
const verifRes = await step('Auth: Send Verification', async () => {
  return await api('POST', '/api/auth/send-verification', { email: TEST_EMAIL });
});

// 2. Obtain verification token
let token = verifRes?.devToken;
if (!token) {
  const r = await pool.query('SELECT token FROM email_verifications WHERE email = $1', [TEST_EMAIL]);
  token = r.rows[0]?.token;
}

// 3. Verify Email Token
await step('Auth: Verify Email Token', async () => {
  return await api('POST', '/api/auth/verify-email', { token });
});

// 4. Register
await step('Auth: Register Account', async () => {
  return await api('POST', '/api/auth/register', {
    username: TEST_USER,
    email: TEST_EMAIL,
    password: TEST_PASS
  });
});

// 5. Login
const loginRes = await step('Auth: Login', async () => {
  return await api('POST', '/api/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASS
  });
});

const userToken = loginRes?.token;
const userId = loginRes?.userID;

// 6. User Profile - Get
await step('User: Get Profile', async () => {
  return await api('GET', '/api/user/profile', null, userToken);
});

// 7. User Profile - Update
await step('User: Update Profile', async () => {
  return await api('PUT', '/api/user/profile', {
    fullName: 'Test Developer',
    phone: '+1 555-0199',
    location: 'San Francisco, CA',
    bio: 'Software engineer testing resume builder',
    github: 'https://github.com/testdev',
    linkedin: 'https://linkedin.com/in/testdev',
    extra_links: [{ name: 'Portfolio', url: 'https://testdev.me' }]
  }, userToken);
});

// 8. User Dashboard Stats
await step('User: Get Dashboard Stats', async () => {
  return await api('GET', '/api/user/dashboard', null, userToken);
});

// 9. Resumes - Save Resume
let createdCvId = null;
const resumeRes = await step('Resume: Save Resume (Builder)', async () => {
  const r = await api('POST', '/api/resume/save', {
    personalInfo: {
      firstName: 'Test',
      lastName: 'Developer',
      email: TEST_EMAIL,
      jobTitle: 'Full Stack Engineer',
      location: 'Hyderabad'
    },
    summary: 'Experienced developer with solid PostgreSQL and React background.',
    skills: [{ name: 'JavaScript' }, { name: 'Node.js' }, { name: 'PostgreSQL' }],
    experience: [
      {
        company: 'CareerCraft',
        position: 'Senior Engineer',
        duration: '2023 - Present',
        description: 'Engineered high performance full-stack systems with 99.9% uptime.'
      }
    ]
  }, userToken);
  createdCvId = r?.cvId;
  return r;
});

// 10. Resumes - Get All Resumes
await step('Resume: Get All Resumes', async () => {
  return await api('GET', '/api/resume/all', null, userToken);
});

// 11. ATS Scans - Fetch Scans
await step('ATS: Get User Scans & Statistics', async () => {
  const scans = await api('GET', '/api/resume/scans', null, userToken);
  const stats = await api('GET', '/api/resume/statistics', null, userToken);
  return { scansCount: scans.count, stats: stats.statistics };
});

// 12. Dashboard - Main User Dashboard Activity
await step('Dashboard: Get Combined Dashboard', async () => {
  return await api('GET', '/api/dashboard/summary', null, userToken);
});

// 13. Notifications - Create & Read
await step('Notifications: Create & Fetch', async () => {
  await pool.query(
    `INSERT INTO notifications (type, message, user_id, actor, is_read, from_admin)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    ['welcome', 'Welcome to CareerCraft AI!', userId, 'system', false, false]
  );
  return await api('GET', '/api/notifications/user', null, userToken);
});

// 14. Newsletter - Subscribe
await step('Newsletter: Subscribe', async () => {
  return await api('POST', '/api/newsletter/subscribe', {
    email: `newsletter_${Date.now()}@careercraft.test`
  });
});

// 15. Admin Operations - Login
const adminLogin = await step('Admin: Login', async () => {
  return await api('POST', '/api/auth/login', {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
  });
});

const adminToken = adminLogin?.token;

// 16. Admin Operations - Dashboard Stats
if (adminToken) {
  await step('Admin: Dashboard Stats', async () => {
    return await api('GET', '/api/admin/dashboard-stat', null, adminToken);
  });
}

// 17. Cleanup created test data
console.log('\n🧹 Cleaning up test data...');
try {
  if (userId) {
    await pool.query('DELETE FROM resumes WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM ats_scores WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM user_profiles WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }
  await pool.query('DELETE FROM email_verifications WHERE email = $1', [TEST_EMAIL]);
  await pool.query("DELETE FROM newsletters WHERE email LIKE '%@careercraft.test'");
  console.log('✅ Clean up completed successfully.');
} catch (cleanErr) {
  console.warn('⚠️ Cleanup warning:', cleanErr.message);
}

await pool.end();

console.log('\n================ TEST SUMMARY ================');
const passed = report.filter(r => r.status === 'PASSED').length;
const failed = report.filter(r => r.status === 'FAILED').length;
console.log(`Total Steps: ${report.length} | Passed: ${passed} | Failed: ${failed}`);
if (failed > 0) {
  console.log('Failures:', report.filter(r => r.status === 'FAILED'));
  process.exit(1);
} else {
  console.log('🎉 ALL DATABASE AND API OPERATIONS PASSED 100%!');
  process.exit(0);
}
