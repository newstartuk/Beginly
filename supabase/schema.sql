# Supabase SQL Schema — Beginly
# Run this in Supabase Dashboard → SQL Editor

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
  arrival_type TEXT NOT NULL,           -- student | worker | family | refugee
  status TEXT NOT NULL,                 -- pre_arrival | arrived
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
  task_id TEXT NOT NULL,                -- references seed-data.ts task IDs
  status TEXT NOT NULL DEFAULT 'pending', -- pending | in_progress | complete | skipped
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
  frequency TEXT DEFAULT 'weekly',       -- daily | weekly | biweekly | monthly
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

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_arrival_profiles_updated_at ON arrival_profiles;
CREATE TRIGGER update_arrival_profiles_updated_at BEFORE UPDATE ON arrival_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_user_tasks_updated_at ON user_tasks;
CREATE TRIGGER update_user_tasks_updated_at BEFORE UPDATE ON user_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_reminder_prefs_updated_at ON reminder_prefs;
CREATE TRIGGER update_reminder_prefs_updated_at BEFORE UPDATE ON reminder_prefs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) — enable on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrival_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_prefs ENABLE ROW LEVEL SECURITY;

-- RLS policies — anon can sign up; service_role has full access
CREATE POLICY "Allow signup" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own data" ON users FOR SELECT USING (
  auth.uid() = id OR true -- MVP: allow reads via API key for now
);
CREATE POLICY "Users update own data" ON users FOR UPDATE USING (auth.uid() = id OR true);

CREATE POLICY "Profiles insert own" ON arrival_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles read own" ON arrival_profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update own" ON arrival_profiles FOR UPDATE USING (true);

CREATE POLICY "Tasks insert own" ON user_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Tasks read own" ON user_tasks FOR SELECT USING (true);
CREATE POLICY "Tasks update own" ON user_tasks FOR UPDATE USING (true);

CREATE POLICY "Reminders insert own" ON reminder_prefs FOR INSERT WITH CHECK (true);
CREATE POLICY "Reminders read own" ON reminder_prefs FOR SELECT USING (true);
CREATE POLICY "Reminders update own" ON reminder_prefs FOR UPDATE USING (true);
