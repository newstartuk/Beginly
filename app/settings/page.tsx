"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, supabase } from "@/lib/supabase";
import type { ReminderPrefs } from "@/types";
import { User, Bell, Trash2, CheckCircle, BellRing } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import Navigation from "@/components/Navigation";
import SettingsSkeleton from "@/components/SettingsSkeleton";

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  profile_completed?: boolean;
}

interface DisplayProfile {
  arrival_type?: string;
  status?: string;
  arrival_date?: string;
  city?: string;
  university?: string;
  accommodation?: string;
  nationality?: string;
  english_level?: string;
  work_interest?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<DisplayUser | null>(null);
  const [profile, setProfile] = useState<DisplayProfile | null>(null);
  const [reminders, setReminders] = useState<ReminderPrefs>({ emailReminders: false, frequency: "weekly" });
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    async function loadSession() {
      const supabase = getSupabase();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }

      setUser({
        id: authUser.id,
        name: (authUser.user_metadata?.name as string | undefined) ?? authUser.email?.split("@")[0] ?? "?",
        email: authUser.email ?? "",
        profile_completed: !!(authUser.user_metadata?.profile_completed),
      });

      const { data: profileData } = await supabase
        .from("arrival_profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (profileData) {
        setProfile({
          arrival_type: profileData.arrival_type ?? undefined,
          status: profileData.status ?? undefined,
          arrival_date: profileData.arrival_date ?? undefined,
          city: profileData.city ?? undefined,
          university: profileData.university ?? undefined,
          accommodation: profileData.accommodation ?? undefined,
          nationality: profileData.nationality ?? undefined,
          english_level: profileData.english_level ?? undefined,
          work_interest: profileData.work_interest ?? undefined,
        });
      }

      const { data: reminderData } = await supabase
        .from("reminder_prefs")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (reminderData) {
        setReminders({
          emailReminders: reminderData.email_reminders ?? false,
          frequency: (reminderData.frequency as ReminderPrefs["frequency"]) ?? "weekly",
        });
      }

      if ("Notification" in window) {
        setNotifPerm(Notification.permission);
      }
    }
    loadSession();
  }, [router]);

  const handleReminderSave = async () => {
    if (!user) return;
    setSaved(true);
    await supabase.from("reminder_prefs").upsert({
      user_id: user.id,
      email_reminders: reminders.emailReminders,
      frequency: reminders.frequency,
    }, { onConflict: "user_id" });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (!user) return;
    await supabase.from("users").delete().eq("id", user.id);
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) return <SettingsSkeleton />;

  return (
    <Navigation>
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        <h1 className="text-xl font-bold text-navy">Settings</h1>

        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-navy">Your profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted mb-1">Name</label>
              <input type="text" value={user?.name ?? ""} readOnly className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Email</label>
              <input type="email" value={user?.email ?? ""} readOnly className="input-field" />
            </div>
            {profile && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">City</label>
                  <p className="text-sm font-medium text-navy">{profile.city ?? "—"}</p>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">University</label>
                  <p className="text-sm font-medium text-navy">{profile.university ?? "—"}</p>
                </div>
              </div>
            )}
            <a href="/onboarding" className="text-xs text-primary hover:underline block mt-1">
              Edit arrival profile →
            </a>
          </div>
        </div>

        {/* Push notifications */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <BellRing className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-navy">Browser notifications</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy">Browser push notifications</p>
                <p className="text-xs text-muted">Get alerts for upcoming tasks in this browser</p>
              </div>
              <div
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  notifPerm === "granted"
                    ? "bg-green-100 text-green-700"
                    : notifPerm === "denied"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {notifPerm === "granted" ? "Enabled" : notifPerm === "denied" ? "Blocked" : "Not set"}
              </div>
            </div>
            {"Notification" in window ? (
              notifPerm === "default" ? (
                <button
                  onClick={async () => {
                    const perm = await Notification.requestPermission();
                    setNotifPerm(perm);
                    try { localStorage.setItem("beginly_notification_permission", perm); } catch { /* ignore */ }
                  }}
                  className="btn-primary text-sm"
                >
                  Enable notifications
                </button>
              ) : notifPerm === "granted" ? (
                <p className="text-xs text-muted">Notifications are enabled. To disable, revoke the permission in your browser settings for this site.</p>
              ) : (
                <p className="text-xs text-amber-600">
                  Notifications are blocked.{" "}
                  <a href="https://support.google.com/chrome/answer/3222708" target="_blank" rel="noopener noreferrer" className="underline">Learn how to unblock them</a>.
                </p>
              )
            ) : (
              <p className="text-xs text-muted">Notifications are not supported in this browser.</p>
            )}
          </div>
        </div>

        {/* Reminders */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-navy">Reminder preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy">Email reminders</p>
                <p className="text-xs text-muted">Receive reminders for upcoming tasks</p>
              </div>
              <button
                onClick={() => setReminders((r) => ({ ...r, emailReminders: !r.emailReminders }))}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  reminders.emailReminders ? "bg-primary" : "bg-civic-200"
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  reminders.emailReminders ? "right-1" : "left-1"
                }`} />
              </button>
            </div>
            {reminders.emailReminders && (
              <div>
                <label className="block text-xs text-muted mb-1.5">Reminder frequency</label>
                <select
                  value={reminders.frequency}
                  onChange={(e) => setReminders((r) => ({ ...r, frequency: e.target.value as ReminderPrefs["frequency"] }))}
                  className="select-field"
                >
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly summary</option>
                  <option value="biweekly">Every two weeks</option>
                  <option value="monthly">Monthly roundup</option>
                </select>
              </div>
            )}
            <button onClick={handleReminderSave} className="btn-primary">
              {saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : "Save preferences"}
            </button>
          </div>
        </div>

        {/* Delete */}
        <div className="card border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-5 h-5 text-danger" />
            <h2 className="text-base font-semibold text-danger">Delete account &amp; data</h2>
          </div>
          <p className="text-sm text-civic-600 mb-4">
            This deletes all your data from Beginly. You have 14 days to reverse the deletion after which your profile will be taken off completely.
          </p>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
              Delete my data
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm text-red-700 font-medium">Are you sure? This is permanent.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-4 py-2 rounded-xl">
                  Yes, delete everything
                </button>
                <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Navigation>
  );
}
