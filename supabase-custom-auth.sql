-- Custom auth sessions table (bypasses Supabase Auth browser calls)
CREATE TABLE IF NOT EXISTS custom_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow users to manage their own sessions
ALTER TABLE custom_sessions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own sessions
CREATE POLICY "users_insert_sessions" ON custom_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own sessions
CREATE POLICY "users_read_sessions" ON custom_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "users_delete_sessions" ON custom_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Custom users table (stores bcrypt password hashes)
CREATE TABLE IF NOT EXISTS custom_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;

-- Anyone can create a custom_users entry (signup)
CREATE POLICY "anyone_insert_custom_users" ON custom_users
  FOR INSERT WITH CHECK (true);

-- Users can read their own custom_users entry
CREATE POLICY "users_read_custom_users" ON custom_users
  FOR SELECT USING (auth.uid() = user_id);

-- Cleanup expired sessions daily
DELETE FROM custom_sessions WHERE expires_at < NOW();
