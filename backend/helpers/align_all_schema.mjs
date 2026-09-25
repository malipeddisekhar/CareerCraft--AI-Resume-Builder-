import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../config/postgresdb.js';

const statements = [
  // ats_scores table alignments
  `ALTER TABLE ats_scores ADD COLUMN IF NOT EXISTS cv_id INTEGER`,
  `ALTER TABLE ats_scores ADD COLUMN IF NOT EXISTS template_id VARCHAR(255)`,
  `ALTER TABLE ats_scores ADD COLUMN IF NOT EXISTS job_title VARCHAR(255)`,

  // downloads table alignments
  `ALTER TABLE downloads ADD COLUMN IF NOT EXISTS template_id VARCHAR(255)`,
  `ALTER TABLE downloads ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 1`,
  `ALTER TABLE downloads ADD COLUMN IF NOT EXISTS last_downloaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()`,

  // user_profiles table alignments
  `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()`,
  `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()`,

  // blogs table alignments
  `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published'`,

  // Sync existing data where cv_id is null but resume_id is not null
  `UPDATE ats_scores SET cv_id = resume_id WHERE cv_id IS NULL AND resume_id IS NOT NULL`,
];

console.log('🚀 Running schema alignment migration...');
for (const sql of statements) {
  try {
    await pool.query(sql);
    console.log('✅ Applied:', sql.substring(0, 70));
  } catch (err) {
    console.error('❌ Failed:', sql.substring(0, 70), '-->', err.message);
  }
}

await pool.end();
console.log('🏁 Schema alignment complete.');
