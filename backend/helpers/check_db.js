import pkg from 'pg';
const { Client } = pkg;

import dotenv from 'dotenv';
dotenv.config();

async function checkUser() {
  const client = new Client({
    connectionString: process.env.POSTGRESQL_URI,
  });

  try {
    await client.connect();

    const res = await client.query(`
      SELECT * FROM user_profiles WHERE user_id = '26b471bc-0eae-4641-8767-d13c0f6194e3';
    `);

    console.log("User Profile in Postgres:");
    console.log(res.rows[0]);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkUser();
