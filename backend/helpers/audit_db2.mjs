import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRESQL_URI, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    // Foreign keys
    const fks = await pool.query(`
      SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public'
      ORDER BY tc.table_name
    `);
    console.log('FOREIGN KEYS (' + fks.rows.length + '):');
    fks.rows.forEach(fk => console.log(' -', fk.table_name + '.' + fk.column_name, '->', fk.foreign_table));

    // Enums
    const enums = await pool.query(
      "SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY t.typname, e.enumsortorder"
    );
    console.log('\nENUMS:');
    const grouped = {};
    enums.rows.forEach(r => {
      if (!grouped[r.typname]) grouped[r.typname] = [];
      grouped[r.typname].push(r.enumlabel);
    });
    Object.entries(grouped).forEach(([name, vals]) => console.log(' -', name + ':', vals.join(', ')));

    // Record counts
    console.log('\nRECORD COUNTS:');
    for (const t of ['users','resumes','templates','plans','email_verifications','password_resets','notifications','blogs','subscriptions','downloads']) {
      try {
        const r = await pool.query('SELECT COUNT(*) FROM ' + t);
        console.log(' -', t + ':', r.rows[0].count, 'records');
      } catch(e) {
        console.log(' -', t + ': ERROR (' + e.message + ')');
      }
    }

    // Admin user check
    console.log('\nADMIN USER CHECK:');
    const admin = await pool.query('SELECT id, username, email, is_admin, is_active FROM users WHERE is_admin = true LIMIT 5');
    console.log(' Admin accounts:', admin.rows.length);
    admin.rows.forEach(u => console.log('  -', u.username, '|', u.email, '| is_active:', u.is_active));

    // plans table column check
    console.log('\nPLANS TABLE COLUMNS:');
    const planCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='plans'");
    planCols.rows.forEach(c => console.log(' -', c.column_name, '(' + c.data_type + ')'));

    // resumes table columns
    console.log('\nRESUMES TABLE COLUMNS:');
    const resCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='resumes'");
    resCols.rows.forEach(c => console.log(' -', c.column_name, '(' + c.data_type + ')'));

  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    await pool.end();
  }
}
run();
