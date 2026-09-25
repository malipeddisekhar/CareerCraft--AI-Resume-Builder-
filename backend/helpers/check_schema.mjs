import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.POSTGRESQL_URI, ssl: { rejectUnauthorized: false } });

const tables = ['user_profiles', 'users', 'subscriptions', 'notifications', 'resumes', 'plans', 'downloads', 'ats_scores'];
for (const t of tables) {
  try {
    const r = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}' ORDER BY ordinal_position`);
    console.log(t + ':\n  ' + r.rows.map(x => x.column_name + ' (' + x.data_type + ')').join('\n  '));
  } catch(e) {
    console.log(t + ': ERROR - ' + e.message.substring(0, 100));
  }
}

const allTables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
console.log('\nAll tables in DB: ' + allTables.rows.map(x => x.table_name).join(', '));

await pool.end();
