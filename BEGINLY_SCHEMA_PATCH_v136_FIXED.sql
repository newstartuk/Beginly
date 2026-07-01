-- Beginly v1.3.6 Fixed Schema Patch
-- Self-contained: creates ALL missing tables before altering them
-- Run this ENTIRE script in Supabase SQL Editor

-- ============================================================
-- 1. Helper function
-- ============================================================
create or replace function public.beginly_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and coalesce(u.is_admin, false) = true
  );
$$;

-- ============================================================
-- 2. Notification centre tables (NEW)
-- ============================================================
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email_enabled boolean not null default false,
  in_app_enabled boolean not null default true,
  opportunity_enabled boolean not null default true,
  safety_enabled boolean not null default true,
  weekly_digest_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  category text not null default 'service',
  source text,
  status text not null default 'unread' check (status in ('unread','read','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.notification_delivery_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  notification_id uuid references public.user_notifications(id) on delete set null,
  channel text not null default 'in_app',
  status text not null default 'queued',
  provider_reference text,
  error_message text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. Safety cases (NEW)
-- ============================================================
create table if not exists public.safety_cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','triaging','escalated','resolved','archived')),
  source_type text,
  source_id uuid,
  assigned_to text,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. Opportunities (NEW - was missing!)
-- ============================================================
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null default 'general' check (type in ('pilot','job','volunteer','event','training','general')),
  status text not null default 'draft' check (status in ('draft','pilot','active','approved','published','archived','closed')),
  owner_id uuid references auth.users(id),
  location text,
  start_date date,
  end_date date,
  application_url text,
  contact_email text,
  updated_at timestamptz default now(),
  archived_at timestamptz,
  approved_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5. Partner leads (NEW or ALTER)
-- ============================================================
create table if not exists public.partner_leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  industry text,
  notes text,
  owner text,
  acknowledgement_sent_at timestamptz,
  conversion_stage text not null default 'lead',
  follow_up_notes text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 6. Referral disclosures (NEW or ALTER)
-- ============================================================
create table if not exists public.referral_disclosures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  referral_code text not null,
  disclosed_to text,
  disclosed_at timestamptz not null default now(),
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. Training modules (NEW)
-- ============================================================
create table if not exists public.training_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  module_type text not null default 'general' check (module_type in ('ambassador','safety','peer_guide','onboarding','general')),
  content text,
  required boolean not null default false,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 8. User milestones / badges (NEW)
-- ============================================================
create table if not exists public.user_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_key text not null,
  title text not null,
  earned_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, milestone_key)
);

-- ============================================================
-- 9. Scam reports (NEW)
-- ============================================================
create table if not exists public.scam_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  scam_type text not null default 'other' check (scam_type in ('phishing','rental','employment','romance','investment','identity','housing','other')),
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','investigating','resolved','dismissed')),
  evidence_urls jsonb,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 10. Content items + source register columns (if tables exist)
-- ============================================================
alter table if exists public.content_items add column if not exists canonical_path text;
alter table if exists public.content_items add column if not exists publication_notes text;
alter table if exists public.content_items add column if not exists source_status text not null default 'needs_review';
alter table if exists public.source_register add column if not exists source_owner text;

-- ============================================================
-- 11. RLS enablement on ALL new/modified tables
-- ============================================================
alter table public.notification_preferences enable row level security;
alter table public.user_notifications enable row level security;
alter table public.notification_delivery_log enable row level security;
alter table public.safety_cases enable row level security;
alter table if exists public.opportunities enable row level security;
alter table if exists public.referral_disclosures enable row level security;
alter table if exists public.partner_leads enable row level security;
alter table public.user_milestones enable row level security;
alter table if exists public.scam_reports enable row level security;

-- ============================================================
-- 12. RLS Policies
-- ============================================================

-- Notification preferences
drop policy if exists "Users manage own notification preferences" on public.notification_preferences;
create policy "Users manage own notification preferences" on public.notification_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- User notifications
drop policy if exists "Users read own notifications" on public.user_notifications;
create policy "Users read own notifications" on public.user_notifications for select using (auth.uid() = user_id or public.beginly_is_admin());
drop policy if exists "Users update own notifications" on public.user_notifications;
create policy "Users update own notifications" on public.user_notifications for update using (auth.uid() = user_id or public.beginly_is_admin()) with check (auth.uid() = user_id or public.beginly_is_admin());
drop policy if exists "Users create own notifications" on public.user_notifications;
create policy "Users create own notifications" on public.user_notifications for insert with check (auth.uid() = user_id or public.beginly_is_admin());

-- Delivery log (admin only)
drop policy if exists "Beginly admins manage notification delivery log" on public.notification_delivery_log;
create policy "Beginly admins manage notification delivery log" on public.notification_delivery_log for all using (public.beginly_is_admin()) with check (public.beginly_is_admin());

-- Safety cases (admin only)
drop policy if exists "Beginly admins manage safety cases" on public.safety_cases;
create policy "Beginly admins manage safety cases" on public.safety_cases for all using (public.beginly_is_admin()) with check (public.beginly_is_admin());

-- Opportunities
drop policy if exists "Beginly admins manage opportunities" on public.opportunities;
create policy "Beginly admins manage opportunities" on public.opportunities for all using (public.beginly_is_admin()) with check (public.beginly_is_admin());
drop policy if exists "Authenticated read published opportunities" on public.opportunities;
create policy "Authenticated read published opportunities" on public.opportunities for select using (auth.role() = 'authenticated' and status in ('pilot','active','approved','published'));

-- Referral disclosures (admin only)
drop policy if exists "Beginly admins manage referral disclosures" on public.referral_disclosures;
create policy "Beginly admins manage referral disclosures" on public.referral_disclosures for all using (public.beginly_is_admin()) with check (public.beginly_is_admin());

-- Partner leads
drop policy if exists "Beginly admins update partner CRM" on public.partner_leads;
create policy "Beginly admins update partner CRM" on public.partner_leads for update using (public.beginly_is_admin()) with check (public.beginly_is_admin());
drop policy if exists "Beginly admins read partner CRM" on public.partner_leads;
create policy "Beginly admins read partner CRM" on public.partner_leads for select using (public.beginly_is_admin());

-- User milestones
drop policy if exists "Users read own milestones" on public.user_milestones;
create policy "Users read own milestones" on public.user_milestones for select using (auth.uid() = user_id or public.beginly_is_admin());
drop policy if exists "Users insert own milestones" on public.user_milestones;
create policy "Users insert own milestones" on public.user_milestones for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own milestones" on public.user_milestones;
create policy "Users update own milestones" on public.user_milestones for update using (auth.uid() = user_id or public.beginly_is_admin()) with check (auth.uid() = user_id or public.beginly_is_admin());

-- Scam reports
drop policy if exists "Users own scam reports" on public.scam_reports;
create policy "Users own scam reports" on public.scam_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Admins manage scam reports" on public.scam_reports;
create policy "Admins manage scam reports" on public.scam_reports for all using (public.beginly_is_admin()) with check (public.beginly_is_admin());

-- ============================================================
-- 13. Seed training modules
-- ============================================================
insert into public.training_modules (title, module_type, content, required, status)
values
  ('Advice boundaries and official signposting', 'ambassador', 'Ambassadors and peer guides must not provide legal, immigration, financial, medical, tax or housing advice. They signpost official, university and trusted support routes.', true, 'published'),
  ('Safety escalation and emergency boundaries', 'safety', 'Immediate danger should be escalated to emergency services. Scam, housing and welfare concerns should be routed through admin review and appropriate official support.', true, 'published'),
  ('Community conduct and moderated cohorts', 'peer_guide', 'No open forum, direct messaging marketplace or unmoderated advice. Cohorts remain opt-in and manually reviewed during MVP.', true, 'published')
on conflict do nothing;

-- ============================================================
-- 14. Indexes
-- ============================================================
create index if not exists idx_user_notifications_user_status on public.user_notifications(user_id, status);
create index if not exists idx_notification_preferences_user_id on public.notification_preferences(user_id);
create index if not exists idx_safety_cases_status on public.safety_cases(status);
create index if not exists idx_safety_cases_source on public.safety_cases(source_type, source_id);
create index if not exists idx_partner_leads_owner_status on public.partner_leads(owner, status);
create index if not exists idx_opportunities_status on public.opportunities(status);
create index if not exists idx_user_milestones_user_id on public.user_milestones(user_id);
create index if not exists idx_scam_reports_status on public.scam_reports(status);
create index if not exists idx_scam_reports_user_id on public.scam_reports(user_id);
