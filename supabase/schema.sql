-- Supabase SQL Schema — Beginly v1.2 stabilisation
-- Run this in Supabase Dashboard → SQL Editor.
-- Supabase Auth is the source of truth for passwords, sessions, and email confirmation.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users table: application profile linked to Supabase Auth ────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '[managed by Supabase Auth]',
  is_admin BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Arrival Profiles ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.arrival_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  arrival_type TEXT NOT NULL DEFAULT 'international_student',
  status TEXT NOT NULL DEFAULT 'not_arrived' CHECK (status IN ('not_arrived','arriving_soon','arrived')),
  arrival_date DATE,
  city TEXT,
  university TEXT,
  accommodation TEXT DEFAULT 'not_secured',
  nationality TEXT,
  english_level TEXT,
  work_interest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate older draft schema if work_interest was created as TEXT.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'arrival_profiles'
      AND column_name = 'work_interest'
      AND data_type <> 'boolean'
  ) THEN
    ALTER TABLE public.arrival_profiles
      ALTER COLUMN work_interest TYPE BOOLEAN
      USING CASE
        WHEN LOWER(COALESCE(work_interest::text, 'false')) IN ('true','yes','1','t') THEN TRUE
        ELSE FALSE
      END;
  END IF;
END $$;

-- ─── User Tasks ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','complete')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Migrate older draft default/status values.
UPDATE public.user_tasks SET status = 'not_started' WHERE status = 'pending';
ALTER TABLE public.user_tasks ALTER COLUMN status SET DEFAULT 'not_started';

-- ─── Reminder Preferences ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reminder_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_reminders BOOLEAN DEFAULT FALSE,
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily','weekly','biweekly','monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Support Tickets ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('account','checklist','document','housing','partner','scam','other')),
  description TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_arrival_profiles_user_id ON public.arrival_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON public.user_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_reminder_prefs_user_id ON public.reminder_prefs(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- ─── Updated_at trigger helper ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_arrival_profiles_updated_at ON public.arrival_profiles;
CREATE TRIGGER update_arrival_profiles_updated_at BEFORE UPDATE ON public.arrival_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_user_tasks_updated_at ON public.user_tasks;
CREATE TRIGGER update_user_tasks_updated_at BEFORE UPDATE ON public.user_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_reminder_prefs_updated_at ON public.reminder_prefs;
CREATE TRIGGER update_reminder_prefs_updated_at BEFORE UPDATE ON public.reminder_prefs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arrival_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users: authenticated users can manage their own application profile row.
DROP POLICY IF EXISTS "Users insert own row" ON public.users;
CREATE POLICY "Users insert own row" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users read own row" ON public.users;
CREATE POLICY "Users read own row" ON public.users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users update own row" ON public.users;
CREATE POLICY "Users update own row" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users delete own row" ON public.users;
CREATE POLICY "Users delete own row" ON public.users FOR DELETE USING (auth.uid() = id);

-- Arrival profiles.
DROP POLICY IF EXISTS "Profiles read own" ON public.arrival_profiles;
CREATE POLICY "Profiles read own" ON public.arrival_profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Profiles insert own" ON public.arrival_profiles;
CREATE POLICY "Profiles insert own" ON public.arrival_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Profiles update own" ON public.arrival_profiles;
CREATE POLICY "Profiles update own" ON public.arrival_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Profiles delete own" ON public.arrival_profiles;
CREATE POLICY "Profiles delete own" ON public.arrival_profiles FOR DELETE USING (auth.uid() = user_id);

-- User tasks.
DROP POLICY IF EXISTS "Tasks read own" ON public.user_tasks;
CREATE POLICY "Tasks read own" ON public.user_tasks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Tasks insert own" ON public.user_tasks;
CREATE POLICY "Tasks insert own" ON public.user_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Tasks update own" ON public.user_tasks;
CREATE POLICY "Tasks update own" ON public.user_tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Tasks delete own" ON public.user_tasks;
CREATE POLICY "Tasks delete own" ON public.user_tasks FOR DELETE USING (auth.uid() = user_id);

-- Reminder preferences.
DROP POLICY IF EXISTS "Reminders read own" ON public.reminder_prefs;
CREATE POLICY "Reminders read own" ON public.reminder_prefs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Reminders insert own" ON public.reminder_prefs;
CREATE POLICY "Reminders insert own" ON public.reminder_prefs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Reminders update own" ON public.reminder_prefs;
CREATE POLICY "Reminders update own" ON public.reminder_prefs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Reminders delete own" ON public.reminder_prefs;
CREATE POLICY "Reminders delete own" ON public.reminder_prefs FOR DELETE USING (auth.uid() = user_id);

-- Support tickets.
DROP POLICY IF EXISTS "Support tickets insert own" ON public.support_tickets;
CREATE POLICY "Support tickets insert own" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Support tickets read own" ON public.support_tickets;
CREATE POLICY "Support tickets read own" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Support tickets update own" ON public.support_tickets;
CREATE POLICY "Support tickets update own" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Support tickets delete own" ON public.support_tickets;
CREATE POLICY "Support tickets delete own" ON public.support_tickets FOR DELETE USING (auth.uid() = user_id);
