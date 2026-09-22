import dotenv from 'dotenv';
import { pool } from '../config/postgresdb.js';
dotenv.config();

async function migrate() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id INTEGER DEFAULT 1');
    console.log('OK: users.plan_id added');

    const updateSql = `
      UPDATE users
      SET plan_id = CASE
        WHEN plan = 'Free' THEN 1
        WHEN plan = 'Pro' THEN 2
        WHEN plan = 'Ultra Pro' THEN 3
        ELSE 1
      END
    `;
    await pool.query(updateSql);
    console.log('OK: users.plan_id synced from plan text');

    await pool.query('ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id INTEGER DEFAULT 1');
    console.log('OK: subscriptions.plan_id added');

    console.log('All migrations applied successfully!');
  } catch(e) {
    console.error('Failed:', e.message);
  } finally {
    await pool.end();
  }
}
migrate();
