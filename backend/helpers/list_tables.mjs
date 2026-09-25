import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../config/postgresdb.js';

try {
  const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log('Existing tables in DB:');
  console.log(res.rows.map(r => r.table_name).join(', '));
} catch (err) {
  console.error('Error listing tables:', err.message);
} finally {
  await pool.end();
}
