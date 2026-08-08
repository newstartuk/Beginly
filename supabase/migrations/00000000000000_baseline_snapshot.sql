-- Beginly production schema snapshot
-- Generated from a live introspection of the Supabase project (information_schema, pg_catalog, pg_policies)
-- This is a baseline capture, not a forward migration -- it documents what already exists in production.
-- NOTE: RLS policies below reference custom functions (beginly_is_admin, beginly_household_is_primary,
-- beginly_household_is_member) whose definitions were not captured by this introspection pass and
-- must be added separately before this file can be replayed against a fresh database.

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.app_release_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  channel text NOT NULL DEFAULT 'production'::text,
  minimum_version text NOT NULL,
  recommended_version text NOT NULL,
  force_update boolean NOT NULL DEFAULT false,
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message text,
  download_url text,
  effective_at timestamp with time zone NOT NULL DEFAULT now(),
  retired_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.arrival_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  arrival_type text NOT NULL,
  status text NOT NULL,
  arrival_date date,
  city text,
  university text,
  accommodation text,
  nationality text,
  english_level text,
  work_interest boolean,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.audit_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  actor_type text NOT NULL DEFAULT 'user'::text,
  action text NOT NULL,
  target_type text,
  target_id text,
  before_state jsonb,
  after_state jsonb,
  request_id text,
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.billing_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  external_event_id text,
  idempotency_key text NOT NULL,
  actor_id text NOT NULL,
  event_type text NOT NULL,
  product_id text NOT NULL,
  amount_minor integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GBP'::text,
  payload jsonb,
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.browser_return_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  action_session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  return_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.budget_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Other'::text,
  type text NOT NULL DEFAULT 'expense'::text,
  color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.checkout_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  product_id text NOT NULL,
  provider text NOT NULL DEFAULT 'stripe'::text,
  provider_session_id text,
  state text NOT NULL DEFAULT 'created'::text,
  checkout_url text,
  idempotency_key text NOT NULL,
  amount_minor integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GBP'::text,
  billing_interval text NOT NULL DEFAULT 'one_off'::text,
  expires_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.commission_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL,
  conversion_event_id uuid NOT NULL,
  attribution_id uuid,
  event_type text NOT NULL,
  amount_minor integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GBP'::text,
  idempotency_key text NOT NULL,
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.commission_reconciliation_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  confirmed_minor integer NOT NULL DEFAULT 0,
  reversed_minor integer NOT NULL DEFAULT 0,
  paid_minor integer NOT NULL DEFAULT 0,
  payable_minor integer NOT NULL DEFAULT 0,
  discrepancy_minor integer NOT NULL DEFAULT 0,
  state text NOT NULL DEFAULT 'complete'::text,
  evidence jsonb,
  approved_by uuid,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.consent_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  purpose_code text NOT NULL,
  policy_version text NOT NULL,
  state text NOT NULL,
  evidence jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.conversion_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_session_id uuid,
  claimed_outcome text NOT NULL DEFAULT 'application_submitted'::text,
  state text NOT NULL DEFAULT 'user_claimed'::text,
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  evidence jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.conversion_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL,
  external_event_id text NOT NULL,
  subject_hash text NOT NULL,
  event_type text NOT NULL,
  value_minor integer NOT NULL DEFAULT 0,
  signature_verified boolean NOT NULL DEFAULT false,
  occurred_at timestamp with time zone NOT NULL,
  idempotency_key text NOT NULL,
  payload jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.custom_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.custom_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.data_deletion_tombstones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_reference uuid NOT NULL,
  subject_hash text NOT NULL,
  retained_financial_reference uuid NOT NULL,
  evidence jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.data_rights_exports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  user_id uuid NOT NULL,
  storage_bucket text NOT NULL,
  storage_path text NOT NULL,
  content_hash text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.data_rights_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_type text NOT NULL,
  state text NOT NULL DEFAULT 'received'::text,
  scope jsonb,
  evidence jsonb,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.destination_health_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  outbound_policy_id uuid,
  hostname text NOT NULL,
  check_type text NOT NULL DEFAULT 'reachability'::text,
  status text NOT NULL DEFAULT 'ok'::text,
  detail jsonb,
  checked_by uuid,
  checked_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.device_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL,
  token_hash text NOT NULL,
  provider_token_ciphertext text,
  token_version text NOT NULL DEFAULT 'v1'::text,
  state text NOT NULL DEFAULT 'active'::text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_seen_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.entitlements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  member_id uuid,
  source text NOT NULL,
  scope text NOT NULL,
  product_id text,
  capability_code text,
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  ends_at timestamp with time zone,
  autonomy_level smallint,
  quota numeric,
  used numeric NOT NULL DEFAULT 0,
  conditions jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  household_id uuid,
  label text NOT NULL,
  horizon text NOT NULL DEFAULT 'now'::text,
  target_date date,
  status text NOT NULL DEFAULT 'active'::text,
  priority integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.household_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL,
  invited_by uuid NOT NULL,
  invited_email text NOT NULL,
  display_name text,
  role text NOT NULL DEFAULT 'adult_dependant'::text,
  route_code text,
  token_hash text NOT NULL,
  state text NOT NULL DEFAULT 'pending'::text,
  expires_at timestamp with time zone NOT NULL,
  responded_at timestamp with time zone,
  idempotency_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.household_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL,
  user_id uuid,
  display_name text NOT NULL DEFAULT 'Household member'::text,
  role text NOT NULL DEFAULT 'adult_dependant'::text,
  age_band text NOT NULL DEFAULT 'adult'::text,
  route text,
  private_workspace boolean NOT NULL DEFAULT true,
  invitation_status text NOT NULL DEFAULT 'not_required'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  invited_email text
);

CREATE TABLE public.households (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  severity text NOT NULL,
  category text NOT NULL DEFAULT 'platform'::text,
  title text NOT NULL,
  state text NOT NULL DEFAULT 'open'::text,
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  owner_user_id uuid,
  evidence jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.job_outbox (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  queue text NOT NULL,
  job_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  state text NOT NULL DEFAULT 'queued'::text,
  idempotency_key text NOT NULL,
  run_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.journey_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.life_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  household_id uuid,
  event_type text NOT NULL,
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  facts jsonb,
  provenance jsonb,
  idempotency_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.migration_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  household_id uuid,
  current_route text NOT NULL,
  current_stage text NOT NULL DEFAULT 'settling'::text,
  city text,
  route_extension jsonb,
  effective_to timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.nia_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  policy_version text NOT NULL DEFAULT ''::text,
  status text NOT NULL DEFAULT 'open'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.nia_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  role text NOT NULL,
  redacted_content text NOT NULL DEFAULT ''::text,
  source_ids text[] NOT NULL DEFAULT '{}'::text[],
  reason_codes text[] NOT NULL DEFAULT '{}'::text[],
  confidence numeric,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.nia_tool_proposals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  tool_code text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_class text NOT NULL DEFAULT 'low'::text,
  approval_state text NOT NULL DEFAULT 'proposed'::text,
  idempotency_key text NOT NULL,
  approved_by uuid,
  executed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.notification_delivery_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  notification_id uuid,
  channel text NOT NULL DEFAULT 'in_app'::text,
  status text NOT NULL DEFAULT 'queued'::text,
  provider_reference text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.notification_outbox (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'in_app'::text,
  template_code text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  state text NOT NULL DEFAULT 'queued'::text,
  idempotency_key text,
  scheduled_at timestamp with time zone,
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  archived_at timestamp with time zone,
  action_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_enabled boolean NOT NULL DEFAULT false,
  in_app_enabled boolean NOT NULL DEFAULT true,
  opportunity_enabled boolean NOT NULL DEFAULT true,
  safety_enabled boolean NOT NULL DEFAULT true,
  weekly_digest_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.onboarding_states (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  current_step integer NOT NULL DEFAULT 1,
  route_code text,
  city text,
  primary_goal text,
  personalisation_consent boolean NOT NULL DEFAULT false,
  state text NOT NULL DEFAULT 'draft'::text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.operational_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  work_type text NOT NULL,
  work_id text NOT NULL,
  assigned_to uuid,
  assigned_by uuid,
  priority text NOT NULL DEFAULT 'normal'::text,
  due_at timestamp with time zone,
  state text NOT NULL DEFAULT 'assigned'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.operational_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  work_type text NOT NULL,
  work_id text NOT NULL,
  author_user_id uuid,
  note text NOT NULL,
  visibility text NOT NULL DEFAULT 'internal'::text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.opportunities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  external_id text NOT NULL,
  provider_id uuid NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  route_codes text[] NOT NULL DEFAULT '{}'::text[],
  cities text[] NOT NULL DEFAULT '{}'::text[],
  goal_tags text[] NOT NULL DEFAULT '{}'::text[],
  eligibility_rule jsonb NOT NULL DEFAULT '{}'::jsonb,
  deadline date,
  trust_score numeric NOT NULL DEFAULT 0.7,
  commercial_status text NOT NULL DEFAULT 'public_interest'::text,
  commission_minor integer,
  source_url text,
  verified_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'review'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.opportunity_action_sessions (
  id uuid NOT NULL,
  opportunity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  destination_url text NOT NULL,
  destination_hostname text NOT NULL,
  commercial_status text NOT NULL,
  disclosure_state text NOT NULL DEFAULT 'not_required'::text,
  destination_mode text NOT NULL DEFAULT 'in_app'::text,
  session_state text NOT NULL DEFAULT 'disclosed'::text,
  signed_token_hash text,
  idempotency_key text,
  expires_at timestamp with time zone,
  returned_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.opportunity_ingestion_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  connector text NOT NULL,
  state text NOT NULL DEFAULT 'running'::text,
  fetched_count integer NOT NULL DEFAULT 0,
  stale_count integer NOT NULL DEFAULT 0,
  accepted_count integer,
  quarantined_count integer,
  evidence jsonb,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.opportunity_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  interaction_type text NOT NULL,
  idempotency_key text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.opportunity_redirect_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  action_session_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.organisation_memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organisation_id uuid,
  role text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.outbound_link_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hostname text NOT NULL,
  status text NOT NULL DEFAULT 'review'::text,
  allow_subdomains boolean NOT NULL DEFAULT false,
  allowed_redirect_hosts text[] NOT NULL DEFAULT '{}'::text[],
  disclosure_required boolean NOT NULL DEFAULT true,
  attribution_mode text NOT NULL DEFAULT 'first_party_session'::text,
  privacy_note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.partner_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  industry text,
  notes text,
  owner text,
  acknowledgement_sent_at timestamp with time zone,
  conversion_stage text NOT NULL DEFAULT 'lead'::text,
  follow_up_notes text,
  status text NOT NULL DEFAULT 'new'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.partner_programmes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT ''::text,
  commission_rule jsonb NOT NULL DEFAULT '{"type": "fixed", "amount_minor": 0}'::jsonb,
  status text NOT NULL DEFAULT 'sandbox'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.platform_role_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_code text NOT NULL,
  granted_by uuid,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.product_entry_states (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  product_id text NOT NULL,
  state text NOT NULL DEFAULT 'active'::text,
  route_context text,
  goal text NOT NULL DEFAULT ''::text,
  context_notes text,
  personalisation_consent boolean NOT NULL DEFAULT false,
  last_idempotency_key text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.product_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.products (
  id text NOT NULL,
  name text NOT NULL DEFAULT ''::text,
  scope text NOT NULL DEFAULT 'individual'::text,
  autonomy_level smallint NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.profile_facts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  fact_key text NOT NULL,
  fact_value jsonb,
  confidence numeric NOT NULL DEFAULT 1,
  source text NOT NULL DEFAULT 'user'::text,
  superseded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.proofpoints_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  idempotency_key text NOT NULL,
  event_type text NOT NULL,
  points integer NOT NULL,
  source_id text NOT NULL,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  occurred_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.provider_activation_states (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_code text NOT NULL,
  environment text NOT NULL DEFAULT 'local'::text,
  configuration_state text NOT NULL DEFAULT 'not_configured'::text,
  verification_state text NOT NULL DEFAULT 'attention'::text,
  owner_user_id uuid,
  evidence jsonb,
  last_checked_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.providers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider_type text NOT NULL DEFAULT 'opportunity'::text,
  verification_status text NOT NULL DEFAULT 'pending'::text,
  trust_score numeric NOT NULL DEFAULT 0.7,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.public_content_publications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  canonical_path text NOT NULL,
  publication_state text NOT NULL DEFAULT 'draft'::text,
  index_state text NOT NULL DEFAULT 'noindex'::text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  published_at timestamp with time zone,
  next_review_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.referral_disclosures (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  referral_code text NOT NULL,
  disclosed_to text,
  disclosed_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.referral_touches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL,
  subject_hash text NOT NULL,
  touched_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.reminder_prefs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_reminders boolean DEFAULT false,
  frequency text DEFAULT 'weekly'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.safety_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL DEFAULT 'medium'::text,
  status text NOT NULL DEFAULT 'open'::text,
  source_type text,
  source_id uuid,
  assigned_to text,
  resolution_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.scam_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  description text NOT NULL,
  scam_type text NOT NULL DEFAULT 'other'::text,
  severity text NOT NULL DEFAULT 'medium'::text,
  status text NOT NULL DEFAULT 'open'::text,
  evidence_urls jsonb,
  resolution_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.service_health_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_code text NOT NULL,
  environment text NOT NULL DEFAULT 'local'::text,
  healthy boolean NOT NULL,
  detail jsonb,
  checked_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.subscription_lifecycle_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  action text NOT NULL,
  requested_by uuid,
  reason_codes text[] NOT NULL DEFAULT '{}'::text[],
  effective_at timestamp with time zone NOT NULL,
  retained_work jsonb,
  idempotency_key text NOT NULL,
  state text NOT NULL DEFAULT 'requested'::text,
  completed_at timestamp with time zone,
  provider_result jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  product_id text NOT NULL,
  provider_subscription_id text,
  status text NOT NULL DEFAULT 'active'::text,
  current_period_end timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.support_case_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL,
  actor_user_id uuid,
  event_type text NOT NULL,
  after_state jsonb,
  note text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.support_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  household_id uuid,
  opportunity_id uuid,
  case_type text NOT NULL DEFAULT 'support'::text,
  subject text NOT NULL,
  description text NOT NULL DEFAULT ''::text,
  severity text NOT NULL DEFAULT 'normal'::text,
  state text NOT NULL DEFAULT 'received'::text,
  response_due_at timestamp with time zone,
  idempotency_key text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'open'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.task_instances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  journey_plan_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.training_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  module_type text NOT NULL DEFAULT 'general'::text,
  content text,
  required boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft'::text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.user_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  milestone_key text NOT NULL,
  title text NOT NULL,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.user_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'service'::text,
  source text,
  status text NOT NULL DEFAULT 'unread'::text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone
);

CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  personalisation_enabled boolean NOT NULL DEFAULT true,
  commercial_recommendation_mode text NOT NULL DEFAULT 'contextual'::text,
  location_enabled boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  display_name text NOT NULL DEFAULT 'Beginly member'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.user_referral_identities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  state text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.user_referral_touches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  referral_identity_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.user_task_states (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_code text NOT NULL,
  state text NOT NULL DEFAULT 'not_started'::text,
  defer_until timestamp with time zone,
  note text,
  evidence jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_idempotency_key text
);

CREATE TABLE public.user_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id text NOT NULL,
  status text NOT NULL DEFAULT 'not_started'::text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  is_admin boolean DEFAULT false,
  profile_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  external_event_id text NOT NULL,
  signature_verified boolean NOT NULL DEFAULT false,
  payload_hash text,
  state text NOT NULL DEFAULT 'received'::text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- CONSTRAINTS (primary keys, foreign keys, unique, check)
-- ============================================================

ALTER TABLE public.app_release_policies ADD CONSTRAINT app_release_policies_channel_check CHECK ((channel = ANY (ARRAY['production'::text, 'beta'::text, 'staging'::text])));
ALTER TABLE public.app_release_policies ADD CONSTRAINT app_release_policies_pkey PRIMARY KEY (id);
ALTER TABLE public.app_release_policies ADD CONSTRAINT app_release_policies_platform_check CHECK ((platform = ANY (ARRAY['web'::text, 'android'::text, 'ios'::text])));

ALTER TABLE public.arrival_profiles ADD CONSTRAINT arrival_profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.arrival_profiles ADD CONSTRAINT arrival_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.audit_events ADD CONSTRAINT audit_events_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.audit_events ADD CONSTRAINT audit_events_pkey PRIMARY KEY (id);

ALTER TABLE public.billing_events ADD CONSTRAINT billing_events_event_type_check CHECK ((event_type = ANY (ARRAY['checkout_completed'::text, 'invoice_paid'::text, 'subscription_paused'::text, 'subscription_resumed'::text, 'subscription_cancelled'::text, 'refund_completed'::text])));
ALTER TABLE public.billing_events ADD CONSTRAINT billing_events_external_event_id_key UNIQUE (external_event_id);
ALTER TABLE public.billing_events ADD CONSTRAINT billing_events_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.billing_events ADD CONSTRAINT billing_events_pkey PRIMARY KEY (id);

ALTER TABLE public.browser_return_events ADD CONSTRAINT browser_return_events_action_session_id_fkey FOREIGN KEY (action_session_id) REFERENCES opportunity_action_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.browser_return_events ADD CONSTRAINT browser_return_events_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.browser_return_events ADD CONSTRAINT browser_return_events_pkey PRIMARY KEY (id);
ALTER TABLE public.browser_return_events ADD CONSTRAINT browser_return_events_return_type_check CHECK ((return_type = ANY (ARRAY['deep_link'::text, 'dismissed'::text, 'manual_return'::text, 'external_return'::text])));
ALTER TABLE public.browser_return_events ADD CONSTRAINT browser_return_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.budget_items ADD CONSTRAINT budget_items_pkey PRIMARY KEY (id);
ALTER TABLE public.budget_items ADD CONSTRAINT budget_items_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text, 'savings'::text])));
ALTER TABLE public.budget_items ADD CONSTRAINT budget_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.checkout_sessions ADD CONSTRAINT checkout_sessions_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.checkout_sessions ADD CONSTRAINT checkout_sessions_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.checkout_sessions ADD CONSTRAINT checkout_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.checkout_sessions ADD CONSTRAINT checkout_sessions_state_check CHECK ((state = ANY (ARRAY['created'::text, 'open'::text, 'complete'::text, 'expired'::text, 'failed'::text])));

ALTER TABLE public.commission_ledger ADD CONSTRAINT commission_ledger_attribution_id_fkey FOREIGN KEY (attribution_id) REFERENCES referral_touches(id) ON DELETE SET NULL;
ALTER TABLE public.commission_ledger ADD CONSTRAINT commission_ledger_conversion_event_id_fkey FOREIGN KEY (conversion_event_id) REFERENCES conversion_events(id) ON DELETE CASCADE;
ALTER TABLE public.commission_ledger ADD CONSTRAINT commission_ledger_event_type_check CHECK ((event_type = ANY (ARRAY['confirmed_conversion'::text, 'reversal'::text, 'payout'::text])));
ALTER TABLE public.commission_ledger ADD CONSTRAINT commission_ledger_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.commission_ledger ADD CONSTRAINT commission_ledger_pkey PRIMARY KEY (id);
ALTER TABLE public.commission_ledger ADD CONSTRAINT commission_ledger_programme_id_fkey FOREIGN KEY (programme_id) REFERENCES partner_programmes(id) ON DELETE CASCADE;

ALTER TABLE public.commission_reconciliation_runs ADD CONSTRAINT commission_reconciliation_runs_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.commission_reconciliation_runs ADD CONSTRAINT commission_reconciliation_runs_pkey PRIMARY KEY (id);
ALTER TABLE public.commission_reconciliation_runs ADD CONSTRAINT commission_reconciliation_runs_programme_id_fkey FOREIGN KEY (programme_id) REFERENCES partner_programmes(id) ON DELETE CASCADE;

ALTER TABLE public.consent_records ADD CONSTRAINT consent_records_pkey PRIMARY KEY (id);
ALTER TABLE public.consent_records ADD CONSTRAINT consent_records_state_check CHECK ((state = ANY (ARRAY['granted'::text, 'withdrawn'::text])));
ALTER TABLE public.consent_records ADD CONSTRAINT consent_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.conversion_claims ADD CONSTRAINT conversion_claims_action_session_id_fkey FOREIGN KEY (action_session_id) REFERENCES opportunity_action_sessions(id) ON DELETE SET NULL;
ALTER TABLE public.conversion_claims ADD CONSTRAINT conversion_claims_pkey PRIMARY KEY (id);
ALTER TABLE public.conversion_claims ADD CONSTRAINT conversion_claims_state_check CHECK ((state = ANY (ARRAY['user_claimed'::text, 'confirmed'::text, 'rejected'::text, 'expired'::text])));
ALTER TABLE public.conversion_claims ADD CONSTRAINT conversion_claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.conversion_events ADD CONSTRAINT conversion_events_event_type_check CHECK ((event_type = ANY (ARRAY['confirmed_conversion'::text, 'reversal'::text])));
ALTER TABLE public.conversion_events ADD CONSTRAINT conversion_events_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.conversion_events ADD CONSTRAINT conversion_events_pkey PRIMARY KEY (id);
ALTER TABLE public.conversion_events ADD CONSTRAINT conversion_events_programme_id_fkey FOREIGN KEY (programme_id) REFERENCES partner_programmes(id) ON DELETE CASCADE;

ALTER TABLE public.custom_sessions ADD CONSTRAINT custom_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.custom_sessions ADD CONSTRAINT custom_sessions_token_key UNIQUE (token);
ALTER TABLE public.custom_sessions ADD CONSTRAINT custom_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.custom_users ADD CONSTRAINT custom_users_email_key UNIQUE (email);
ALTER TABLE public.custom_users ADD CONSTRAINT custom_users_pkey PRIMARY KEY (id);
ALTER TABLE public.custom_users ADD CONSTRAINT custom_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.custom_users ADD CONSTRAINT custom_users_user_id_key UNIQUE (user_id);

ALTER TABLE public.data_deletion_tombstones ADD CONSTRAINT data_deletion_tombstones_pkey PRIMARY KEY (id);
ALTER TABLE public.data_deletion_tombstones ADD CONSTRAINT data_deletion_tombstones_subject_hash_key UNIQUE (subject_hash);

ALTER TABLE public.data_rights_exports ADD CONSTRAINT data_rights_exports_pkey PRIMARY KEY (id);
ALTER TABLE public.data_rights_exports ADD CONSTRAINT data_rights_exports_request_id_fkey FOREIGN KEY (request_id) REFERENCES data_rights_requests(id) ON DELETE CASCADE;
ALTER TABLE public.data_rights_exports ADD CONSTRAINT data_rights_exports_request_id_key UNIQUE (request_id);
ALTER TABLE public.data_rights_exports ADD CONSTRAINT data_rights_exports_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.data_rights_requests ADD CONSTRAINT data_rights_requests_pkey PRIMARY KEY (id);
ALTER TABLE public.data_rights_requests ADD CONSTRAINT data_rights_requests_request_type_check CHECK ((request_type = ANY (ARRAY['export'::text, 'delete'::text, 'rectify'::text, 'restrict'::text])));
ALTER TABLE public.data_rights_requests ADD CONSTRAINT data_rights_requests_state_check CHECK ((state = ANY (ARRAY['received'::text, 'validating'::text, 'in_progress'::text, 'completed'::text, 'rejected'::text])));
ALTER TABLE public.data_rights_requests ADD CONSTRAINT data_rights_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.destination_health_checks ADD CONSTRAINT destination_health_checks_checked_by_fkey FOREIGN KEY (checked_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.destination_health_checks ADD CONSTRAINT destination_health_checks_outbound_policy_id_fkey FOREIGN KEY (outbound_policy_id) REFERENCES outbound_link_policies(id) ON DELETE SET NULL;
ALTER TABLE public.destination_health_checks ADD CONSTRAINT destination_health_checks_pkey PRIMARY KEY (id);
ALTER TABLE public.destination_health_checks ADD CONSTRAINT destination_health_checks_status_check CHECK ((status = ANY (ARRAY['ok'::text, 'failed'::text, 'redirect_mismatch'::text, 'timeout'::text])));

ALTER TABLE public.device_registrations ADD CONSTRAINT device_registrations_pkey PRIMARY KEY (id);
ALTER TABLE public.device_registrations ADD CONSTRAINT device_registrations_platform_check CHECK ((platform = ANY (ARRAY['ios'::text, 'android'::text, 'web'::text])));
ALTER TABLE public.device_registrations ADD CONSTRAINT device_registrations_state_check CHECK ((state = ANY (ARRAY['active'::text, 'disabled'::text])));
ALTER TABLE public.device_registrations ADD CONSTRAINT device_registrations_token_hash_key UNIQUE (token_hash);
ALTER TABLE public.device_registrations ADD CONSTRAINT device_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.entitlements ADD CONSTRAINT entitlements_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.entitlements ADD CONSTRAINT entitlements_autonomy_level_check CHECK (((autonomy_level >= 0) AND (autonomy_level <= 5)));
ALTER TABLE public.entitlements ADD CONSTRAINT entitlements_member_id_fkey FOREIGN KEY (member_id) REFERENCES household_members(id) ON DELETE SET NULL;
ALTER TABLE public.entitlements ADD CONSTRAINT entitlements_pkey PRIMARY KEY (id);
ALTER TABLE public.entitlements ADD CONSTRAINT entitlements_scope_check CHECK ((scope = ANY (ARRAY['individual'::text, 'selected_member'::text, 'household'::text, 'organisation'::text, 'cohort'::text])));
ALTER TABLE public.entitlements ADD CONSTRAINT entitlements_source_check CHECK ((source = ANY (ARRAY['free_core'::text, 'purchase'::text, 'subscription'::text, 'bundle'::text, 'household'::text, 'sponsor'::text, 'partner_funded'::text, 'proofpoints'::text, 'promotion'::text, 'trial'::text, 'grandfathered'::text])));

ALTER TABLE public.goals ADD CONSTRAINT goals_horizon_check CHECK ((horizon = ANY (ARRAY['now'::text, 'next_90_days'::text, 'next_year'::text, 'long_term'::text])));
ALTER TABLE public.goals ADD CONSTRAINT goals_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;
ALTER TABLE public.goals ADD CONSTRAINT goals_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.goals ADD CONSTRAINT goals_pkey PRIMARY KEY (id);
ALTER TABLE public.goals ADD CONSTRAINT goals_status_check CHECK ((status = ANY (ARRAY['active'::text, 'complete'::text, 'paused'::text])));

ALTER TABLE public.household_invitations ADD CONSTRAINT household_invitations_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE;
ALTER TABLE public.household_invitations ADD CONSTRAINT household_invitations_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.household_invitations ADD CONSTRAINT household_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.household_invitations ADD CONSTRAINT household_invitations_pkey PRIMARY KEY (id);
ALTER TABLE public.household_invitations ADD CONSTRAINT household_invitations_role_check CHECK ((role = ANY (ARRAY['primary'::text, 'partner'::text, 'adult_dependant'::text, 'child'::text])));
ALTER TABLE public.household_invitations ADD CONSTRAINT household_invitations_route_code_check CHECK ((route_code = ANY (ARRAY['student'::text, 'graduate'::text, 'skilled_worker'::text, 'health_care'::text, 'family_dependant'::text, 'founder'::text, 'global_talent'::text, 'humanitarian'::text])));
ALTER TABLE public.household_invitations ADD CONSTRAINT household_invitations_state_check CHECK ((state = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'expired'::text])));
ALTER TABLE public.household_invitations ADD CONSTRAINT household_invitations_token_hash_key UNIQUE (token_hash);

ALTER TABLE public.household_members ADD CONSTRAINT household_members_age_band_check CHECK ((age_band = ANY (ARRAY['adult'::text, '16_17'::text, 'child'::text])));
ALTER TABLE public.household_members ADD CONSTRAINT household_members_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE;
ALTER TABLE public.household_members ADD CONSTRAINT household_members_pkey PRIMARY KEY (id);
ALTER TABLE public.household_members ADD CONSTRAINT household_members_role_check CHECK ((role = ANY (ARRAY['primary'::text, 'partner'::text, 'adult_dependant'::text, 'child'::text])));
ALTER TABLE public.household_members ADD CONSTRAINT household_members_route_check CHECK ((route = ANY (ARRAY['student'::text, 'graduate'::text, 'skilled_worker'::text, 'health_care'::text, 'family_dependant'::text, 'founder'::text, 'global_talent'::text, 'humanitarian'::text])));
ALTER TABLE public.household_members ADD CONSTRAINT household_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.households ADD CONSTRAINT households_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.households ADD CONSTRAINT households_pkey PRIMARY KEY (id);

ALTER TABLE public.incidents ADD CONSTRAINT incidents_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.incidents ADD CONSTRAINT incidents_pkey PRIMARY KEY (id);
ALTER TABLE public.incidents ADD CONSTRAINT incidents_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])));
ALTER TABLE public.incidents ADD CONSTRAINT incidents_state_check CHECK ((state = ANY (ARRAY['open'::text, 'investigating'::text, 'mitigated'::text, 'resolved'::text, 'closed'::text])));

ALTER TABLE public.job_outbox ADD CONSTRAINT job_outbox_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.job_outbox ADD CONSTRAINT job_outbox_pkey PRIMARY KEY (id);
ALTER TABLE public.job_outbox ADD CONSTRAINT job_outbox_state_check CHECK ((state = ANY (ARRAY['queued'::text, 'processing'::text, 'completed'::text, 'failed'::text])));

ALTER TABLE public.journey_plans ADD CONSTRAINT journey_plans_pkey PRIMARY KEY (id);
ALTER TABLE public.journey_plans ADD CONSTRAINT journey_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.life_events ADD CONSTRAINT life_events_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;
ALTER TABLE public.life_events ADD CONSTRAINT life_events_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.life_events ADD CONSTRAINT life_events_pkey PRIMARY KEY (id);
ALTER TABLE public.life_events ADD CONSTRAINT life_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.migration_profiles ADD CONSTRAINT migration_profiles_current_route_check CHECK ((current_route = ANY (ARRAY['student'::text, 'graduate'::text, 'skilled_worker'::text, 'health_care'::text, 'family_dependant'::text, 'founder'::text, 'global_talent'::text, 'humanitarian'::text])));
ALTER TABLE public.migration_profiles ADD CONSTRAINT migration_profiles_current_stage_check CHECK ((current_stage = ANY (ARRAY['pre_arrival'::text, 'arrival'::text, 'settling'::text, 'studying'::text, 'career_preparation'::text, 'transition'::text, 'established'::text, 'progression'::text])));
ALTER TABLE public.migration_profiles ADD CONSTRAINT migration_profiles_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;
ALTER TABLE public.migration_profiles ADD CONSTRAINT migration_profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.migration_profiles ADD CONSTRAINT migration_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.nia_conversations ADD CONSTRAINT nia_conversations_pkey PRIMARY KEY (id);
ALTER TABLE public.nia_conversations ADD CONSTRAINT nia_conversations_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text])));
ALTER TABLE public.nia_conversations ADD CONSTRAINT nia_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.nia_messages ADD CONSTRAINT nia_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES nia_conversations(id) ON DELETE CASCADE;
ALTER TABLE public.nia_messages ADD CONSTRAINT nia_messages_pkey PRIMARY KEY (id);
ALTER TABLE public.nia_messages ADD CONSTRAINT nia_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])));

ALTER TABLE public.nia_tool_proposals ADD CONSTRAINT nia_tool_proposals_approval_state_check CHECK ((approval_state = ANY (ARRAY['proposed'::text, 'approved'::text, 'executed'::text, 'rejected'::text])));
ALTER TABLE public.nia_tool_proposals ADD CONSTRAINT nia_tool_proposals_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.nia_tool_proposals ADD CONSTRAINT nia_tool_proposals_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES nia_conversations(id) ON DELETE CASCADE;
ALTER TABLE public.nia_tool_proposals ADD CONSTRAINT nia_tool_proposals_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.nia_tool_proposals ADD CONSTRAINT nia_tool_proposals_pkey PRIMARY KEY (id);
ALTER TABLE public.nia_tool_proposals ADD CONSTRAINT nia_tool_proposals_risk_class_check CHECK ((risk_class = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'prohibited'::text])));

ALTER TABLE public.notification_delivery_log ADD CONSTRAINT notification_delivery_log_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES user_notifications(id) ON DELETE SET NULL;
ALTER TABLE public.notification_delivery_log ADD CONSTRAINT notification_delivery_log_pkey PRIMARY KEY (id);
ALTER TABLE public.notification_delivery_log ADD CONSTRAINT notification_delivery_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.notification_outbox ADD CONSTRAINT notification_outbox_channel_check CHECK ((channel = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text])));
ALTER TABLE public.notification_outbox ADD CONSTRAINT notification_outbox_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.notification_outbox ADD CONSTRAINT notification_outbox_pkey PRIMARY KEY (id);
ALTER TABLE public.notification_outbox ADD CONSTRAINT notification_outbox_state_check CHECK ((state = ANY (ARRAY['queued'::text, 'delivered'::text, 'failed'::text, 'archived'::text])));
ALTER TABLE public.notification_outbox ADD CONSTRAINT notification_outbox_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.notification_preferences ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);
ALTER TABLE public.notification_preferences ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notification_preferences ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);

ALTER TABLE public.onboarding_states ADD CONSTRAINT onboarding_states_pkey PRIMARY KEY (id);
ALTER TABLE public.onboarding_states ADD CONSTRAINT onboarding_states_state_check CHECK ((state = ANY (ARRAY['draft'::text, 'complete'::text])));
ALTER TABLE public.onboarding_states ADD CONSTRAINT onboarding_states_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.onboarding_states ADD CONSTRAINT onboarding_states_user_id_key UNIQUE (user_id);

ALTER TABLE public.operational_assignments ADD CONSTRAINT operational_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.operational_assignments ADD CONSTRAINT operational_assignments_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.operational_assignments ADD CONSTRAINT operational_assignments_pkey PRIMARY KEY (id);
ALTER TABLE public.operational_assignments ADD CONSTRAINT operational_assignments_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])));
ALTER TABLE public.operational_assignments ADD CONSTRAINT operational_assignments_state_check CHECK ((state = ANY (ARRAY['assigned'::text, 'unassigned'::text])));
ALTER TABLE public.operational_assignments ADD CONSTRAINT operational_assignments_work_type_work_id_key UNIQUE (work_type, work_id);

ALTER TABLE public.operational_notes ADD CONSTRAINT operational_notes_author_user_id_fkey FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.operational_notes ADD CONSTRAINT operational_notes_pkey PRIMARY KEY (id);
ALTER TABLE public.operational_notes ADD CONSTRAINT operational_notes_visibility_check CHECK ((visibility = ANY (ARRAY['internal'::text, 'external'::text])));

ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_category_check CHECK ((category = ANY (ARRAY['job'::text, 'training'::text, 'certification'::text, 'event'::text, 'grant'::text, 'accelerator'::text, 'housing'::text, 'banking'::text, 'insurance'::text, 'family'::text, 'professional_network'::text, 'community'::text, 'regulated_service'::text])));
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_commercial_status_check CHECK ((commercial_status = ANY (ARRAY['commission_embedded'::text, 'relationship_pending'::text, 'public_interest'::text, 'sponsored'::text])));
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_pkey PRIMARY KEY (id);
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_provider_id_external_id_key UNIQUE (provider_id, external_id);
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_status_check CHECK ((status = ANY (ARRAY['review'::text, 'active'::text, 'archived'::text])));

ALTER TABLE public.opportunity_action_sessions ADD CONSTRAINT opportunity_action_sessions_action_type_check CHECK ((action_type = ANY (ARRAY['view'::text, 'apply'::text])));
ALTER TABLE public.opportunity_action_sessions ADD CONSTRAINT opportunity_action_sessions_disclosure_state_check CHECK ((disclosure_state = ANY (ARRAY['not_required'::text, 'accepted'::text])));
ALTER TABLE public.opportunity_action_sessions ADD CONSTRAINT opportunity_action_sessions_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.opportunity_action_sessions ADD CONSTRAINT opportunity_action_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.opportunity_action_sessions ADD CONSTRAINT opportunity_action_sessions_session_state_check CHECK ((session_state = ANY (ARRAY['created'::text, 'disclosed'::text, 'opened'::text, 'returned'::text, 'dismissed'::text])));
ALTER TABLE public.opportunity_action_sessions ADD CONSTRAINT opportunity_action_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.opportunity_ingestion_runs ADD CONSTRAINT opportunity_ingestion_runs_pkey PRIMARY KEY (id);
ALTER TABLE public.opportunity_ingestion_runs ADD CONSTRAINT opportunity_ingestion_runs_state_check CHECK ((state = ANY (ARRAY['running'::text, 'complete'::text, 'failed'::text])));

ALTER TABLE public.opportunity_interactions ADD CONSTRAINT opportunity_interactions_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.opportunity_interactions ADD CONSTRAINT opportunity_interactions_interaction_type_check CHECK ((interaction_type = ANY (ARRAY['view'::text, 'apply'::text, 'saved'::text])));
ALTER TABLE public.opportunity_interactions ADD CONSTRAINT opportunity_interactions_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE;
ALTER TABLE public.opportunity_interactions ADD CONSTRAINT opportunity_interactions_pkey PRIMARY KEY (id);
ALTER TABLE public.opportunity_interactions ADD CONSTRAINT opportunity_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.opportunity_interactions ADD CONSTRAINT opportunity_interactions_user_id_opportunity_id_interaction_key UNIQUE (user_id, opportunity_id, interaction_type);

ALTER TABLE public.opportunity_redirect_events ADD CONSTRAINT opportunity_redirect_events_action_session_id_fkey FOREIGN KEY (action_session_id) REFERENCES opportunity_action_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.opportunity_redirect_events ADD CONSTRAINT opportunity_redirect_events_pkey PRIMARY KEY (id);

ALTER TABLE public.organisation_memberships ADD CONSTRAINT organisation_memberships_pkey PRIMARY KEY (id);
ALTER TABLE public.organisation_memberships ADD CONSTRAINT organisation_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.outbound_link_policies ADD CONSTRAINT outbound_link_policies_hostname_key UNIQUE (hostname);
ALTER TABLE public.outbound_link_policies ADD CONSTRAINT outbound_link_policies_pkey PRIMARY KEY (id);
ALTER TABLE public.outbound_link_policies ADD CONSTRAINT outbound_link_policies_status_check CHECK ((status = ANY (ARRAY['review'::text, 'approved'::text, 'blocked'::text])));

ALTER TABLE public.partner_leads ADD CONSTRAINT partner_leads_pkey PRIMARY KEY (id);

ALTER TABLE public.partner_programmes ADD CONSTRAINT partner_programmes_pkey PRIMARY KEY (id);
ALTER TABLE public.partner_programmes ADD CONSTRAINT partner_programmes_status_check CHECK ((status = ANY (ARRAY['active'::text, 'sandbox'::text, 'inactive'::text, 'suspended'::text])));

ALTER TABLE public.platform_role_assignments ADD CONSTRAINT platform_role_assignments_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.platform_role_assignments ADD CONSTRAINT platform_role_assignments_pkey PRIMARY KEY (id);
ALTER TABLE public.platform_role_assignments ADD CONSTRAINT platform_role_assignments_role_code_check CHECK ((role_code = ANY (ARRAY['platform_admin'::text, 'content_admin'::text, 'support_admin'::text, 'finance_admin'::text, 'partner_admin'::text])));
ALTER TABLE public.platform_role_assignments ADD CONSTRAINT platform_role_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.product_entry_states ADD CONSTRAINT product_entry_states_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.product_entry_states ADD CONSTRAINT product_entry_states_actor_id_product_id_key UNIQUE (actor_id, product_id);
ALTER TABLE public.product_entry_states ADD CONSTRAINT product_entry_states_pkey PRIMARY KEY (id);
ALTER TABLE public.product_entry_states ADD CONSTRAINT product_entry_states_route_context_check CHECK ((route_context = ANY (ARRAY['student'::text, 'graduate'::text, 'skilled_worker'::text, 'health_care'::text, 'family_dependant'::text, 'founder'::text, 'global_talent'::text, 'humanitarian'::text])));
ALTER TABLE public.product_entry_states ADD CONSTRAINT product_entry_states_state_check CHECK ((state = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'completed'::text])));

ALTER TABLE public.product_recommendations ADD CONSTRAINT product_recommendations_pkey PRIMARY KEY (id);
ALTER TABLE public.product_recommendations ADD CONSTRAINT product_recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.products ADD CONSTRAINT products_autonomy_level_check CHECK (((autonomy_level >= 0) AND (autonomy_level <= 5)));
ALTER TABLE public.products ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE public.products ADD CONSTRAINT products_scope_check CHECK ((scope = ANY (ARRAY['individual'::text, 'selected_member'::text, 'household'::text, 'organisation'::text, 'cohort'::text])));

ALTER TABLE public.profile_facts ADD CONSTRAINT profile_facts_pkey PRIMARY KEY (id);
ALTER TABLE public.profile_facts ADD CONSTRAINT profile_facts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES migration_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.profile_facts ADD CONSTRAINT profile_facts_source_check CHECK ((source = ANY (ARRAY['user'::text, 'legacy_import'::text, 'partner'::text, 'inferred'::text])));

ALTER TABLE public.proofpoints_ledger ADD CONSTRAINT proofpoints_ledger_event_type_check CHECK ((event_type = ANY (ARRAY['earn'::text, 'redeem'::text, 'reverse'::text, 'expire'::text, 'adjust'::text])));
ALTER TABLE public.proofpoints_ledger ADD CONSTRAINT proofpoints_ledger_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.proofpoints_ledger ADD CONSTRAINT proofpoints_ledger_pkey PRIMARY KEY (id);
ALTER TABLE public.proofpoints_ledger ADD CONSTRAINT proofpoints_ledger_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.provider_activation_states ADD CONSTRAINT provider_activation_states_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.provider_activation_states ADD CONSTRAINT provider_activation_states_pkey PRIMARY KEY (id);
ALTER TABLE public.provider_activation_states ADD CONSTRAINT provider_activation_states_provider_code_key UNIQUE (provider_code);

ALTER TABLE public.providers ADD CONSTRAINT providers_pkey PRIMARY KEY (id);
ALTER TABLE public.providers ADD CONSTRAINT providers_provider_type_name_key UNIQUE (provider_type, name);
ALTER TABLE public.providers ADD CONSTRAINT providers_trust_score_check CHECK (((trust_score >= (0)::numeric) AND (trust_score <= (1)::numeric)));
ALTER TABLE public.providers ADD CONSTRAINT providers_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'verified'::text, 'suspended'::text])));

ALTER TABLE public.public_content_publications ADD CONSTRAINT public_content_publications_canonical_path_key UNIQUE (canonical_path);
ALTER TABLE public.public_content_publications ADD CONSTRAINT public_content_publications_pkey PRIMARY KEY (id);
ALTER TABLE public.public_content_publications ADD CONSTRAINT public_content_publications_publication_state_check CHECK ((publication_state = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text, 'archived'::text])));
ALTER TABLE public.public_content_publications ADD CONSTRAINT public_content_publications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE public.referral_disclosures ADD CONSTRAINT referral_disclosures_pkey PRIMARY KEY (id);
ALTER TABLE public.referral_disclosures ADD CONSTRAINT referral_disclosures_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.referral_touches ADD CONSTRAINT referral_touches_pkey PRIMARY KEY (id);
ALTER TABLE public.referral_touches ADD CONSTRAINT referral_touches_programme_id_fkey FOREIGN KEY (programme_id) REFERENCES partner_programmes(id) ON DELETE CASCADE;

ALTER TABLE public.reminder_prefs ADD CONSTRAINT reminder_prefs_pkey PRIMARY KEY (id);
ALTER TABLE public.reminder_prefs ADD CONSTRAINT reminder_prefs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.reminder_prefs ADD CONSTRAINT reminder_prefs_user_id_key UNIQUE (user_id);

ALTER TABLE public.safety_cases ADD CONSTRAINT safety_cases_pkey PRIMARY KEY (id);
ALTER TABLE public.safety_cases ADD CONSTRAINT safety_cases_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])));
ALTER TABLE public.safety_cases ADD CONSTRAINT safety_cases_status_check CHECK ((status = ANY (ARRAY['open'::text, 'triaging'::text, 'escalated'::text, 'resolved'::text, 'archived'::text])));

ALTER TABLE public.scam_reports ADD CONSTRAINT scam_reports_pkey PRIMARY KEY (id);
ALTER TABLE public.scam_reports ADD CONSTRAINT scam_reports_scam_type_check CHECK ((scam_type = ANY (ARRAY['phishing'::text, 'rental'::text, 'employment'::text, 'romance'::text, 'investment'::text, 'identity'::text, 'housing'::text, 'other'::text])));
ALTER TABLE public.scam_reports ADD CONSTRAINT scam_reports_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])));
ALTER TABLE public.scam_reports ADD CONSTRAINT scam_reports_status_check CHECK ((status = ANY (ARRAY['open'::text, 'investigating'::text, 'resolved'::text, 'dismissed'::text])));
ALTER TABLE public.scam_reports ADD CONSTRAINT scam_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.service_health_snapshots ADD CONSTRAINT service_health_snapshots_pkey PRIMARY KEY (id);

ALTER TABLE public.subscription_lifecycle_actions ADD CONSTRAINT subscription_lifecycle_actions_action_check CHECK ((action = ANY (ARRAY['pause'::text, 'resume'::text, 'cancel'::text, 'replace'::text])));
ALTER TABLE public.subscription_lifecycle_actions ADD CONSTRAINT subscription_lifecycle_actions_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.subscription_lifecycle_actions ADD CONSTRAINT subscription_lifecycle_actions_pkey PRIMARY KEY (id);
ALTER TABLE public.subscription_lifecycle_actions ADD CONSTRAINT subscription_lifecycle_actions_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.subscription_lifecycle_actions ADD CONSTRAINT subscription_lifecycle_actions_state_check CHECK ((state = ANY (ARRAY['requested'::text, 'queued'::text, 'completed'::text, 'failed'::text])));
ALTER TABLE public.subscription_lifecycle_actions ADD CONSTRAINT subscription_lifecycle_actions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_actor_id_product_id_key UNIQUE (actor_id, product_id);
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'cancelled'::text])));

ALTER TABLE public.support_case_events ADD CONSTRAINT support_case_events_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE public.support_case_events ADD CONSTRAINT support_case_events_case_id_fkey FOREIGN KEY (case_id) REFERENCES support_cases(id) ON DELETE CASCADE;
ALTER TABLE public.support_case_events ADD CONSTRAINT support_case_events_pkey PRIMARY KEY (id);

ALTER TABLE public.support_cases ADD CONSTRAINT support_cases_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;
ALTER TABLE public.support_cases ADD CONSTRAINT support_cases_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE public.support_cases ADD CONSTRAINT support_cases_pkey PRIMARY KEY (id);
ALTER TABLE public.support_cases ADD CONSTRAINT support_cases_severity_check CHECK ((severity = ANY (ARRAY['normal'::text, 'high'::text, 'urgent'::text])));
ALTER TABLE public.support_cases ADD CONSTRAINT support_cases_state_check CHECK ((state = ANY (ARRAY['received'::text, 'triaged'::text, 'in_progress'::text, 'escalated'::text, 'resolved'::text, 'closed'::text])));
ALTER TABLE public.support_cases ADD CONSTRAINT support_cases_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_category_check CHECK ((category = ANY (ARRAY['account'::text, 'checklist'::text, 'document'::text, 'housing'::text, 'partner'::text, 'scam'::text, 'other'::text])));
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_status_check CHECK ((status = ANY (ARRAY['open'::text, 'resolved'::text])));
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.task_instances ADD CONSTRAINT task_instances_journey_plan_id_fkey FOREIGN KEY (journey_plan_id) REFERENCES journey_plans(id) ON DELETE CASCADE;
ALTER TABLE public.task_instances ADD CONSTRAINT task_instances_pkey PRIMARY KEY (id);

ALTER TABLE public.training_modules ADD CONSTRAINT training_modules_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.training_modules ADD CONSTRAINT training_modules_module_type_check CHECK ((module_type = ANY (ARRAY['ambassador'::text, 'safety'::text, 'peer_guide'::text, 'onboarding'::text, 'general'::text])));
ALTER TABLE public.training_modules ADD CONSTRAINT training_modules_pkey PRIMARY KEY (id);
ALTER TABLE public.training_modules ADD CONSTRAINT training_modules_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text, 'archived'::text])));

ALTER TABLE public.user_milestones ADD CONSTRAINT user_milestones_pkey PRIMARY KEY (id);
ALTER TABLE public.user_milestones ADD CONSTRAINT user_milestones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_milestones ADD CONSTRAINT user_milestones_user_id_milestone_key_key UNIQUE (user_id, milestone_key);

ALTER TABLE public.user_notifications ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);
ALTER TABLE public.user_notifications ADD CONSTRAINT user_notifications_status_check CHECK ((status = ANY (ARRAY['unread'::text, 'read'::text, 'archived'::text])));
ALTER TABLE public.user_notifications ADD CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_commercial_recommendation_mode_check CHECK ((commercial_recommendation_mode = ANY (ARRAY['minimal'::text, 'contextual'::text, 'off'::text])));
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);

ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);

ALTER TABLE public.user_referral_identities ADD CONSTRAINT user_referral_identities_code_key UNIQUE (code);
ALTER TABLE public.user_referral_identities ADD CONSTRAINT user_referral_identities_pkey PRIMARY KEY (id);
ALTER TABLE public.user_referral_identities ADD CONSTRAINT user_referral_identities_state_check CHECK ((state = ANY (ARRAY['active'::text, 'suspended'::text])));
ALTER TABLE public.user_referral_identities ADD CONSTRAINT user_referral_identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.user_referral_touches ADD CONSTRAINT user_referral_touches_pkey PRIMARY KEY (id);
ALTER TABLE public.user_referral_touches ADD CONSTRAINT user_referral_touches_referral_identity_id_fkey FOREIGN KEY (referral_identity_id) REFERENCES user_referral_identities(id) ON DELETE CASCADE;

ALTER TABLE public.user_task_states ADD CONSTRAINT user_task_states_pkey PRIMARY KEY (id);
ALTER TABLE public.user_task_states ADD CONSTRAINT user_task_states_state_check CHECK ((state = ANY (ARRAY['not_started'::text, 'complete'::text, 'deferred'::text, 'irrelevant'::text])));
ALTER TABLE public.user_task_states ADD CONSTRAINT user_task_states_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.user_task_states ADD CONSTRAINT user_task_states_user_id_task_code_key UNIQUE (user_id, task_code);

ALTER TABLE public.user_tasks ADD CONSTRAINT user_tasks_pkey PRIMARY KEY (id);
ALTER TABLE public.user_tasks ADD CONSTRAINT user_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.user_tasks ADD CONSTRAINT user_tasks_user_id_task_id_key UNIQUE (user_id, task_id);

ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE public.webhook_events ADD CONSTRAINT webhook_events_pkey PRIMARY KEY (id);
ALTER TABLE public.webhook_events ADD CONSTRAINT webhook_events_provider_external_event_id_key UNIQUE (provider, external_event_id);
ALTER TABLE public.webhook_events ADD CONSTRAINT webhook_events_state_check CHECK ((state = ANY (ARRAY['received'::text, 'processed'::text, 'failed'::text])));

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.app_release_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arrival_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.browser_return_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_reconciliation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_tombstones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_rights_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_rights_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nia_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nia_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nia_tool_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_action_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_redirect_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisation_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_link_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_entry_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofpoints_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_activation_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_content_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_touches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_lifecycle_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referral_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referral_touches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES
-- ============================================================

CREATE POLICY "Release policies read all" ON public.app_release_policies FOR SELECT USING (true);

CREATE POLICY "Profiles delete own" ON public.arrival_profiles FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Profiles insert own" ON public.arrival_profiles FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Profiles read own" ON public.arrival_profiles FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Profiles update own" ON public.arrival_profiles FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Browser return events read own" ON public.browser_return_events FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Budget items delete own" ON public.budget_items FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Budget items insert own" ON public.budget_items FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Budget items read own" ON public.budget_items FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Budget items update own" ON public.budget_items FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Checkout sessions read own" ON public.checkout_sessions FOR SELECT USING ((auth.uid() = actor_id));

CREATE POLICY "Consent records read own" ON public.consent_records FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Conversion claims insert own" ON public.conversion_claims FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Conversion claims read own" ON public.conversion_claims FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY users_delete_sessions ON public.custom_sessions FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY users_insert_sessions ON public.custom_sessions FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY users_read_sessions ON public.custom_sessions FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY anyone_insert_custom_users ON public.custom_users FOR INSERT USING (true) WITH CHECK (true);
CREATE POLICY users_read_custom_users ON public.custom_users FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Data rights exports read own" ON public.data_rights_exports FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Data rights requests insert own" ON public.data_rights_requests FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Data rights requests read own" ON public.data_rights_requests FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Device registrations read own" ON public.device_registrations FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Entitlements read own" ON public.entitlements FOR SELECT USING ((auth.uid() = actor_id));

CREATE POLICY "Goals delete own" ON public.goals FOR DELETE USING ((auth.uid() = owner_user_id));
CREATE POLICY "Goals insert own" ON public.goals FOR INSERT USING (true) WITH CHECK ((auth.uid() = owner_user_id));
CREATE POLICY "Goals read own" ON public.goals FOR SELECT USING ((auth.uid() = owner_user_id));
CREATE POLICY "Goals update own" ON public.goals FOR UPDATE USING ((auth.uid() = owner_user_id)) WITH CHECK ((auth.uid() = owner_user_id));

CREATE POLICY household_invitations_delete_primary_inviter_or_admin ON public.household_invitations FOR DELETE USING ((COALESCE(beginly_is_admin(), false) OR (invited_by = auth.uid()) OR beginly_household_is_primary(household_id)));
CREATE POLICY household_invitations_insert_primary_or_admin ON public.household_invitations FOR INSERT USING (true) WITH CHECK ((COALESCE(beginly_is_admin(), false) OR ((invited_by = auth.uid()) AND beginly_household_is_primary(household_id))));
CREATE POLICY household_invitations_select_primary_inviter_or_admin ON public.household_invitations FOR SELECT USING ((COALESCE(beginly_is_admin(), false) OR (invited_by = auth.uid()) OR beginly_household_is_primary(household_id)));
CREATE POLICY household_invitations_update_primary_inviter_or_admin ON public.household_invitations FOR UPDATE USING ((COALESCE(beginly_is_admin(), false) OR (invited_by = auth.uid()) OR beginly_household_is_primary(household_id))) WITH CHECK ((COALESCE(beginly_is_admin(), false) OR (invited_by = auth.uid()) OR beginly_household_is_primary(household_id)));

CREATE POLICY household_members_delete_self_primary_or_admin ON public.household_members FOR DELETE USING ((COALESCE(beginly_is_admin(), false) OR (user_id = auth.uid()) OR beginly_household_is_primary(household_id)));
CREATE POLICY household_members_insert_self_primary_or_admin ON public.household_members FOR INSERT USING (true) WITH CHECK ((COALESCE(beginly_is_admin(), false) OR (user_id = auth.uid()) OR beginly_household_is_primary(household_id)));
CREATE POLICY household_members_select_member_or_admin ON public.household_members FOR SELECT USING ((COALESCE(beginly_is_admin(), false) OR (user_id = auth.uid()) OR beginly_household_is_member(household_id)));
CREATE POLICY household_members_update_self_primary_or_admin ON public.household_members FOR UPDATE USING ((COALESCE(beginly_is_admin(), false) OR (user_id = auth.uid()) OR beginly_household_is_primary(household_id))) WITH CHECK ((COALESCE(beginly_is_admin(), false) OR (user_id = auth.uid()) OR beginly_household_is_primary(household_id)));

CREATE POLICY households_delete_primary_or_admin ON public.households FOR DELETE USING ((COALESCE(beginly_is_admin(), false) OR beginly_household_is_primary(id)));
CREATE POLICY households_insert_creator ON public.households FOR INSERT USING (true) WITH CHECK ((COALESCE(beginly_is_admin(), false) OR (created_by = auth.uid())));
CREATE POLICY households_select_member_or_admin ON public.households FOR SELECT USING ((COALESCE(beginly_is_admin(), false) OR beginly_household_is_member(id)));
CREATE POLICY households_update_primary_or_admin ON public.households FOR UPDATE USING ((COALESCE(beginly_is_admin(), false) OR beginly_household_is_primary(id))) WITH CHECK ((COALESCE(beginly_is_admin(), false) OR beginly_household_is_primary(id)));

CREATE POLICY "Journey plans read own" ON public.journey_plans FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Life events read own" ON public.life_events FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Migration profiles delete own" ON public.migration_profiles FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Migration profiles insert own" ON public.migration_profiles FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Migration profiles read own" ON public.migration_profiles FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Migration profiles update own" ON public.migration_profiles FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Nia conversations insert own" ON public.nia_conversations FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Nia conversations read own" ON public.nia_conversations FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Nia messages read own conversation" ON public.nia_messages FOR SELECT USING ((conversation_id IN ( SELECT nia_conversations.id
FROM nia_conversations
WHERE (nia_conversations.user_id = auth.uid()))));

CREATE POLICY "Nia tool proposals insert own conversation" ON public.nia_tool_proposals FOR INSERT USING (true) WITH CHECK ((conversation_id IN ( SELECT nia_conversations.id
FROM nia_conversations
WHERE (nia_conversations.user_id = auth.uid()))));
CREATE POLICY "Nia tool proposals read own conversation" ON public.nia_tool_proposals FOR SELECT USING ((conversation_id IN ( SELECT nia_conversations.id
FROM nia_conversations
WHERE (nia_conversations.user_id = auth.uid()))));
CREATE POLICY "Nia tool proposals update own conversation" ON public.nia_tool_proposals FOR UPDATE USING ((conversation_id IN ( SELECT nia_conversations.id
FROM nia_conversations
WHERE (nia_conversations.user_id = auth.uid())))) WITH CHECK ((conversation_id IN ( SELECT nia_conversations.id
FROM nia_conversations
WHERE (nia_conversations.user_id = auth.uid()))));

CREATE POLICY "Beginly admins manage notification delivery log" ON public.notification_delivery_log FOR ALL USING (beginly_is_admin()) WITH CHECK (beginly_is_admin());

CREATE POLICY "Notifications read own" ON public.notification_outbox FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Notifications update own" ON public.notification_outbox FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users manage own notification preferences" ON public.notification_preferences FOR ALL USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Onboarding states delete own" ON public.onboarding_states FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Onboarding states insert own" ON public.onboarding_states FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Onboarding states read own" ON public.onboarding_states FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Onboarding states update own" ON public.onboarding_states FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Opportunities read active" ON public.opportunities FOR SELECT USING ((status = 'active'::text));

CREATE POLICY "Action sessions read own" ON public.opportunity_action_sessions FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Opportunity interactions insert own" ON public.opportunity_interactions FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Opportunity interactions read own" ON public.opportunity_interactions FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Organisation memberships read own" ON public.organisation_memberships FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Outbound policies read approved" ON public.outbound_link_policies FOR SELECT USING ((status = 'approved'::text));

CREATE POLICY "Beginly admins read partner CRM" ON public.partner_leads FOR SELECT USING (beginly_is_admin());
CREATE POLICY "Beginly admins update partner CRM" ON public.partner_leads FOR UPDATE USING (beginly_is_admin()) WITH CHECK (beginly_is_admin());

CREATE POLICY "Product entry states insert own" ON public.product_entry_states FOR INSERT USING (true) WITH CHECK ((auth.uid() = actor_id));
CREATE POLICY "Product entry states read own" ON public.product_entry_states FOR SELECT USING ((auth.uid() = actor_id));
CREATE POLICY "Product entry states update own" ON public.product_entry_states FOR UPDATE USING ((auth.uid() = actor_id)) WITH CHECK ((auth.uid() = actor_id));

CREATE POLICY "Product recommendations read own" ON public.product_recommendations FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Products read all" ON public.products FOR SELECT USING (true);

CREATE POLICY "Profile facts delete own" ON public.profile_facts FOR DELETE USING ((profile_id IN ( SELECT migration_profiles.id
FROM migration_profiles
WHERE (migration_profiles.user_id = auth.uid()))));
CREATE POLICY "Profile facts insert own" ON public.profile_facts FOR INSERT USING (true) WITH CHECK ((profile_id IN ( SELECT migration_profiles.id
FROM migration_profiles
WHERE (migration_profiles.user_id = auth.uid()))));
CREATE POLICY "Profile facts read own" ON public.profile_facts FOR SELECT USING ((profile_id IN ( SELECT migration_profiles.id
FROM migration_profiles
WHERE (migration_profiles.user_id = auth.uid()))));
CREATE POLICY "Profile facts update own" ON public.profile_facts FOR UPDATE USING ((profile_id IN ( SELECT migration_profiles.id
FROM migration_profiles
WHERE (migration_profiles.user_id = auth.uid())))) WITH CHECK ((profile_id IN ( SELECT migration_profiles.id
FROM migration_profiles
WHERE (migration_profiles.user_id = auth.uid()))));

CREATE POLICY "Proofpoints read own" ON public.proofpoints_ledger FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Providers read all" ON public.providers FOR SELECT USING (true);

CREATE POLICY "Content publications read published" ON public.public_content_publications FOR SELECT USING ((publication_state = 'published'::text));

CREATE POLICY "Beginly admins manage referral disclosures" ON public.referral_disclosures FOR ALL USING (beginly_is_admin()) WITH CHECK (beginly_is_admin());

CREATE POLICY "Reminders delete own" ON public.reminder_prefs FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Reminders insert own" ON public.reminder_prefs FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Reminders read own" ON public.reminder_prefs FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Reminders update own" ON public.reminder_prefs FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Beginly admins manage safety cases" ON public.safety_cases FOR ALL USING (beginly_is_admin()) WITH CHECK (beginly_is_admin());

CREATE POLICY "Admins manage scam reports" ON public.scam_reports FOR ALL USING (beginly_is_admin()) WITH CHECK (beginly_is_admin());
CREATE POLICY "Users own scam reports" ON public.scam_reports FOR ALL USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Lifecycle actions read own subscription" ON public.subscription_lifecycle_actions FOR SELECT USING ((subscription_id IN ( SELECT subscriptions.id
FROM subscriptions
WHERE (subscriptions.actor_id = auth.uid()))));

CREATE POLICY "Subscriptions read own" ON public.subscriptions FOR SELECT USING ((auth.uid() = actor_id));

CREATE POLICY "Support case events read own case" ON public.support_case_events FOR SELECT USING ((case_id IN ( SELECT support_cases.id
FROM support_cases
WHERE (support_cases.user_id = auth.uid()))));

CREATE POLICY "Support cases insert own" ON public.support_cases FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Support cases read own" ON public.support_cases FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Support tickets delete own" ON public.support_tickets FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Support tickets insert own" ON public.support_tickets FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Support tickets read own" ON public.support_tickets FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Support tickets update own" ON public.support_tickets FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Task instances read own plan" ON public.task_instances FOR SELECT USING ((journey_plan_id IN ( SELECT journey_plans.id
FROM journey_plans
WHERE (journey_plans.user_id = auth.uid()))));

CREATE POLICY "Users insert own milestones" ON public.user_milestones FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users read own milestones" ON public.user_milestones FOR SELECT USING (((auth.uid() = user_id) OR beginly_is_admin()));
CREATE POLICY "Users update own milestones" ON public.user_milestones FOR UPDATE USING (((auth.uid() = user_id) OR beginly_is_admin())) WITH CHECK (((auth.uid() = user_id) OR beginly_is_admin()));

CREATE POLICY "Users create own notifications" ON public.user_notifications FOR INSERT USING (true) WITH CHECK (((auth.uid() = user_id) OR beginly_is_admin()));
CREATE POLICY "Users read own notifications" ON public.user_notifications FOR SELECT USING (((auth.uid() = user_id) OR beginly_is_admin()));
CREATE POLICY "Users update own notifications" ON public.user_notifications FOR UPDATE USING (((auth.uid() = user_id) OR beginly_is_admin())) WITH CHECK (((auth.uid() = user_id) OR beginly_is_admin()));

CREATE POLICY "Preferences delete own" ON public.user_preferences FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Preferences insert own" ON public.user_preferences FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Preferences read own" ON public.user_preferences FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Preferences update own" ON public.user_preferences FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "User profiles delete own" ON public.user_profiles FOR DELETE USING ((auth.uid() = id));
CREATE POLICY "User profiles insert own" ON public.user_profiles FOR INSERT USING (true) WITH CHECK ((auth.uid() = id));
CREATE POLICY "User profiles read own" ON public.user_profiles FOR SELECT USING ((auth.uid() = id));
CREATE POLICY "User profiles update own" ON public.user_profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));

CREATE POLICY "Referral identities insert own" ON public.user_referral_identities FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Referral identities read own" ON public.user_referral_identities FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "User referral touches read own" ON public.user_referral_touches FOR SELECT USING ((referral_identity_id IN ( SELECT user_referral_identities.id
FROM user_referral_identities
WHERE (user_referral_identities.user_id = auth.uid()))));

CREATE POLICY "Task states delete own" ON public.user_task_states FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Task states insert own" ON public.user_task_states FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Task states read own" ON public.user_task_states FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Task states update own" ON public.user_task_states FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Tasks delete own" ON public.user_tasks FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Tasks insert own" ON public.user_tasks FOR INSERT USING (true) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Tasks read own" ON public.user_tasks FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Tasks update own" ON public.user_tasks FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Allow signup" ON public.users FOR INSERT USING (true) WITH CHECK (true);
CREATE POLICY "Users delete own row" ON public.users FOR DELETE USING ((auth.uid() = id));
CREATE POLICY "Users insert own row" ON public.users FOR INSERT USING (true) WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users read own data" ON public.users FOR SELECT USING ((auth.uid() = id));
CREATE POLICY "Users read own row" ON public.users FOR SELECT USING ((auth.uid() = id));
CREATE POLICY "Users update own data" ON public.users FOR UPDATE USING ((auth.uid() = id));
CREATE POLICY "Users update own row" ON public.users FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));
