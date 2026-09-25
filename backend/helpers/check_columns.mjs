import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../config/postgresdb.js';

const tables = ['ats_scores', 'resumes', 'downloads', 'notifications', 'users', 'user_profiles'];

for (const table of tables) {
  const res = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
    [table]
  );
  console.log(`\n📋 Columns for table '${table}':`);
  console.log(res.rows.map(r => `  - ${r.column_name} (${r.data_type})`).join('\n'));
}

await pool.end();
