import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from '../config/postgresdb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log("🚀 Initializing CareerCraft AI Database...");

  if (!process.env.POSTGRESQL_URI) {
    console.error("❌ ERROR: POSTGRESQL_URI is missing in backend/.env!");
    console.error("Please add your PostgreSQL connection string to backend/.env and rerun.");
    process.exit(1);
  }

  try {
    // 1. Test Connection
    console.log("📡 Connecting to PostgreSQL database...");
    const connCheck = await pool.query("SELECT current_database(), current_user, version()");
    console.log(`✅ Connected to database: ${connCheck.rows[0].current_database} as ${connCheck.rows[0].current_user}`);

    // 2. Read and run init_database.sql
    const sqlPath = path.resolve(__dirname, '../init_database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("📦 Creating all tables, enums, and extensions...");
    await pool.query(sql);
    console.log("✅ All 18 database tables and default plans created successfully!");

    // 3. Create or Seed Admin Account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@careercraft.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'CareerCraft@2026';

    const existingAdmin = await pool.query("SELECT id FROM users WHERE email = $1", [adminEmail]);
    if (existingAdmin.rows.length === 0) {
      console.log(`👤 Creating default admin account: ${adminEmail}`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(`
        INSERT INTO users (username, email, password, is_admin, is_active, plan, admin_request_status, created_at, updated_at)
        VALUES ($1, $2, $3, true, true, 'Ultra Pro', 'approved', NOW(), NOW())
      `, ['Admin', adminEmail, hashedPassword]);
      console.log(`✅ Admin account created with password: ${adminPassword}`);
    } else {
      console.log(`ℹ️  Admin account already exists: ${adminEmail}`);
    }

    // 4. Initialize Template Visibilities
    console.log("🎨 Initializing template visibility...");
    for (let i = 1; i <= 10; i++) {
      await pool.query(`
        INSERT INTO template_visibilities (template_id, is_active, created_at, updated_at)
        VALUES ($1, true, NOW(), NOW())
        ON CONFLICT (template_id) DO NOTHING
      `, [`JessicaClaire${i === 1 ? '' : i - 1}`]);
    }

    console.log("\n=======================================================");
    console.log("🎉 DATABASE SETUP COMPLETE & READY FOR PRODUCTION USE!");
    console.log("=======================================================\n");

  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    if (error.message.includes("not found") || error.message.includes("ENOTFOUND")) {
      console.error("\n💡 HINT: The PostgreSQL database host or tenant in your connection string was not found.");
      console.error("Please make sure your POSTGRESQL_URI in backend/.env points to an active database.");
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
