import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRESQL_URI, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    const vis = await pool.query('SELECT * FROM template_visibilities LIMIT 20');
    console.log('template_visibilities rows:', vis.rows.length);
    vis.rows.forEach(r => console.log(' -', r.template_id, '| is_active:', r.is_active));

    const tv = await pool.query('SELECT * FROM templates LIMIT 5');
    console.log('\ntemplates rows:', tv.rows.length);
  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    await pool.end();
  }
}
run();
