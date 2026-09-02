-- Tracks the last time a weekly/daily/etc. task-reminder email was actually sent to a
-- user, so app/api/cron/task-reminders/route.ts can honour each user's chosen
-- reminder_prefs.frequency instead of re-sending on every cron run.
ALTER TABLE public.reminder_prefs ADD COLUMN last_sent_at timestamp with time zone;
