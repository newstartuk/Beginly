"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ArrivalProfile, AccommodationType, EnglishLevel } from "@/types";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Home,
  CheckCircle,
} from "lucide-react";

const CITIES = [
  "London", "Birmingham", "Manchester", "Glasgow", "Edinburgh",
  "Leeds", "Liverpool", "Bristol", "Sheffield", "Newcastle",
  "Nottingham", "Southampton", "Cardiff", "Belfast", "Other",
];

const UNIVERSITIES = [
  "University of Oxford", "University of Cambridge", "University of Edinburgh",
  "University of Manchester", "University of Glasgow", "University of Birmingham",
  "King's College London", "University of Bristol", "University of Warwick",
  "University of Sheffield", "University of Nottingham", "University of Southampton",
  "University of Liverpool", "University of Leeds", "University of Newcastle",
  "University of Cardiff", "Queen's University Belfast", "Durham University",
  "Imperial College London", "London School of Economics",
  "Other",
];

const ACCOMMODATION_OPTIONS: { value: AccommodationType; label: string; desc: string }[] = [
  { value: "university_accommodation", label: "University halls of residence", desc: "On-campus student housing" },
  { value: "private_rental", label: "Private rented flat/house", desc: "Renting from a landlord" },
  { value: "homestay", label: "Homestay", desc: "Living with a host family — meals included" },
  { value: "temporary", label: "Temporary (hotel/Airbnb/hostel)", desc: "Short-term while I find something permanent" },
  { value: "family_friend", label: "Living with family or friends", desc: "Already have a place to stay" },
  { value: "not_secured", label: "Not yet arranged", desc: "I still need to find accommodation" },
];

const ENGLISH_OPTIONS: { value: EnglishLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "Learning the basics" },
  { value: "intermediate", label: "Intermediate", desc: "I can have everyday conversations" },
  { value: "advanced", label: "Advanced / Fluent", desc: "Confident in English" },
];

const STEPS = [
  { label: "Type", icon: User },
  { label: "Status", icon: Calendar },
  { label: "Location", icon: MapPin },
  { label: "Accommodation", icon: Home },
  { label: "Optional", icon: CheckCircle },
];

const ONSBOARDING_STORAGE_KEY = "nsk_onboarding_state";

function saveOnboardingState(state: { step: number; profile: Partial<ArrivalProfile> }) {
  try {
    localStorage.setItem(ONSBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function loadOnboardingState(): { step: number; profile: Partial<ArrivalProfile> } | null {
  try {
    const raw = localStorage.getItem(ONSBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.step === "number") return parsed;
    return null;
  } catch { return null; }
}

function clearOnboardingState() {
  try { localStorage.removeItem(ONSBOARDING_STORAGE_KEY); } catch { /* ignore */ }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState<Partial<ArrivalProfile>>({
    arrivalType: "international_student",
    arrivalStatus: "not_arrived",
    interestedInWork: false,
    profileCompleted: false,
  });
  const [showNotifBanner, setShowNotifBanner] = useState(false);

  // Auth check on mount
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/signup"); return; }
      setAuthChecked(true);

      // Check if already completed
      const { data: profileData } = await supabase
        .from("arrival_profiles")
        .select("arrival_type")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profileData) { router.push("/dashboard"); return; }

      // Restore saved step/progress
      const saved = loadOnboardingState();
      if (saved) {
        setStep(saved.step);
        setProfile((p) => ({ ...p, ...saved.profile }));
      }
    }
    checkAuth();
  }, [router]);

  // Persist step + profile on every change
  useEffect(() => {
    if (!authChecked) return;
    saveOnboardingState({ step, profile });
  }, [step, profile, authChecked]);

  const update = (key: keyof ArrivalProfile, value: unknown) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    clearOnboardingState();

    // Upsert arrival profile
    await supabase.from("arrival_profiles").upsert({
      user_id: user.id,
      arrival_type: profile.arrivalType as string || "international_student",
      status: profile.arrivalStatus as string || "not_arrived",
      arrival_date: profile.arrivalDate || null,
      city: profile.city || null,
      university: profile.university || null,
      accommodation: profile.accommodationType as string || "not_secured",
      nationality: profile.nationality || null,
      english_level: profile.englishLevel as string || null,
      work_interest: profile.interestedInWork ?? false,
    }, { onConflict: "user_id" });

    // Mark user profile complete
    await supabase
      .from("users")
      .update({ profile_completed: true })
      .eq("id", user.id);

    await new Promise((r) => setTimeout(r, 400));
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      setShowNotifBanner(true);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const finishWithNotifs = async (permission: NotificationPermission) => {
    try { localStorage.setItem("beginly_notification_permission", permission); } catch { /* ignore */ }
    setShowNotifBanner(false);
    await new Promise((r) => setTimeout(r, 200));
    router.push("/dashboard");
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) { finishWithNotifs("denied"); return; }
    const perm = await Notification.requestPermission();
    finishWithNotifs(perm);
  };

  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-navy">Tell us about your arrival</h1>
          <p className="text-sm text-muted mt-1">Step {step + 1} of {STEPS.length} — takes about 2 minutes</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= step ? "bg-primary" : "bg-civic-100"
              }`}
            />
          ))}
        </div>

        <div className="card space-y-4">
          {/* Step 0 — Arrival type */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="input-label">I am arriving as a...</label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center gap-3 p-4 border-2 border-primary bg-teal-50 rounded-xl">
                    <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">International student</p>
                      <p className="text-xs text-muted">Coming to study at a UK university</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Arrival status & date */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="input-label">What is your arrival status?</label>
                <div className="space-y-2 mt-1">
                  {[
                    { value: "not_arrived", label: "Not arrived yet", desc: "Planning my journey" },
                    { value: "arriving_soon", label: "Arriving within the next 2 weeks", desc: "Very soon!" },
                    { value: "arrived", label: "Already arrived in the UK", desc: "Just started settling in" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("arrivalStatus", opt.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        profile.arrivalStatus === opt.value
                          ? "border-primary bg-teal-50"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className="text-sm font-semibold text-navy">{opt.label}</p>
                      <p className="text-xs text-muted">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {profile.arrivalStatus !== "not_arrived" && (
                <div>
                  <label className="input-label">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Expected or actual arrival date
                  </label>
                  <input
                    type="date"
                    value={profile.arrivalDate || ""}
                    onChange={(e) => update("arrivalDate", e.target.value)}
                    className="input-field"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2 — City & University */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="input-label">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Which city are you going to?
                </label>
                <select
                  value={profile.city || ""}
                  onChange={(e) => update("city", e.target.value)}
                  className="select-field"
                >
                  <option value="">Select your city...</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Which university?</label>
                <select
                  value={profile.university || ""}
                  onChange={(e) => update("university", e.target.value)}
                  className="select-field"
                >
                  <option value="">Select your university...</option>
                  {UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3 — Accommodation */}
          {step === 3 && (
            <div className="space-y-3">
              <label className="input-label">
                <Home className="w-3 h-3 inline mr-1" />
                What type of accommodation do you have?
              </label>
              {ACCOMMODATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("accommodationType", opt.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    profile.accommodationType === opt.value
                      ? "border-primary bg-teal-50"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-navy">{opt.label}</p>
                  <p className="text-xs text-muted">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 4 — Optional */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="input-label">Nationality (optional)</label>
                <input
                  type="text"
                  value={profile.nationality || ""}
                  onChange={(e) => update("nationality", e.target.value)}
                  className="input-field"
                  placeholder="e.g. Nigerian, Indian, Chinese..."
                />
              </div>
              <div>
                <label className="input-label">Your English level (optional)</label>
                <div className="space-y-2">
                  {ENGLISH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("englishLevel", opt.value)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        profile.englishLevel === opt.value
                          ? "border-primary bg-teal-50"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className="text-sm font-semibold text-navy">{opt.label}</p>
                      <p className="text-xs text-muted">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-civic-50 border border-civic-100 rounded-xl">
                <input
                  type="checkbox"
                  id="workInterest"
                  checked={profile.interestedInWork ?? false}
                  onChange={(e) => update("interestedInWork", e.target.checked)}
                  className="accent-primary mt-0.5"
                />
                <label htmlFor="workInterest" className="text-sm text-navy cursor-pointer">
                  <strong>I am interested in working part-time</strong> — we'll add jobs and NI number tasks to your roadmap
                </label>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <p className="text-sm font-semibold text-navy">Meet Nia — your AI settlement guide</p>
                </div>
                <p className="text-xs text-civic-600 leading-relaxed">
                  As you work through your roadmap, you can chat with <strong>Nia</strong> — she can explain tasks, point you to official sources, and help you navigate UK daily life.
                </p>
                <p className="text-xs text-civic-500 leading-relaxed">
                  <strong className="text-amber-600">Note:</strong> Nia is an AI orientation tool, not a regulated adviser. For immigration, legal, or financial advice, speak to a qualified professional.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notification permission banner */}
        {showNotifBanner && (
          <div className="card bg-teal-50 border-primary/30 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white text-sm">🔔</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">Enable task reminders?</p>
                <p className="text-xs text-civic-600 mt-0.5">
                  Beginly can notify you when tasks are due — no spam, unsubscribe anytime.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestNotifications}
                className="btn-primary text-sm flex-1 justify-center"
              >
                Enable reminders
              </button>
              <button
                onClick={() => setShowNotifBanner(false)}
                className="btn-ghost text-sm flex-1 justify-center"
              >
                Not now
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 ? (
            <button onClick={back} className="btn-ghost flex-1 justify-center">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button onClick={() => router.push("/dashboard")} className="btn-ghost flex-1 justify-center">
              Skip for now
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              disabled={
                (step === 1 && !profile.arrivalStatus) ||
                (step === 2 && (!profile.city || !profile.university))
              }
              className="btn-primary flex-1 justify-center disabled:opacity-40"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="btn-primary flex-1 justify-center disabled:opacity-50"
            >
              {loading ? "Saving..." : <><CheckCircle className="w-4 h-4" /> Build my roadmap</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
