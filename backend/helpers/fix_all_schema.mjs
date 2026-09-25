/**
 * Fix all database issues:
 * 1. Fix resumes.user_id type (varchar → uuid)
 * 2. Create ats_scores table  
 * 3. Create ats_scans if missing (used for ATS checker)
 * 4. Ensure all missing columns exist
 */
import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.POSTGRESQL_URI, ssl: { rejectUnauthorized: false } });

const fixes = [
  // Fix resumes.user_id type mismatch (varchar -> uuid)
  `ALTER TABLE resumes ALTER COLUMN user_id TYPE uuid USING user_id::uuid`,

  // Create ats_scores table if it doesn't exist
  `CREATE TABLE IF NOT EXISTS ats_scores (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id INTEGER,
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    feedback JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,

  // Fix downloads.user_id type too if needed
  `DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='downloads' AND column_name='user_id' AND data_type='uuid'
    ) THEN
      -- already uuid, no action
      NULL;
    ELSE
      ALTER TABLE downloads ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    END IF;
  END $$`,

  // Ensure notifications has all required columns
  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_admin BOOLEAN DEFAULT false`,

  // Ensure users has all required columns (some might be missing in app-specific schema)
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_request_status TEXT DEFAULT 'none'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITHOUT TIME ZONE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id INTEGER DEFAULT 1`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()`,

  // Ensure user_profiles has extra_links
  `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS extra_links JSONB DEFAULT '[]'`,
];

for (const sql of fixes) {
  try {
    await pool.query(sql);
    console.log('✅ OK:', sql.substring(0, 60).replace(/\n/g, ' '));
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('duplicate')) {
      console.log('⏭️  SKIP (already exists):', sql.substring(0, 60).replace(/\n/g, ' '));
    } else {
      console.log('❌ FAILED:', e.message.substring(0, 120), '\n   SQL:', sql.substring(0, 60).replace(/\n/g, ' '));
    }
  }
}

// Verify critical things
const checks = [
  { label: 'resumes.user_id type', sql: `SELECT data_type FROM information_schema.columns WHERE table_name='resumes' AND column_name='user_id'` },
  { label: 'ats_scores exists', sql: `SELECT count(*) FROM ats_scores` },
  { label: 'users has username', sql: `SELECT username FROM users LIMIT 1` },
  { label: 'user_profiles has extra_links', sql: `SELECT extra_links FROM user_profiles LIMIT 1` },
];
console.log('\n--- Verification ---');
for (const c of checks) {
  try {
    const r = await pool.query(c.sql);
    console.log(`✅ ${c.label}:`, JSON.stringify(r.rows[0]));
  } catch (e) {
    console.log(`❌ ${c.label}:`, e.message.substring(0, 80));
  }
}

await pool.end();
console.log('\nDone!');
