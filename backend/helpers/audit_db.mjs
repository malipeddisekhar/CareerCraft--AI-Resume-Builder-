import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRESQL_URI, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ DB CONNECTED');

    // List all tables
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('\n📦 TABLES FOUND:', tables.rows.length);
    tables.rows.forEach(t => console.log(' -', t.table_name));

    // Check required tables
    const required = [
      'users','email_verifications','password_resets','resumes',
      'templates','subscriptions','template_visibilities','notifications',
      'plans','user_profiles','ats_scans','downloads','blogs',
      'payments','page_views','api_metrics','app_users'
    ];
    console.log('\n🔍 REQUIRED TABLE CHECK:');
    const actualNames = tables.rows.map(r => r.table_name);
    required.forEach(t => {
      const exists = actualNames.includes(t);
      console.log(` ${exists ? '✅' : '❌'} ${t} — ${exists ? 'EXISTS' : 'MISSING'}`);
    });

    // Check users table columns
    const cols = await pool.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position"
    );
    console.log('\n👤 users TABLE COLUMNS:');
    cols.rows.forEach(c => console.log(` - ${c.column_name} (${c.data_type}) nullable:${c.is_nullable}`));

    // Check email_verifications columns
    const evCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='email_verifications'"
    );
    console.log('\n📧 email_verifications COLUMNS:');
    if (evCols.rows.length === 0) {
      console.log(' ❌ TABLE DOES NOT EXIST or has no columns');
    } else {
      evCols.rows.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));
    }

    // Check password_resets columns
    const prCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='password_resets'"
    );
    console.log('\n🔑 password_resets COLUMNS:');
    if (prCols.rows.length === 0) {
      console.log(' ❌ TABLE DOES NOT EXIST or has no columns');
    } else {
      prCols.rows.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));
    }

    // Check plans seed data
    const plans = await pool.query('SELECT id, name, price FROM plans ORDER BY id');
    console.log('\n📋 PLANS SEED DATA:', plans.rows.length, 'rows');
    plans.rows.forEach(p => console.log(` - [${p.id}] ${p.name} @ ₹${p.price}`));

    // Check enums
    const enums = await pool.query(
      "SELECT typname, array_agg(enumlabel ORDER BY enumsortorder) AS values FROM pg_type JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid GROUP BY typname"
    );
    console.log('\n🏷️ ENUMS:');
    enums.rows.forEach(e => console.log(` - ${e.typname}: [${e.values.join(', ')}]`));

    // Check foreign keys
    const fks = await pool.query(`
      SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name
    `);
    console.log('\n🔗 FOREIGN KEYS:');
    fks.rows.forEach(fk => console.log(` - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table}`));

    // Count records in key tables
    console.log('\n📊 RECORD COUNTS:');
    for (const t of ['users','resumes','templates','plans','email_verifications','password_resets','notifications']) {
      try {
        const r = await pool.query(`SELECT COUNT(*) FROM ${t}`);
        console.log(` - ${t}: ${r.rows[0].count} records`);
      } catch(e) {
        console.log(` - ${t}: ERROR (${e.message})`);
      }
    }

  } catch(e) {
    console.error('❌ ERROR:', e.message);
  } finally {
    await pool.end();
  }
}
run();
