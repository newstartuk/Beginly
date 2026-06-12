-- Supabase SQL Schema — Beginly
-- Run this in Supabase Dashboard → SQL Editor
-- IMPORTANT: Replace YOUR_SUPABASE_SERVICE_ROLE_KEY with your actual service role key
-- that matches the JWT_SECRET you use in your app's environment variables.

-- ─── Enable extensions ──────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Arrival Profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS arrival_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  arrival_type TEXT NOT NULL,
  status TEXT NOT NULL,
  arrival_date DATE,
  city TEXT,
  university TEXT,
  accommodation TEXT,
  nationality TEXT,
  english_level TEXT,
  work_interest TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User Tasks (progress) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- ─── Reminder Preferences ──────────────────────────────────
CREATE TABLE IF NOT EXISTS reminder_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_reminders BOOLEAN DEFAULT FALSE,
  frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes for performance ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_arrival_profiles_user_id ON arrival_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_reminder_prefs_user_id ON reminder_prefs(user_id);

-- ─── Updated_at trigger helper function ─────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_arrival_profiles_updated_at ON arrival_profiles;
CREATE TRIGGER update_arrival_profiles_updated_at BEFORE UPDATE ON arrival_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_user_tasks_updated_at ON user_tasks;
CREATE TRIGGER update_user_tasks_updated_at BEFORE UPDATE ON user_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_reminder_prefs_updated_at ON reminder_prefs;
CREATE TRIGGER update_reminder_prefs_updated_at BEFORE UPDATE ON reminder_prefs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security (RLS) — strict per-user isolation ──────
-- These policies ensure each user can only read/write their OWN data.
-- The app's service_role key bypasses RLS entirely (used by API routes only).

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrival_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_prefs ENABLE ROW LEVEL SECURITY;

-- USERS: anyone can INSERT (sign up). Users read/update ONLY their own row.
DROP POLICY IF EXISTS "Allow signup" ON users;
CREATE POLICY "Allow signup" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users read own data" ON users;
CREATE POLICY "Users read own data" ON users FOR SELECT USING (
  auth.uid() = id
);

DROP POLICY IF EXISTS "Users update own data" ON users;
CREATE POLICY "Users update own data" ON users FOR UPDATE USING (
  auth.uid() = id
);

-- ARRIVAL PROFILES: user can only access their own profile
DROP POLICY IF EXISTS "Profiles read own" ON arrival_profiles;
CREATE POLICY "Profiles read own" ON arrival_profiles FOR SELECT USING (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Profiles insert own" ON arrival_profiles;
CREATE POLICY "Profiles insert own" ON arrival_profiles FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Profiles update own" ON arrival_profiles;
CREATE POLICY "Profiles update own" ON arrival_profiles FOR UPDATE USING (
  auth.uid() = user_id
);

-- USER TASKS: user can only access their own tasks
DROP POLICY IF EXISTS "Tasks read own" ON user_tasks;
CREATE POLICY "Tasks read own" ON user_tasks FOR SELECT USING (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Tasks insert own" ON user_tasks;
CREATE POLICY "Tasks insert own" ON user_tasks FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Tasks update own" ON user_tasks;
CREATE POLICY "Tasks update own" ON user_tasks FOR UPDATE USING (
  auth.uid() = user_id
);

-- REMINDER PREFS: user can only access their own prefs
DROP POLICY IF EXISTS "Reminders read own" ON reminder_prefs;
CREATE POLICY "Reminders read own" ON reminder_prefs FOR SELECT USING (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Reminders insert own" ON reminder_prefs;
CREATE POLICY "Reminders insert own" ON reminder_prefs FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Reminders update own" ON reminder_prefs;
CREATE POLICY "Reminders update own" ON reminder_prefs FOR UPDATE USING (
  auth.uid() = user_id
);
