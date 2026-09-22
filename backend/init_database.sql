-- CareerCraft AI Resume Builder - Complete PostgreSQL Initialization Script
-- Run this in PostgreSQL (Supabase, Neon, AWS RDS, Local, etc.)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
  CREATE TYPE notification_actor AS ENUM ('user', 'admin', 'system');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE admin_req_status AS ENUM ('none', 'pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  plan TEXT NOT NULL DEFAULT 'Free',
  admin_request_status admin_req_status NOT NULL DEFAULT 'none',
  profile_views INTEGER NOT NULL DEFAULT 0,
  last_login TIMESTAMP WITHOUT TIME ZONE,
  full_name VARCHAR(255),
  plan_id INTEGER NOT NULL DEFAULT 1,
  phone VARCHAR(50),
  location VARCHAR(255),
  bio TEXT,
  github VARCHAR(255),
  linkedin VARCHAR(255),
  mongodb_id VARCHAR(24),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. App Users Table (compatibility view/table)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  admin_request_status VARCHAR(50) DEFAULT 'none',
  is_active BOOLEAN DEFAULT TRUE,
  plan VARCHAR(50) DEFAULT 'Free',
  last_login TIMESTAMP WITHOUT TIME ZONE,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(255),
  bio TEXT,
  github VARCHAR(255),
  linkedin VARCHAR(255),
  profile_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  github TEXT,
  linkedin TEXT,
  extra_links JSONB DEFAULT NULL
);

-- 4. Plans Table
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  plan_id BIGINT UNIQUE NOT NULL,
  name VARCHAR(100) UNIQUE NOT NULL,
  badge VARCHAR(100),
  price NUMERIC NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  description TEXT NOT NULL,
  features JSONB NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  title TEXT DEFAULT 'Untitled Resume',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ATS Results Table
CREATE TABLE IF NOT EXISTS ats_results (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  resume_id INTEGER,
  score INTEGER DEFAULT 0,
  feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ATS Scans Table
CREATE TABLE IF NOT EXISTS ats_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_profile_id UUID,
  overall_score INTEGER NOT NULL DEFAULT 0,
  job_title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID NOT NULL,
  actor notification_actor NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  from_admin BOOLEAN NOT NULL DEFAULT FALSE,
  mongodb_id VARCHAR(255),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Templates Table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  previewimage VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'approved',
  category VARCHAR(100) DEFAULT 'Modern',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Template Visibilities Table
CREATE TABLE IF NOT EXISTS template_visibilities (
  template_id VARCHAR(255) PRIMARY KEY,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  mongodb_id VARCHAR(24),
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  detail TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  date VARCHAR(100),
  image VARCHAR(255) NOT NULL,
  read_time VARCHAR(50),
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  mongodb_id VARCHAR(24),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  plan VARCHAR(50) NOT NULL,
  plan_id INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'active',
  start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  mongodb_id VARCHAR(24),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subscription_id INTEGER,
  amount NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'success',
  payment_method VARCHAR(50) DEFAULT 'Razorpay',
  transaction_id VARCHAR(255),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Downloads Table
CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  mongodb_id VARCHAR(24),
  user_id UUID,
  name VARCHAR NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'resume',
  action VARCHAR(50) DEFAULT 'download',
  format TEXT DEFAULT 'PDF',
  html TEXT,
  template VARCHAR(455),
  size VARCHAR(100),
  views INTEGER DEFAULT 0,
  download_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  page VARCHAR(255) NOT NULL,
  route VARCHAR(255) NOT NULL,
  user_id UUID,
  timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  mongodb_id VARCHAR(255)
);

-- 16. API Metrics Table
CREATE TABLE IF NOT EXISTS api_metrics (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER,
  user_id UUID,
  ip VARCHAR(45),
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_size INTEGER,
  response_size INTEGER,
  error_message TEXT,
  mongodb_id VARCHAR(255),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Email Verifications Table
CREATE TABLE IF NOT EXISTS email_verifications (
  email VARCHAR(255) PRIMARY KEY,
  token UUID NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Password Resets Table
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Plans
INSERT INTO plans (plan_id, name, badge, price, active, display_order, description, features, created_at, updated_at)
VALUES 
(1, 'Free', 'Starter', 0, true, 1, 'For testing & basic usage', '["1 Resume Template", "Limited AI Suggestions", "Watermark on Resume", "Community Support"]'::jsonb, NOW(), NOW()),
(2, 'Pro', 'Popular', 299, true, 2, 'Best for students & professionals', '["Unlimited Templates", "Full AI Resume Writing", "No Watermark", "PDF & DOCX Export", "Priority Support"]'::jsonb, NOW(), NOW()),
(3, 'Ultra Pro', 'Best Value', 999, true, 3, 'One-time payment with lifetime access', '["All Pro Features", "Lifetime Access", "Priority Support", "Future Updates"]'::jsonb, NOW(), NOW())
ON CONFLICT (plan_id) DO NOTHING;
