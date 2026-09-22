import dotenv from 'dotenv';
import { pool } from '../config/postgresdb.js';

dotenv.config();

async function checkDatabase() {
  try {
    const conn = await pool.query("SELECT current_database(), current_user, version()");
    console.log("✅ PostgreSQL Connection: SUCCESSFUL");
    console.log(`   Database: ${conn.rows[0].current_database}`);
    console.log(`   User: ${conn.rows[0].current_user}`);

    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(`\n📊 Total Tables Created: ${tables.rows.length}`);
    tables.rows.forEach((t, i) => console.log(`   ${i + 1}. ${t.table_name}`));

    const users = await pool.query("SELECT id, username, email, is_admin, plan FROM users");
    console.log(`\n👤 Users (${users.rows.length}):`);
    users.rows.forEach(u => console.log(`   - ${u.username} (${u.email}) [Admin: ${u.is_admin}, Plan: ${u.plan}]`));

    const plans = await pool.query("SELECT name, price, badge FROM plans");
    console.log(`\n💳 Subscription Plans (${plans.rows.length}):`);
    plans.rows.forEach(p => console.log(`   - ${p.name}: ₹${p.price} (${p.badge})`));

    const templates = await pool.query("SELECT count(1) as count FROM template_visibilities");
    console.log(`\n🎨 Active Templates in DB: ${templates.rows[0].count}`);

    console.log("\n🚀 Database is 100% healthy and ready for CareerCraft AI!");
  } catch (err) {
    console.error("❌ Connection Failed:", err.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();

