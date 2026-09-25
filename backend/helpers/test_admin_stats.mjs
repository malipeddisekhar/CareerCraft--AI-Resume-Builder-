import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../config/postgresdb.js';

try {
  console.log('Testing queries sequentially and concurrently...');
  const start = Date.now();
  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  
  const lastSixMonths = new Date();
  lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);
  lastSixMonths.setDate(1);
  lastSixMonths.setHours(0, 0, 0, 0);

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  console.log('Running Promise.all queries...');
  const [
    usersStats,
    resumesStats,
    subsStats,
    revenueStats,
    chartsStats
  ] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*)::bigint AS total_users,
        COUNT(*) FILTER (WHERE created_at < $1)::bigint AS last_month_users,
        COUNT(*) FILTER (WHERE plan = 'Free' AND is_active = true AND is_admin = false)::bigint AS free_users,
        (SELECT name FROM plans WHERE plan_id = 1 LIMIT 1) AS free_plan_name
      FROM users
    `, [lastMonthStart]),

    pool.query(`
      SELECT
        COUNT(*)::bigint AS total_resumes,
        COUNT(*) FILTER (WHERE created_at < $1)::bigint AS last_month_resumes
      FROM resumes
    `, [lastMonthStart]),

    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') AS total_active,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND created_at < $1) AS last_month_active,
        json_agg(json_build_object('plan', plan_name, 'count', count)) AS plans
      FROM (
        SELECT p.name AS plan_name, COUNT(*)::int AS count
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.plan_id
        WHERE s.status = 'active'
        GROUP BY p.name
      ) t
    `, [lastMonthStart]),

    pool.query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE status = 'success'), 0) AS total_revenue,
        COALESCE(SUM(amount) FILTER (WHERE status = 'success' AND created_at < $1), 0) AS last_month_revenue
      FROM payments
    `, [lastMonthStart]),

    pool.query(`
      SELECT
        (
          SELECT json_agg(row_to_json(r))
          FROM (
            SELECT EXTRACT(YEAR FROM created_at)::int AS year,
                   EXTRACT(MONTH FROM created_at)::int AS month,
                   COUNT(*)::int AS total
            FROM resumes
            WHERE created_at >= $1
            GROUP BY 1, 2
          ) r
        ) AS resume_graph,

        (
          SELECT json_agg(row_to_json(u))
          FROM (
            SELECT EXTRACT(YEAR FROM created_at)::int AS year,
                   EXTRACT(MONTH FROM created_at)::int AS month,
                   COUNT(*)::int AS total
            FROM users
            WHERE created_at >= $1
            GROUP BY 1, 2
          ) u
        ) AS user_growth,

        (
          SELECT json_agg(row_to_json(d))
          FROM (
            SELECT TO_CHAR(last_login::date, 'YYYY-MM-DD') AS day,
                   COUNT(*)::int AS users
            FROM users
            WHERE last_login >= $2
            GROUP BY 1
            ORDER BY 1
          ) d
        ) AS daily_active,

        (
          SELECT json_agg(row_to_json(a))
          FROM (
            SELECT CASE WHEN status_code < 400 THEN 'success' ELSE 'failure' END AS metric,
                   COUNT(*)::int AS count
            FROM api_metrics
            WHERE created_at >= $3
            GROUP BY 1
          ) a
        ) AS api_stats
    `, [lastSixMonths, last7Days, last30Days])
  ]);

  console.log('✅ Successfully completed queries in', Date.now() - start, 'ms');
  console.log('Users:', usersStats.rows[0]);
  console.log('Resumes:', resumesStats.rows[0]);
  console.log('Subs:', subsStats.rows[0]);
  console.log('Revenue:', revenueStats.rows[0]);
  console.log('Charts:', chartsStats.rows[0]);

} catch (err) {
  console.error('❌ Error during queries:', err);
} finally {
  await pool.end();
}
