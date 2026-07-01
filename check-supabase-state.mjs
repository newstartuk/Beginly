// Check what Supabase tables exist and compare against what v1.3.6 needs
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cpzxtpwajxqbgyqtbbmx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwenh0cHdhanhxYmd5cXRiYm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NDQ1MCwiZXhwIjoyMDk2NjYwNDUwfQ.zniwTnx6SqswyGly2k2TkdEwihnUHD6wYlGe7Oulk6Q';

const supabase = createClient(supabaseUrl, serviceKey);

// Tables that v1.3.6 needs
const neededTables = [
  'notification_preferences',
  'user_notifications',
  'notification_delivery_log',
  'safety_cases',
  'user_milestones',
];

// Columns to check for key tables
const tableColumns = {
  'notification_preferences': ['user_id', 'email_enabled', 'in_app_enabled', 'opportunity_enabled', 'safety_enabled', 'weekly_digest_enabled'],
  'user_notifications': ['user_id', 'title', 'body', 'category', 'status', 'metadata', 'read_at'],
  'notification_delivery_log': ['user_id', 'notification_id', 'channel', 'status', 'provider_reference', 'error_message'],
  'safety_cases': ['title', 'category', 'severity', 'status', 'source_type', 'source_id', 'assigned_to', 'resolution_note'],
  'user_milestones': ['user_id', 'milestone_key', 'title', 'earned_at', 'metadata'],
  'opportunities': ['status', 'archived_at', 'approved_at', 'review_notes', 'updated_at'],
  'partner_leads': ['owner', 'acknowledgement_sent_at', 'conversion_stage', 'follow_up_notes'],
  'referral_disclosures': ['status'],
  'content_items': ['canonical_path', 'publication_notes', 'source_status'],
  'source_register': ['source_owner'],
};

async function checkTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  if (error) {
    if (error.message.includes('does not exist') || error.code === '42P01') {
      return { table: tableName, exists: false, status: 'MISSING' };
    }
    return { table: tableName, exists: true, status: 'ERROR: ' + error.message };
  }
  return { table: tableName, exists: true, status: 'EXISTS' };
}

async function checkColumns(tableName, expectedCols) {
  const { data, error } = await supabase
    .from(tableName)
    .select(expectedCols.join(','))
    .limit(1);
  if (error) return { table: tableName, columns: 'ERROR: ' + error.message };
  return { table: tableName, columns: 'OK - all expected columns present' };
}

console.log('=== Supabase Schema State Check ===\n');
console.log('--- Tables existence ---');
for (const t of neededTables) {
  const r = await checkTable(t);
  console.log(`[${r.status}] ${r.table}`);
}
console.log('\n--- Key column checks (v1.3.6 additions) ---');
for (const [t, cols] of Object.entries(tableColumns)) {
  const r = await checkColumns(t, cols);
  console.log(`[${r.columns === 'ERROR: ' + r.columns.split('ERROR: ')[1] ? 'COL ERROR' : 'OK'}] ${t}: ${r.columns}`);
}

// Check RLS status
console.log('\n--- RLS Status for key tables ---');
const rlsTables = ['notification_preferences', 'user_notifications', 'safety_cases', 'user_milestones', 'opportunities', 'partner_leads'];
for (const t of rlsTables) {
  const { data, error } = await supabase.rpc('pg_catalog.format pg_get_ruledef', { rule_name: t }).catch(() => null);
  // Direct query approach
  const { data: rel, error: relerr } = await supabase.rpc('has_rls', { tablename: t }).catch(() => null);
  // Try direct SQL
  console.log(`[${t}] RLS check via table query...`);
}

// Check custom_users and custom_sessions
console.log('\n--- Custom auth tables ---');
const { data: cu, error: cuerr } = await supabase.from('custom_users').select('id,user_id,email').limit(1);
console.log('custom_users:', cuerr ? 'ERROR: ' + cuerr.message : 'EXISTS (' + (cu?.length || 0) + ' rows)');
const { data: cs, error: cserr } = await supabase.from('custom_sessions').select('*').limit(1);
console.log('custom_sessions:', cserr ? 'ERROR: ' + cserr.message : 'EXISTS (' + (cs?.length || 0) + ' rows)');
